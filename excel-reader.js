/* =====================================================================
   IMPORT WIZARD — STYLESHEET (ใช้ร่วมกับ style.css / design tokens เดิม)
   ===================================================================== */

/* ---- Stepper ---- */
.wizard-stepper{
  display:flex; justify-content:space-between; align-items:flex-start;
  list-style:none; margin:0 0 24px; padding:0; gap:8px;
}
.wizard-step{
  flex:1; display:flex; flex-direction:column; align-items:center; gap:8px;
  text-align:center; position:relative; opacity:.5;
}
.wizard-step.is-active, .wizard-step.is-done{ opacity:1; }
.wizard-step__circle{
  width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  background:var(--bg-beige); color:var(--brown-600); font-size:.85rem; border:2px solid var(--border-soft);
}
.wizard-step.is-active .wizard-step__circle{ background:var(--brown-600); color:var(--text-on-brown); border-color:var(--brown-600); }
.wizard-step.is-done .wizard-step__circle{ background:var(--sage-500); color:#fff; border-color:var(--sage-500); }
.wizard-step__label{ font-size:.72rem; color:var(--text-muted); font-weight:600; }
.wizard-step.is-active .wizard-step__label{ color:var(--brown-700); }

/* ---- Step panels ---- */
.wizard-step-panel{ display:none; }
.wizard-step-panel.is-active{ display:block; }

/* ---- Dropzone ---- */
.dropzone{
  border:2px dashed var(--border-subtle); border-radius:var(--radius-lg);
  padding:48px 24px; text-align:center; cursor:pointer; transition:border-color .2s, background .2s;
  background:var(--bg-beige-soft);
}
.dropzone:hover, .dropzone:focus{ border-color:var(--clay-500); background:var(--bg-beige); outline:none; }
.dropzone__icon{ font-size:2.2rem; color:var(--clay-500); margin-bottom:10px; }
.dropzone__title{ font-weight:600; color:var(--text-strong); margin-bottom:4px; }
.dropzone__subtitle{ color:var(--text-muted); font-size:.8rem; margin-bottom:12px; }
.dropzone__hint{ color:var(--text-muted); font-size:.72rem; margin-top:12px; margin-bottom:0; }

.file-picked{ margin-top:16px; padding:14px 16px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:var(--radius-sm); }
.file-picked__row{ display:flex; align-items:center; gap:12px; }
.file-picked__icon{ font-size:1.6rem; color:var(--sage-500); }
.file-picked__meta{ flex:1; display:flex; flex-direction:column; }
.file-picked__name{ font-weight:600; color:var(--text-strong); }
.file-picked__size{ font-size:.75rem; color:var(--text-muted); }

.sheet-select{ margin-top:18px; }
.sheet-select__list{ display:flex; flex-wrap:wrap; gap:10px; margin-top:8px; }
.sheet-select__item{
  border:1px solid var(--border-soft); border-radius:var(--radius-sm); padding:10px 16px;
  cursor:pointer; font-size:.85rem; color:var(--text-body); background:var(--bg-card);
}
.sheet-select__item input{ margin-right:8px; }
.sheet-select__item.is-selected{ border-color:var(--clay-500); background:rgba(169,113,66,.08); color:var(--brown-700); font-weight:600; }

/* ---- Preview ---- */
.preview-summary{ display:flex; gap:24px; margin-bottom:16px; flex-wrap:wrap; }
.preview-summary__item{ background:var(--bg-beige-soft); border-radius:var(--radius-sm); padding:10px 18px; text-align:center; min-width:120px; }
.preview-summary__value{ display:block; font-family:var(--font-mono); font-weight:600; font-size:1.2rem; color:var(--brown-600); }
.preview-summary__label{ font-size:.72rem; color:var(--text-muted); }
.preview-table-wrap{ max-height:420px; overflow:auto; }

/* ---- Mapping ---- */
.mapping-toolbar{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:12px; flex-wrap:wrap; }
.mapping-list{ display:flex; flex-direction:column; gap:10px; }
.mapping-row{
  display:flex; align-items:center; gap:14px; padding:12px 16px;
  background:var(--bg-beige-soft); border-radius:var(--radius-sm); flex-wrap:wrap;
}
.mapping-row__source, .mapping-row__target{ display:flex; flex-direction:column; gap:4px; flex:1; min-width:160px; }
.mapping-row__badge{ font-size:.66rem; text-transform:uppercase; letter-spacing:.04em; color:var(--text-muted); }
.mapping-row__value{ font-weight:600; color:var(--text-strong); }
.mapping-row__arrow{ color:var(--clay-500); }

/* ---- Validation ---- */
.validation-summary{ display:flex; gap:14px; margin-bottom:16px; flex-wrap:wrap; }
.validation-summary__card{ flex:1; min-width:120px; padding:14px 18px; border-radius:var(--radius-sm); background:var(--bg-beige-soft); text-align:center; }
.validation-summary__value{ display:block; font-family:var(--font-mono); font-weight:700; font-size:1.3rem; }
.validation-summary__label{ font-size:.72rem; color:var(--text-muted); }
.validation-summary__card.is-valid .validation-summary__value{ color:var(--sage-500); }
.validation-summary__card.is-invalid .validation-summary__value,
.validation-summary__card.is-duplicate .validation-summary__value{ color:var(--danger-500); }

/* ---- Import mode / progress / summary ---- */
.import-mode__options{ display:flex; gap:14px; flex-wrap:wrap; margin-top:10px; }
.import-mode__option{ flex:1; min-width:220px; border:1px solid var(--border-soft); border-radius:var(--radius-sm); padding:14px 16px; cursor:pointer; display:flex; gap:10px; background:var(--bg-card); }
.import-mode__option:has(input:checked){ border-color:var(--clay-500); background:rgba(169,113,66,.08); }
.import-mode__title{ display:block; font-weight:600; color:var(--text-strong); }
.import-mode__desc{ display:block; font-size:.78rem; color:var(--text-muted); }

.import-progress{ text-align:center; padding:30px 0; }
.import-progress__status{ font-weight:600; color:var(--text-strong); margin-bottom:10px; }
.import-progress__percent{ margin-top:8px; color:var(--text-muted); font-family:var(--font-mono); }

.import-summary{ text-align:center; padding:24px 0; }
.import-summary__icon{ font-size:2.6rem; color:var(--sage-500); margin-bottom:8px; }
.import-summary__title{ margin-bottom:18px; color:var(--text-strong); }
.import-summary__stats{ display:flex; justify-content:center; gap:22px; flex-wrap:wrap; margin-bottom:20px; }
.import-summary__stat{ min-width:90px; }
.import-summary__value{ display:block; font-family:var(--font-mono); font-weight:700; font-size:1.3rem; color:var(--brown-600); }
.import-summary__label{ font-size:.72rem; color:var(--text-muted); }

/* ---- Nav ---- */
.wizard-nav{ display:flex; justify-content:space-between; margin-top:24px; }
.btn-import-confirm{ background:var(--sage-500); color:#fff; border:none; }
.btn-import-confirm:hover{ background:#78876a; color:#fff; }

.row-invalid td{ background:rgba(176,80,59,.08); }
.row-duplicate td{ background:rgba(217,165,60,.12); }
