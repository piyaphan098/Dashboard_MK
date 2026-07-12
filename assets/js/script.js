/**
 * ==========================================================================
 * Marketing Budget Dashboard — Main Script
 * ==========================================================================
 */
(() => {
  const state = {
    projects: [],
    expenses: [],
    categories: [],
    years: [],
    filters: { year: '', month: '', project: '' },
    currentProjectId: null,
    charts: {}
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const fmtMoney = (n) => '฿' + (Number(n) || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 });

  /* ------------------------------------------------------------------ */
  /* INIT                                                                 */
  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    wireSidebar();
    wireTopbar();
    wireModals();
    wireReports();
    wireTheme();

    await loadData(true);

    $('#btnSync').addEventListener('click', () => loadData(true));
  }

  async function loadData(showOverlay) {
    if (showOverlay) $('#app-loading').style.display = 'flex';
    try {
      if (!Api.isConfigured()) {
        toast('ยังไม่ได้ตั้งค่า Google Sheets — กรุณาใส่ API_URL ใน assets/js/config.js', 'error');
        return;
      }
      const data = await Api.fetchAll();
      state.projects = (data.projects || []).map(normalizeProject);
      state.expenses = (data.expenses || []).map(normalizeExpense);
      state.categories = data.categories || [];
      state.years = (data.years || []).map(normalizeYear);

      populateFilterOptions();
      renderAll();
      toast('โหลดข้อมูลจาก Google Sheets สำเร็จ', 'success');
    } catch (err) {
      console.error(err);
      toast('เกิดข้อผิดพลาด: ' + err.message, 'error');
    } finally {
      $('#app-loading').style.display = 'none';
    }
  }

  function normalizeProject(p) {
    return {
      ProjectID: p.ProjectID,
      ProjectName: p.ProjectName,
      Budget: Number(p.Budget) || 0,
      StartDate: p.StartDate,
      EndDate: p.EndDate,
      Status: p.Status || 'Active'
    };
  }
  function normalizeYear(y) {
    return {
      YearID: y.YearID,
      Year: String(y.Year),
      Budget: Number(y.Budget) || 0
    };
  }
  function normalizeExpense(e) {
    return {
      ExpenseID: e.ExpenseID,
      ProjectID: e.ProjectID,
      Date: e.Date,
      Category: e.Category,
      Description: e.Description,
      Vendor: e.Vendor,
      Amount: Number(e.Amount) || 0,
      Remark: e.Remark
    };
  }

  /* ------------------------------------------------------------------ */
  /* FILTERS                                                              */
  /* ------------------------------------------------------------------ */
  function populateFilterOptions() {
    const yearSel = $('#filterYear');
    const monthSel = $('#filterMonth');
    const projSel = $('#filterProject');

    const years = [...new Set(state.expenses.map(e => (e.Date || '').slice(0, 4)).filter(Boolean))].sort();
    yearSel.innerHTML = '<option value="">ทุกปี</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');

    const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const monthNames = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    monthSel.innerHTML = '<option value="">ทุกเดือน</option>' + months.map((m,i) => `<option value="${m}">${monthNames[i]}</option>`).join('');

    projSel.innerHTML = '<option value="">ทุกโปรเจกต์</option>' + state.projects.map(p => `<option value="${p.ProjectID}">${escapeHtml(p.ProjectName)}</option>`).join('');

    [yearSel, monthSel, projSel].forEach(sel => {
      sel.onchange = () => {
        state.filters.year = yearSel.value;
        state.filters.month = monthSel.value;
        state.filters.project = projSel.value;
        renderDashboardSection();
      };
    });
  }

  function getFilteredExpenses() {
    return state.expenses.filter(e => {
      if (state.filters.year && (e.Date || '').slice(0, 4) !== state.filters.year) return false;
      if (state.filters.month && (e.Date || '').slice(5, 7) !== state.filters.month) return false;
      if (state.filters.project && String(e.ProjectID) !== String(state.filters.project)) return false;
      return true;
    });
  }

  /* ------------------------------------------------------------------ */
  /* RENDER — ALL                                                         */
  /* ------------------------------------------------------------------ */
  function renderAll() {
    renderDashboardSection();
    renderProjectCards();
    renderCategoriesTable();
    renderYearsTable();
  }

  function renderDashboardSection() {
    const filteredExpenses = getFilteredExpenses();

    // งบจากโปรเจกต์ — รวม Budget ของทุกโปรเจกต์ (ใช้เทียบเฉยๆ ไม่ใช่ตัวเลขหลักอีกต่อไป)
    const projectAllocatedBudget = state.projects.reduce((s, p) => s + p.Budget, 0);

    // งบของปี — ตัวเลขหลักที่ใช้คำนวณ Remaining / % Usage
    // ถ้าเลือกปีที่ Filter ไว้ ใช้ Budget ของปีนั้นจาก Settings > Budget Year
    // ถ้าเลือก "ทุกปี" ใช้ผลรวม Budget ของทุกปีที่ตั้งไว้
    let totalBudget = 0;
    let yearBudgetFound = true;
    if (state.filters.year) {
      const y = state.years.find(y => String(y.Year) === String(state.filters.year));
      totalBudget = y ? y.Budget : 0;
      yearBudgetFound = !!y;
    } else {
      totalBudget = state.years.reduce((s, y) => s + y.Budget, 0);
      yearBudgetFound = state.years.length > 0;
    }

    const totalExpense = filteredExpenses.reduce((s, e) => s + e.Amount, 0);
    const remaining = totalBudget - totalExpense;
    const usagePct = totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;

    $('#statTotalBudget').textContent = fmtMoney(totalBudget);
    $('#statTotalExpense').textContent = fmtMoney(totalExpense);
    $('#statRemaining').textContent = fmtMoney(remaining);
    $('#statUsagePercent').textContent = usagePct + '%';
    $('#statProjectCount').textContent = state.projects.length;
    $('#statExpenseCount').textContent = filteredExpenses.length;

    const captionEl = $('#statBudgetCaption');
    if (!yearBudgetFound) {
      captionEl.textContent = 'ยังไม่ได้ตั้งงบของปีนี้ใน Settings > Budget Year';
      captionEl.classList.add('is-over');
    } else {
      const allocPct = totalBudget > 0 ? Math.round((projectAllocatedBudget / totalBudget) * 100) : 0;
      captionEl.textContent = `จัดสรรจากโปรเจกต์: ${fmtMoney(projectAllocatedBudget)} (${allocPct}% ของงบปี)`;
      captionEl.classList.toggle('is-over', projectAllocatedBudget > totalBudget);
    }

    const circumference = 314.16;
    $('#ringGaugeFill').style.strokeDashoffset = circumference - (circumference * usagePct / 100);

    renderCharts(filteredExpenses, totalBudget, totalExpense);
    renderRecentExpenseTable(filteredExpenses);
    renderTopProjectsTable();
  }

  function renderCharts(filteredExpenses, totalBudget, totalExpense) {
    if (typeof Chart === 'undefined') return;

    // ---- Pie: Used vs Remaining ----
    destroyChart('pie');
    state.charts.pie = new Chart($('#chartBudgetPie'), {
      type: 'doughnut',
      data: {
        labels: ['ใช้ไปแล้ว', 'คงเหลือ'],
        datasets: [{ data: [totalExpense, Math.max(0, totalBudget - totalExpense)], backgroundColor: ['#A97142', '#E8DCC8'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }
    });

    // ---- Bar: Budget by Category ----
    const byCategory = {};
    filteredExpenses.forEach(e => { byCategory[e.Category || 'อื่นๆ'] = (byCategory[e.Category || 'อื่นๆ'] || 0) + e.Amount; });
    destroyChart('bar');
    state.charts.bar = new Chart($('#chartCategoryBar'), {
      type: 'bar',
      data: {
        labels: Object.keys(byCategory),
        datasets: [{ label: 'ค่าใช้จ่าย', data: Object.values(byCategory), backgroundColor: '#6B4423' }]
      },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false }
    });

    // ---- Line: Monthly Expense ----
    const byMonth = {};
    filteredExpenses.forEach(e => {
      const m = (e.Date || '').slice(0, 7);
      if (!m) return;
      byMonth[m] = (byMonth[m] || 0) + e.Amount;
    });
    const months = Object.keys(byMonth).sort();
    destroyChart('line');
    state.charts.line = new Chart($('#chartMonthlyLine'), {
      type: 'line',
      data: {
        labels: months,
        datasets: [{ label: 'ค่าใช้จ่ายรายเดือน', data: months.map(m => byMonth[m]), borderColor: '#A97142', backgroundColor: 'rgba(169,113,66,.15)', fill: true, tension: .3 }]
      },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false }
    });
  }
  function destroyChart(key) {
    if (state.charts[key]) { state.charts[key].destroy(); state.charts[key] = null; }
  }

  function renderRecentExpenseTable(filteredExpenses) {
    const tbody = $('#tblRecentExpense tbody');
    const rows = [...filteredExpenses].sort((a, b) => (b.Date || '').localeCompare(a.Date || '')).slice(0, 10);
    tbody.innerHTML = rows.length ? rows.map(e => {
      const proj = state.projects.find(p => String(p.ProjectID) === String(e.ProjectID));
      return `<tr>
        <td>${escapeHtml(e.Date || '')}</td>
        <td>${escapeHtml(proj ? proj.ProjectName : '-')}</td>
        <td>${escapeHtml(e.Category || '')}</td>
        <td>${escapeHtml(e.Description || '')}</td>
        <td class="text-end">${fmtMoney(e.Amount)}</td>
      </tr>`;
    }).join('') : emptyRow(5, 'ยังไม่มีรายการค่าใช้จ่าย');
  }

  function renderTopProjectsTable() {
    const tbody = $('#tblTopProjects tbody');
    const rows = state.projects.map(p => {
      const used = state.expenses.filter(e => String(e.ProjectID) === String(p.ProjectID)).reduce((s, e) => s + e.Amount, 0);
      const pct = p.Budget > 0 ? Math.round((used / p.Budget) * 100) : 0;
      return { name: p.ProjectName, pct };
    }).sort((a, b) => b.pct - a.pct).slice(0, 10);
    tbody.innerHTML = rows.length ? rows.map(r => `<tr><td>${escapeHtml(r.name)}</td><td class="text-end">${r.pct}%</td></tr>`).join('') : emptyRow(2, 'ยังไม่มีโปรเจกต์');
  }

  function emptyRow(colspan, text) {
    return `<tr><td colspan="${colspan}" class="text-center text-muted-sm py-4">${text}</td></tr>`;
  }

  /* ------------------------------------------------------------------ */
  /* PROJECT CARDS + DETAIL                                               */
  /* ------------------------------------------------------------------ */
  function renderProjectCards(filterText) {
    const grid = $('#projectCardGrid');
    const term = (filterText || '').trim().toLowerCase();
    const list = state.projects.filter(p => !term || p.ProjectName.toLowerCase().includes(term));

    grid.innerHTML = list.length ? list.map(p => {
      const used = state.expenses.filter(e => String(e.ProjectID) === String(p.ProjectID)).reduce((s, e) => s + e.Amount, 0);
      const pct = p.Budget > 0 ? Math.min(100, Math.round((used / p.Budget) * 100)) : 0;
      const statusClass = p.Status === 'Active' ? 'is-active' : p.Status === 'On Hold' ? 'is-hold' : 'is-completed';
      return `
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="project-card" data-id="${p.ProjectID}">
          <div class="project-card__top">
            <span class="project-card__name">${escapeHtml(p.ProjectName)}</span>
            <span class="badge-status ${statusClass}">${escapeHtml(p.Status)}</span>
          </div>
          <div class="project-card__row"><span>Budget</span><span>${fmtMoney(p.Budget)}</span></div>
          <div class="project-card__row"><span>Used</span><span>${fmtMoney(used)} (${pct}%)</span></div>
          <div class="progress app-progress"><div class="progress-bar" style="width:${pct}%"></div></div>
        </div>
      </div>`;
    }).join('') : `<div class="col-12 text-center text-muted-sm py-5">ยังไม่มีโปรเจกต์ กด "Add Project" เพื่อเริ่มต้น</div>`;

    $$('.project-card').forEach(card => {
      card.addEventListener('click', () => openProjectDetail(card.dataset.id));
    });
  }

  function openProjectDetail(projectId) {
    const p = state.projects.find(x => String(x.ProjectID) === String(projectId));
    if (!p) return;
    state.currentProjectId = projectId;

    const used = state.expenses.filter(e => String(e.ProjectID) === String(projectId)).reduce((s, e) => s + e.Amount, 0);
    const pct = p.Budget > 0 ? Math.min(100, Math.round((used / p.Budget) * 100)) : 0;

    $('#pdProjectName').textContent = p.ProjectName;
    $('#pdProjectStatus').textContent = p.Status;
    $('#pdProjectStatus').className = 'badge-status ' + (p.Status === 'Active' ? 'is-active' : p.Status === 'On Hold' ? 'is-hold' : 'is-completed');
    $('#pdBudget').textContent = fmtMoney(p.Budget);
    $('#pdExpense').textContent = fmtMoney(used);
    $('#pdRemaining').textContent = fmtMoney(p.Budget - used);
    $('#pdProgressBar').style.width = pct + '%';

    const tbody = $('#tblProjectExpenses tbody');
    const rows = state.expenses.filter(e => String(e.ProjectID) === String(projectId)).sort((a, b) => (b.Date || '').localeCompare(a.Date || ''));
    tbody.innerHTML = rows.length ? rows.map(e => `
      <tr>
        <td>${escapeHtml(e.Date || '')}</td>
        <td>${escapeHtml(e.Category || '')}</td>
        <td>${escapeHtml(e.Description || '')}</td>
        <td>${escapeHtml(e.Vendor || '')}</td>
        <td class="text-end">${fmtMoney(e.Amount)}</td>
        <td>${escapeHtml(e.Remark || '')}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-secondary btn-edit-expense" data-id="${e.ExpenseID}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger btn-delete-expense" data-id="${e.ExpenseID}"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`).join('') : emptyRow(7, 'ยังไม่มีรายการค่าใช้จ่ายในโปรเจกต์นี้');

    $$('.btn-edit-expense').forEach(b => b.addEventListener('click', () => openExpenseModal(b.dataset.id)));
    $$('.btn-delete-expense').forEach(b => b.addEventListener('click', () => confirmDelete('รายการค่าใช้จ่าย', () => deleteExpense(b.dataset.id))));

    goToSection('project-detail');
  }

  /* ------------------------------------------------------------------ */
  /* SIDEBAR / SECTIONS                                                   */
  /* ------------------------------------------------------------------ */
  function wireSidebar() {
    $$('.nav-link[data-section]').forEach(link => {
      link.addEventListener('click', (ev) => {
        const section = link.dataset.section;
        if (section === 'import') return; // ปล่อยให้ลิงก์ไปหน้า import.html ตามปกติ
        ev.preventDefault();
        goToSection(section);
      });
    });
    $('#btnCollapseSidebar').addEventListener('click', () => $('#sidebar').classList.toggle('is-collapsed'));
    $('#btnBackToProjects').addEventListener('click', () => goToSection('projects'));
  }

  const sectionTitles = {
    dashboard: ['Dashboard', 'ภาพรวมงบประมาณการตลาดทั้งหมด'],
    projects: ['Projects', 'จัดการโปรเจกต์ทั้งหมด'],
    'project-detail': ['Project Detail', 'รายละเอียดโปรเจกต์'],
    reports: ['Reports', 'ออกรายงานสรุปงบประมาณ'],
    settings: ['Settings', 'ตั้งค่าระบบ']
  };

  function goToSection(section) {
    $$('.page-section').forEach(s => s.classList.remove('active'));
    const target = $('#' + section + '-section');
    if (target) target.classList.add('active');

    $$('.nav-link[data-section]').forEach(l => l.classList.toggle('active', l.dataset.section === section));

    const [title, subtitle] = sectionTitles[section] || ['', ''];
    $('#pageTitle').textContent = title;
    $('#pageSubtitle').textContent = subtitle;

    $('#globalFilters').style.display = (section === 'dashboard') ? 'flex' : 'none';
  }

  function wireTopbar() {
    $('#btnToggleSidebar').addEventListener('click', () => $('#sidebar').classList.toggle('is-open'));
    $('#projectSearchInput')?.addEventListener('input', (e) => renderProjectCards(e.target.value));
  }

  /* ------------------------------------------------------------------ */
  /* MODALS — Expense / Project / Category                               */
  /* ------------------------------------------------------------------ */
  function wireModals() {
    $('#btnAddProject').addEventListener('click', () => openProjectModal());
    $('#btnAddExpenseFromDetail').addEventListener('click', () => openExpenseModal(null, state.currentProjectId));
    $('#btnEditProjectFromDetail').addEventListener('click', () => openProjectModal(state.currentProjectId));
    $('#btnDeleteProjectFromDetail').addEventListener('click', () => {
      const p = state.projects.find(x => String(x.ProjectID) === String(state.currentProjectId));
      confirmDelete(`โปรเจกต์ "${p ? p.ProjectName : ''}" (รวมถึงรายการค่าใช้จ่ายทั้งหมด)`, () => deleteProject(state.currentProjectId));
    });
    $('#btnAddCategory').addEventListener('click', () => openCategoryModal());
    $('#btnAddYear').addEventListener('click', () => openYearModal());

    $('#projectForm').addEventListener('submit', onSubmitProject);
    $('#expenseForm').addEventListener('submit', onSubmitExpense);
    $('#categoryForm').addEventListener('submit', onSubmitCategory);
    $('#yearForm').addEventListener('submit', onSubmitYear);
  }

  function bsModal(id) {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById(id));
  }

  function openProjectModal(projectId) {
    const p = projectId ? state.projects.find(x => String(x.ProjectID) === String(projectId)) : null;
    $('#projectModalTitle').textContent = p ? 'Edit Project' : 'Add Project';
    $('#projectId').value = p ? p.ProjectID : '';
    $('#projectName').value = p ? p.ProjectName : '';
    $('#projectBudget').value = p ? p.Budget : '';
    $('#projectStartDate').value = p ? p.StartDate : '';
    $('#projectEndDate').value = p ? p.EndDate : '';
    $('#projectStatus').value = p ? p.Status : 'Active';
    bsModal('projectModal').show();
  }

  async function onSubmitProject(ev) {
    ev.preventDefault();
    const id = $('#projectId').value;
    const payload = {
      ProjectID: id || undefined,
      ProjectName: $('#projectName').value.trim(),
      Budget: Number($('#projectBudget').value) || 0,
      StartDate: $('#projectStartDate').value,
      EndDate: $('#projectEndDate').value,
      Status: $('#projectStatus').value
    };
    try {
      if (id) await Api.updateProject(payload); else await Api.addProject(payload);
      bsModal('projectModal').hide();
      toast('บันทึกโปรเจกต์สำเร็จ', 'success');
      await loadData(false);
      if (state.currentProjectId) openProjectDetail(state.currentProjectId);
    } catch (err) { toast(err.message, 'error'); }
  }

  async function deleteProject(id) {
    try {
      await Api.deleteProject(id);
      toast('ลบโปรเจกต์สำเร็จ', 'success');
      state.currentProjectId = null;
      await loadData(false);
      goToSection('projects');
    } catch (err) { toast(err.message, 'error'); }
  }

  function openExpenseModal(expenseId, projectId) {
    const e = expenseId ? state.expenses.find(x => String(x.ExpenseID) === String(expenseId)) : null;
    $('#expenseModalTitle').textContent = e ? 'Edit Expense' : 'Add Expense';
    $('#expenseId').value = e ? e.ExpenseID : '';
    $('#expenseProjectId').value = e ? e.ProjectID : (projectId || state.currentProjectId || '');
    $('#expenseDate').value = e ? e.Date : '';
    $('#expenseDescription').value = e ? e.Description : '';
    $('#expenseVendor').value = e ? e.Vendor : '';
    $('#expenseAmount').value = e ? e.Amount : '';
    $('#expenseRemark').value = e ? e.Remark : '';

    const catSel = $('#expenseCategory');
    catSel.innerHTML = '<option value="">เลือก Category</option>' + state.categories.map(c => `<option value="${escapeHtml(c.CategoryName)}">${escapeHtml(c.CategoryName)}</option>`).join('');
    catSel.value = e ? e.Category : '';

    bsModal('expenseModal').show();
  }

  async function onSubmitExpense(ev) {
    ev.preventDefault();
    const id = $('#expenseId').value;
    const payload = {
      ExpenseID: id || undefined,
      ProjectID: $('#expenseProjectId').value,
      Date: $('#expenseDate').value,
      Category: $('#expenseCategory').value,
      Description: $('#expenseDescription').value.trim(),
      Vendor: $('#expenseVendor').value.trim(),
      Amount: Number($('#expenseAmount').value) || 0,
      Remark: $('#expenseRemark').value.trim()
    };
    try {
      if (id) await Api.updateExpense(payload); else await Api.addExpense(payload);
      bsModal('expenseModal').hide();
      toast('บันทึกค่าใช้จ่ายสำเร็จ', 'success');
      await loadData(false);
      if (state.currentProjectId) openProjectDetail(state.currentProjectId);
    } catch (err) { toast(err.message, 'error'); }
  }

  async function deleteExpense(id) {
    try {
      await Api.deleteExpense(id);
      toast('ลบรายการสำเร็จ', 'success');
      await loadData(false);
      if (state.currentProjectId) openProjectDetail(state.currentProjectId);
    } catch (err) { toast(err.message, 'error'); }
  }

  function openCategoryModal() {
    $('#categoryId').value = '';
    $('#categoryName').value = '';
    bsModal('categoryModal').show();
  }
  async function onSubmitCategory(ev) {
    ev.preventDefault();
    try {
      await Api.addCategory({ CategoryName: $('#categoryName').value.trim() });
      bsModal('categoryModal').hide();
      toast('เพิ่ม Category สำเร็จ', 'success');
      await loadData(false);
    } catch (err) { toast(err.message, 'error'); }
  }

  function renderCategoriesTable() {
    const tbody = $('#tblCategories tbody');
    tbody.innerHTML = state.categories.length ? state.categories.map(c => `
      <tr>
        <td>${escapeHtml(c.CategoryName)}</td>
        <td class="text-center"><button class="btn btn-sm btn-outline-danger btn-delete-category" data-id="${c.CategoryID}"><i class="fa-solid fa-trash"></i></button></td>
      </tr>`).join('') : emptyRow(2, 'ยังไม่มี Category');
    $$('.btn-delete-category').forEach(b => b.addEventListener('click', () => confirmDelete('Category', async () => {
      await Api.deleteCategory(b.dataset.id); toast('ลบสำเร็จ', 'success'); await loadData(false);
    })));
  }

  function openYearModal(yearId) {
    const y = yearId ? state.years.find(x => String(x.YearID) === String(yearId)) : null;
    $('#yearModalTitle') && ($('#yearModalTitle').textContent = y ? 'Edit Budget Year' : 'Add Budget Year');
    $('#yearId').value = y ? y.YearID : '';
    $('#yearValue').value = y ? y.Year : '';
    $('#yearBudget').value = y ? y.Budget : '';
    bsModal('yearModal').show();
  }

  async function onSubmitYear(ev) {
    ev.preventDefault();
    const id = $('#yearId').value;
    const payload = {
      YearID: id || undefined,
      Year: $('#yearValue').value.trim(),
      Budget: Number($('#yearBudget').value) || 0
    };
    try {
      if (id) await Api.updateYear(payload); else await Api.addYear(payload);
      bsModal('yearModal').hide();
      toast('บันทึกปีงบประมาณสำเร็จ', 'success');
      await loadData(false);
    } catch (err) { toast(err.message, 'error'); }
  }

  function renderYearsTable() {
    const tbody = $('#tblYears tbody');
    tbody.innerHTML = state.years.length ? state.years.map(y => `
      <tr>
        <td>${escapeHtml(String(y.Year))}</td>
        <td class="text-end">${fmtMoney(y.Budget)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-secondary btn-edit-year" data-id="${y.YearID}"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger btn-delete-year" data-id="${y.YearID}"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`).join('') : emptyRow(3, 'ยังไม่มีปีงบประมาณ');
    $$('.btn-edit-year').forEach(b => b.addEventListener('click', () => openYearModal(b.dataset.id)));
    $$('.btn-delete-year').forEach(b => b.addEventListener('click', () => confirmDelete('ปีงบประมาณ', async () => {
      await Api.deleteYear(b.dataset.id); toast('ลบสำเร็จ', 'success'); await loadData(false);
    })));
  }

  /* ------------------------------------------------------------------ */
  /* REPORTS EXPORT (CSV)                                                */
  /* ------------------------------------------------------------------ */
  function wireReports() {
    $$('.btn-export').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.export;
        if (type === 'csv') {
          exportCsv();
        } else {
          toast('รองรับเฉพาะ Export CSV ในเวอร์ชันนี้ (Excel/PDF จะเพิ่มในเวอร์ชันถัดไป)', 'error');
        }
      });
    });
  }
  function exportCsv() {
    const header = ['Date', 'Project', 'Category', 'Description', 'Vendor', 'Amount', 'Remark'];
    const rows = state.expenses.map(e => {
      const proj = state.projects.find(p => String(p.ProjectID) === String(e.ProjectID));
      return [e.Date, proj ? proj.ProjectName : '', e.Category, e.Description, e.Vendor, e.Amount, e.Remark];
    });
    const csv = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'budget-report.csv';
    link.click();
  }
  function csvEscape(v) {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  /* ------------------------------------------------------------------ */
  /* THEME                                                                */
  /* ------------------------------------------------------------------ */
  function wireTheme() {
    const saved = localStorage.getItem('dashboardTheme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    $$('input[name="themeOption"]').forEach(r => {
      r.checked = r.value === saved;
      r.addEventListener('change', () => {
        document.documentElement.setAttribute('data-theme', r.value);
        localStorage.setItem('dashboardTheme', r.value);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* UTIL — toast, confirm, escape                                       */
  /* ------------------------------------------------------------------ */
  function toast(message, kind) {
    const el = document.createElement('div');
    el.className = 'app-toast' + (kind === 'success' ? ' is-success' : kind === 'error' ? ' is-error' : '');
    el.innerHTML = `<i class="fa-solid ${kind === 'success' ? 'fa-circle-check' : kind === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info'}"></i><span>${escapeHtml(message)}</span>`;
    $('#toastContainer').appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  function confirmDelete(label, onConfirm) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: `ลบ${label}นี้?`,
        text: 'ไม่สามารถย้อนกลับได้หลังจากลบแล้ว',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#B0503B'
      }).then(res => { if (res.isConfirmed) onConfirm(); });
    } else if (confirm(`ลบ${label}นี้?`)) {
      onConfirm();
    }
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
})();
