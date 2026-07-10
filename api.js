/**
 * ==========================================================================
 * import.js — Controller หลักของ Excel Import Wizard
 * ==========================================================================
 */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const state = {
    step: 1,
    fileMeta: null,
    sheets: [],
    selectedSheetName: null,
    headers: [],
    dataRows: [],
    mappingList: [],
    mappedRows: [],
    validation: null,
    existing: { projects: [], expenses: [], categories: [], importHistory: [] }
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    wireSidebarBasics();
    wireDropzone();
    wireMappingToolbar();
    wireWizardNav();
    wireImportModeAndActions();
    $('#btnShowHistory').addEventListener('click', () => {
      document.getElementById('historySection').scrollIntoView({ behavior: 'smooth' });
    });

    await loadExistingData();
    renderHistoryTable();
  }

  async function loadExistingData() {
    try {
      if (!Api.isConfigured()) {
        toast('ยังไม่ได้ตั้งค่า Google Sheets ใน config.js — จะยังเลือกไฟล์/ดูตัวอย่างได้ แต่ Import จริงจะไม่สำเร็จ', 'error');
        return;
      }
      const data = await Api.fetchAll();
      state.existing.projects = data.projects || [];
      state.existing.expenses = data.expenses || [];
      state.existing.categories = data.categories || [];
      state.existing.importHistory = data.importHistory || [];
    } catch (err) {
      toast('โหลดข้อมูลเดิมไม่สำเร็จ: ' + err.message, 'error');
    }
  }

  /* ------------------------------------------------------------------ */
  /* SIDEBAR (collapse เท่านั้น — nav link ใช้ href ปกติ)                 */
  /* ------------------------------------------------------------------ */
  function wireSidebarBasics() {
    $('#btnCollapseSidebar').addEventListener('click', () => $('#sidebar').classList.toggle('is-collapsed'));
    $('#btnToggleSidebar').addEventListener('click', () => $('#sidebar').classList.toggle('is-open'));
  }

  /* ------------------------------------------------------------------ */
  /* STEP 1 — Dropzone / File / Sheet Select                             */
  /* ------------------------------------------------------------------ */
  function wireDropzone() {
    const dropzone = $('#dropzone');
    const fileInput = $('#fileInput');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
    $('#btnChooseFile').addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('is-drag'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-drag'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-drag');
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleFile(e.target.files[0]);
    });

    $('#btnRemoveFile').addEventListener('click', () => resetFileSelection());
  }

  async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xls', 'xlsx'].includes(ext)) {
      toast('รองรับเฉพาะไฟล์ .xls และ .xlsx เท่านั้น', 'error');
      return;
    }
    try {
      const result = await ExcelReader.readFile(file);
      state.fileMeta = { name: result.fileName, size: result.fileSize };
      state.sheets = result.sheets;
      state.selectedSheetName = null;

      $('#pickedFileName').textContent = result.fileName;
      $('#pickedFileSize').textContent = formatBytes(result.fileSize);
      $('#filePickedInfo').classList.remove('d-none');

      renderSheetList();
      $('#sheetSelectBlock').classList.remove('d-none');
      updateNextEnabled();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function resetFileSelection() {
    state.fileMeta = null; state.sheets = []; state.selectedSheetName = null;
    $('#fileInput').value = '';
    $('#filePickedInfo').classList.add('d-none');
    $('#sheetSelectBlock').classList.add('d-none');
    updateNextEnabled();
  }

  function renderSheetList() {
    const list = $('#sheetList');
    list.innerHTML = state.sheets.map((s, i) => `
      <label class="sheet-select__item" data-sheet="${escapeHtml(s.name)}">
        <input type="radio" name="sheetChoice" value="${escapeHtml(s.name)}">
        ${escapeHtml(s.name)} <span class="text-muted-sm">(${s.rows.length} แถว)</span>
      </label>`).join('');

    $$('.sheet-select__item').forEach((item) => {
      item.addEventListener('click', () => {
        $$('.sheet-select__item').forEach((i) => i.classList.remove('is-selected'));
        item.classList.add('is-selected');
        item.querySelector('input').checked = true;
        state.selectedSheetName = item.dataset.sheet;
        updateNextEnabled();
      });
    });
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /* ------------------------------------------------------------------ */
  /* STEP 2 — Preview                                                     */
  /* ------------------------------------------------------------------ */
  function renderPreview() {
    const sheet = state.sheets.find((s) => s.name === state.selectedSheetName);
    const { headers, dataRows } = ExcelReader.toObjects(sheet.rows);
    state.headers = headers;
    state.dataRows = dataRows;

    $('#previewRowCount').textContent = dataRows.length;
    $('#previewColCount').textContent = headers.length;
    $('#previewSheetName').textContent = state.selectedSheetName;

    $('#previewTableHead').innerHTML = '<tr>' + headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('') + '</tr>';
    $('#previewTableBody').innerHTML = dataRows.slice(0, 10).map((row) =>
      '<tr>' + headers.map((_, i) => `<td>${escapeHtml(row[i] ?? '')}</td>`).join('') + '</tr>'
    ).join('');
  }

  /* ------------------------------------------------------------------ */
  /* STEP 3 — Mapping                                                     */
  /* ------------------------------------------------------------------ */
  function renderMapping() {
    state.mappingList = Mapping.autoMap(state.headers);
    drawMappingList();
  }

  function drawMappingList() {
    const list = $('#mappingList');
    list.innerHTML = state.mappingList.map((m) => `
      <div class="mapping-row">
        <div class="mapping-row__source">
          <span class="mapping-row__badge">Excel Column</span>
          <span class="mapping-row__value">${escapeHtml(m.header)}</span>
        </div>
        <i class="fa-solid fa-arrow-right-long mapping-row__arrow"></i>
        <div class="mapping-row__target">
          <span class="mapping-row__badge">System Field</span>
          <select class="form-select form-select-sm" data-index="${m.index}">
            <option value="">-- ไม่นำเข้า --</option>
            ${Mapping.FIELDS.map((f) => `<option value="${f}" ${m.field === f ? 'selected' : ''}>${f}</option>`).join('')}
          </select>
        </div>
      </div>`).join('');

    $$('#mappingList select').forEach((sel) => {
      sel.addEventListener('change', () => {
        const idx = Number(sel.dataset.index);
        state.mappingList = state.mappingList.map((m) => m.index === idx ? { ...m, field: sel.value || null } : m);
      });
    });
  }

  function wireMappingToolbar() {
    $('#btnAutoMap').addEventListener('click', () => {
      state.mappingList = Mapping.autoMap(state.headers);
      drawMappingList();
      toast('จับคู่คอลัมน์อัตโนมัติแล้ว', 'success');
    });
  }

  /* ------------------------------------------------------------------ */
  /* STEP 4 — Validation                                                  */
  /* ------------------------------------------------------------------ */
  function runValidation() {
    state.mappedRows = Mapping.buildMappedRows(state.dataRows, state.mappingList);
    state.validation = Validator.validate(state.mappedRows, state.existing.expenses, state.existing.projects);
    drawValidation();
  }

  function drawValidation() {
    const { rows, summary } = state.validation;
    $('#valTotalCount').textContent = summary.total;
    $('#valValidCount').textContent = summary.valid;
    $('#valInvalidCount').textContent = summary.invalid;
    $('#valDuplicateCount').textContent = summary.duplicate;

    $('#validationTableBody').innerHTML = rows.map((r) => `
      <tr class="${r.status === 'invalid' ? 'row-invalid' : r.status === 'duplicate' ? 'row-duplicate' : ''}">
        <td>${escapeHtml(r.Date)}</td>
        <td>${escapeHtml(r.Project)}</td>
        <td>${escapeHtml(r.Category)}</td>
        <td>${escapeHtml(r.Description)}</td>
        <td>${escapeHtml(r.Vendor)}</td>
        <td class="text-end">${escapeHtml(r.Amount)}</td>
        <td>${escapeHtml(r.Remark)}</td>
        <td>${statusBadge(r.status)}</td>
        <td class="text-muted-sm">${escapeHtml(r.reason)}</td>
      </tr>`).join('');
  }

  function statusBadge(status) {
    if (status === 'valid') return '<span class="badge-status is-active">ถูกต้อง</span>';
    if (status === 'duplicate') return '<span class="badge-status is-hold">ซ้ำ</span>';
    return '<span class="badge-status" style="background:rgba(176,80,59,.15);color:var(--danger-500);">ผิดพลาด</span>';
  }

  /* ------------------------------------------------------------------ */
  /* STEP 5 — Import                                                      */
  /* ------------------------------------------------------------------ */
  function wireImportModeAndActions() {
    $('#btnWizardImport').addEventListener('click', runImport);
    $('#btnGoToDashboard').addEventListener('click', () => { window.location.href = 'index.html'; });
    $('#btnImportAnother').addEventListener('click', () => resetWizard());
  }

  async function runImport() {
    const mode = $('input[name="importMode"]:checked').value;
    const validRows = state.validation.rows.filter((r) => r.status === 'valid').map((r) => ({
      Date: r.Date, Project: r.Project, Category: r.Category,
      Description: r.Description, Vendor: r.Vendor, Amount: r.Amount, Remark: r.Remark
    }));
    const skipped = state.validation.rows.length - validRows.length;

    if (!validRows.length) {
      toast('ไม่มีข้อมูลที่ถูกต้องให้ Import', 'error');
      return;
    }

    $('#importModeBlock').classList.add('d-none');
    $('#btnWizardImport').classList.add('d-none');
    $('#importProgressBlock').classList.remove('d-none');
    $('#btnWizardBack').disabled = true;

    const startTime = Date.now();
    try {
      const result = await ImportApi.importBatches(validRows, mode, state.fileMeta?.name || 'unknown.xlsx', '-', (pct) => {
        $('#importProgressBar').style.width = pct + '%';
        $('#importProgressPercent').textContent = pct + '%';
      });
      const seconds = ((Date.now() - startTime) / 1000).toFixed(1);

      $('#importProgressBlock').classList.add('d-none');
      $('#importSummaryBlock').classList.remove('d-none');
      $('#sumTotal').textContent = state.validation.rows.length;
      $('#sumSuccess').textContent = result.success;
      $('#sumFailed').textContent = result.failed;
      $('#sumSkipped').textContent = skipped;
      $('#sumTime').textContent = seconds + 's';

      const ok = result.failed === 0;
      $('#importSummaryIcon').innerHTML = `<i class="fa-solid ${ok ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>`;
      $('#importSummaryIcon').style.color = ok ? 'var(--sage-500)' : 'var(--danger-500)';
      $('#importSummaryTitle').textContent = ok ? 'Import Success' : 'Import เสร็จสิ้น (มีบางรายการล้มเหลว)';

      await loadExistingData();
      renderHistoryTable();
    } catch (err) {
      toast('Import ล้มเหลว: ' + err.message, 'error');
      $('#importProgressBlock').classList.add('d-none');
      $('#importModeBlock').classList.remove('d-none');
      $('#btnWizardImport').classList.remove('d-none');
      $('#btnWizardBack').disabled = false;
    }
  }

  function renderHistoryTable() {
    const tbody = $('#tblImportHistory tbody');
    const rows = state.existing.importHistory || [];
    tbody.innerHTML = rows.length ? rows.slice().reverse().map((h) => `
      <tr>
        <td>${escapeHtml(h.ImportDate)}</td>
        <td>${escapeHtml(h.Username)}</td>
        <td>${escapeHtml(h.Filename)}</td>
        <td>${escapeHtml(h.Mode)}</td>
        <td class="text-end">${escapeHtml(h.Rows)}</td>
        <td>${escapeHtml(h.Status)}</td>
      </tr>`).join('') : '<tr><td colspan="6" class="text-center text-muted-sm py-4">ยังไม่มีประวัติการ Import</td></tr>';
  }

  /* ------------------------------------------------------------------ */
  /* WIZARD NAVIGATION                                                    */
  /* ------------------------------------------------------------------ */
  function wireWizardNav() {
    $('#btnWizardBack').addEventListener('click', () => goToStep(state.step - 1));
    $('#btnWizardNext').addEventListener('click', () => goToStep(state.step + 1));
  }

  function updateNextEnabled() {
    let enabled = false;
    if (state.step === 1) enabled = !!(state.fileMeta && state.selectedSheetName);
    else if (state.step === 2) enabled = true;
    else if (state.step === 3) enabled = state.mappingList.some((m) => m.field);
    else if (state.step === 4) enabled = !!(state.validation && state.validation.summary.valid > 0);
    $('#btnWizardNext').disabled = !enabled;
  }

  function goToStep(step) {
    if (step < 1 || step > 5) return;
    state.step = step;

    $$('.wizard-step').forEach((el) => {
      const n = Number(el.dataset.step);
      el.classList.toggle('is-active', n === step);
      el.classList.toggle('is-done', n < step);
    });
    $$('.wizard-step-panel').forEach((el) => el.classList.remove('is-active'));
    $('#stepPanel-' + step).classList.add('is-active');

    $('#btnWizardBack').disabled = step === 1;
    $('#btnWizardNext').classList.toggle('d-none', step === 5);
    $('#btnWizardImport').classList.toggle('d-none', step !== 5);

    if (step === 2) renderPreview();
    if (step === 3) renderMapping();
    if (step === 4) runValidation();

    updateNextEnabled();
  }

  function resetWizard() {
    state.step = 1; state.fileMeta = null; state.sheets = []; state.selectedSheetName = null;
    state.headers = []; state.dataRows = []; state.mappingList = []; state.mappedRows = []; state.validation = null;
    resetFileSelection();
    $('#importSummaryBlock').classList.add('d-none');
    $('#importModeBlock').classList.remove('d-none');
    $('#btnWizardImport').classList.remove('d-none');
    goToStep(1);
  }

  /* ------------------------------------------------------------------ */
  /* UTIL                                                                 */
  /* ------------------------------------------------------------------ */
  function toast(message, kind) {
    const el = document.createElement('div');
    el.className = 'app-toast' + (kind === 'success' ? ' is-success' : kind === 'error' ? ' is-error' : '');
    el.innerHTML = `<i class="fa-solid ${kind === 'success' ? 'fa-circle-check' : kind === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}"></i><span>${escapeHtml(message)}</span>`;
    $('#toastContainer').appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
})();
