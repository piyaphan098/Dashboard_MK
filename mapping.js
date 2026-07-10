/* =====================================================================
   MARKETING BUDGET DASHBOARD — MAIN STYLESHEET
   Theme: Modern / Minimal / Professional / Bright
   Palette: White + Beige + Brown (แรงบันดาลใจจากโทนกาแฟ — อบอุ่น สุขุม)
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) DESIGN TOKENS (CSS Variables)
   --------------------------------------------------------------------- */
:root{
  /* Surface */
  --bg-page:        #FBF7F1;   /* พื้นหลังหลัก — ครีมอุ่น */
  --bg-card:        #FFFFFF;   /* พื้นการ์ด/panel */
  --bg-beige:       #F1E7D8;   /* พื้นผิวรอง — เบจ */
  --bg-beige-soft:  #F7F0E4;   /* เบจอ่อนกว่า สำหรับ hover/stripe */
  --bg-topbar:      rgba(251,247,241,.85); /* พื้นหลัง topbar แบบโปร่งแสง */

  /* Brand — Brown scale */
  --brown-900:      #3B2B24;   /* ข้อความหลัก / เข้มสุด */
  --brown-700:      #5C3D2A;   /* หัวข้อรอง */
  --brown-600:      #6B4423;   /* Primary Brand */
  --brown-500:      #8A5A34;
  --clay-500:       #A97142;   /* Accent — ดินเผา/คั่วกลาง */
  --sage-500:       #8C9B7D;   /* Accent รอง — เขียวเสจ (Positive) */
  --danger-500:     #B0503B;   /* แดงอิฐ — Error/Negative */

  /* Text */
  --text-strong:    #3B2B24;
  --text-body:      #5B4A40;
  --text-muted:     #96887A;
  --text-on-brown:  #FBF7F1;

  /* Border / Shadow */
  --border-subtle:  #E9DECB;
  --border-soft:    #F0E6D6;
  --shadow-sm:      0 1px 3px rgba(59,43,36,0.06);
  --shadow-md:      0 8px 24px rgba(59,43,36,0.08);
  --shadow-lg:      0 16px 40px rgba(59,43,36,0.14);

  /* Radius */
  --radius-sm:      10px;
  --radius-md:      16px;
  --radius-lg:      22px;
  --radius-pill:    999px;

  /* Layout */
  --sidebar-w:          264px;
  --sidebar-w-collapsed:84px;
  --topbar-h:           76px;

  /* Typography */
  --font-display: 'Prompt', 'Segoe UI', sans-serif;
  --font-body:    'Sarabun', 'Segoe UI', sans-serif;
  --font-mono:    'IBM Plex Mono', 'Consolas', monospace;

  /* Motion */
  --ease-soft: cubic-bezier(.4,0,.2,1);
}

/* ---------------------------------------------------------------------
   1b) DARK THEME — overrides design tokens when <html data-theme="dark">
   --------------------------------------------------------------------- */
[data-theme="dark"]{
  --bg-page:        #1C1512;
  --bg-card:        #241B16;
  --bg-beige:       #2C2019;
  --bg-beige-soft:  #33261D;
  --bg-topbar:      rgba(28,21,18,.85);

  --text-strong:    #F3EAE0;
  --text-body:      #D8C9BA;
  --text-muted:     #96887A;
  --text-on-brown:  #FBF7F1;

  --border-subtle:  #3A2C22;
  --border-soft:    #33271F;

  --shadow-sm:      0 1px 3px rgba(0,0,0,.35);
  --shadow-md:      0 8px 24px rgba(0,0,0,.4);
  --shadow-lg:      0 16px 40px rgba(0,0,0,.5);
}

/* ---------------------------------------------------------------------
   2) RESET / BASE
   --------------------------------------------------------------------- */
*, *::before, *::after{ box-sizing:border-box; }

html{ scroll-behavior:smooth; }

body{
  margin:0;
  background:var(--bg-page);
  color:var(--text-body);
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.55;
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}

h1,h2,h3,h4,h5{
  font-family:var(--font-display);
  color:var(--text-strong);
  margin:0;
}

a{ text-decoration:none; color:inherit; }
button{ font-family:var(--font-body); }

::selection{ background:var(--clay-500); color:#fff; }

/* Focus visible — accessibility */
a:focus-visible, button:focus-visible, input:focus-visible,
select:focus-visible, textarea:focus-visible{
  outline:2px solid var(--clay-500);
  outline-offset:2px;
  border-radius:6px;
}

.text-muted-sm{ color:var(--text-muted); font-size:.85rem; margin:0; }

/* Custom scrollbar — เรียบ ไม่รบกวนสายตา */
::-webkit-scrollbar{ width:8px; height:8px; }
::-webkit-scrollbar-thumb{ background:var(--border-subtle); border-radius:var(--radius-pill); }
::-webkit-scrollbar-track{ background:transparent; }


/* ---------------------------------------------------------------------
   3) APP LOADING OVERLAY (Loading Cup Animation — Signature Motif)
   --------------------------------------------------------------------- */
.app-loading{
  position:fixed; inset:0; z-index:2000;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:18px;
  background:var(--bg-page);
  transition:opacity .5s var(--ease-soft), visibility .5s;
}
.app-loading.is-hidden{ opacity:0; visibility:hidden; pointer-events:none; }

.loading-cup{
  width:64px; height:52px;
  border:3px solid var(--brown-600);
  border-top:none;
  border-radius:0 0 20px 20px;
  position:relative;
  overflow:hidden;
  background:var(--bg-beige-soft);
}
.loading-cup::before{ /* หูถ้วย */
  content:'';
  position:absolute; right:-14px; top:4px;
  width:16px; height:20px;
  border:3px solid var(--brown-600);
  border-left:none;
  border-radius:0 10px 10px 0;
}
.loading-cup__liquid{
  position:absolute; left:0; right:0; bottom:0;
  height:0%;
  background:linear-gradient(180deg, var(--clay-500), var(--brown-600));
  animation:cupFill 1.6s ease-in-out infinite;
}
@keyframes cupFill{
  0%{ height:0%; }
  50%{ height:85%; }
  100%{ height:0%; }
}
.loading-text{
  font-family:var(--font-display);
  font-size:.9rem;
  color:var(--text-muted);
  letter-spacing:.02em;
}
@media (prefers-reduced-motion: reduce){
  .loading-cup__liquid{ animation:none; height:60%; }
}


/* ---------------------------------------------------------------------
   4) SIDEBAR
   --------------------------------------------------------------------- */
.sidebar{
  position:fixed; top:0; left:0; bottom:0;
  width:var(--sidebar-w);
  background:var(--brown-900);
  color:var(--text-on-brown);
  display:flex; flex-direction:column;
  padding:24px 16px;
  z-index:1030;
  transition:width .3s var(--ease-soft), transform .3s var(--ease-soft);
}
.sidebar.is-collapsed{ width:var(--sidebar-w-collapsed); }
.sidebar.is-collapsed .brand-text,
.sidebar.is-collapsed .nav-link span,
.sidebar.is-collapsed .sidebar__footer{ opacity:0; pointer-events:none; }

.sidebar__brand{
  display:flex; align-items:center; gap:12px;
  padding:6px 8px 28px;
}
.brand-mark{
  width:40px; height:40px; flex:0 0 auto;
  display:flex; align-items:center; justify-content:center;
  background:linear-gradient(145deg, var(--clay-500), var(--brown-600));
  border-radius:12px;
  font-size:1.1rem;
  box-shadow:var(--shadow-sm);
}
.brand-text{ display:flex; flex-direction:column; transition:opacity .2s; white-space:nowrap; }
.brand-title{ font-family:var(--font-display); font-weight:600; font-size:1.02rem; }
.brand-title strong{ color:var(--clay-500); font-weight:700; }
.brand-subtitle{ font-size:.72rem; color:#C9B8A8; }

.sidebar__nav{ display:flex; flex-direction:column; gap:4px; flex:1; }
.nav-link{
  display:flex; align-items:center; gap:14px;
  padding:12px 14px;
  border-radius:var(--radius-sm);
  color:#D9C9B8;
  font-size:.92rem;
  transition:background .2s var(--ease-soft), color .2s;
  white-space:nowrap;
  overflow:hidden;
}
.nav-link i{ width:20px; text-align:center; font-size:1rem; flex:0 0 auto; }
.nav-link:hover{ background:rgba(255,255,255,.06); color:#fff; }
.nav-link.active{
  background:linear-gradient(135deg, var(--clay-500), #8a5a34);
  color:#fff;
  box-shadow:var(--shadow-sm);
}

.sidebar__footer{ display:flex; justify-content:flex-end; transition:opacity .2s; }
.btn-collapse{
  width:34px; height:34px;
  border:1px solid rgba(255,255,255,.15);
  background:transparent;
  color:#D9C9B8;
  border-radius:var(--radius-pill);
  cursor:pointer;
  transition:transform .3s var(--ease-soft), background .2s;
}
.btn-collapse:hover{ background:rgba(255,255,255,.08); }
.sidebar.is-collapsed .btn-collapse i{ transform:rotate(180deg); display:inline-block; }


/* ---------------------------------------------------------------------
   5) MAIN WRAPPER / TOPBAR
   --------------------------------------------------------------------- */
.main-wrapper{
  margin-left:var(--sidebar-w);
  min-height:100vh;
  display:flex; flex-direction:column;
  transition:margin-left .3s var(--ease-soft);
}
.sidebar.is-collapsed ~ .main-wrapper{ margin-left:var(--sidebar-w-collapsed); }

.topbar{
  position:sticky; top:0; z-index:1010;
  display:flex; align-items:center; gap:20px;
  padding:16px 32px;
  background:var(--bg-topbar);
  backdrop-filter:blur(10px);
  border-bottom:1px solid var(--border-subtle);
}
.topbar__menu-btn{
  display:none;
  width:40px; height:40px;
  border:1px solid var(--border-subtle);
  background:var(--bg-card);
  border-radius:var(--radius-sm);
  color:var(--brown-600);
  cursor:pointer;
}
.topbar__title h1{ font-size:1.35rem; font-weight:600; }
.topbar__title{ flex:0 0 auto; }
.topbar__filters{
  margin-left:auto;
  display:flex; align-items:center; gap:10px;
  flex-wrap:wrap;
}
.topbar__filters .form-select{
  border-radius:var(--radius-pill);
  border-color:var(--border-subtle);
  font-size:.85rem;
  padding:.4rem 1.1rem;
  background-color:var(--bg-card);
  min-width:120px;
}
.topbar__filters .form-select:focus{
  border-color:var(--clay-500);
  box-shadow:0 0 0 .15rem rgba(169,113,66,.15);
}
.btn-sync{
  width:40px; height:40px;
  border-radius:50%;
  border:1px solid var(--border-subtle);
  background:var(--bg-card);
  color:var(--brown-600);
  display:flex; align-items:center; justify-content:center;
  transition:transform .4s var(--ease-soft), background .2s;
}
.btn-sync:hover{ background:var(--bg-beige); }
.btn-sync.is-loading i{ animation:spin .8s linear infinite; }
@keyframes spin{ to{ transform:rotate(360deg); } }

.app-footer{
  margin-top:auto;
  padding:18px 32px 28px;
  text-align:center;
  color:var(--text-muted);
  font-size:.78rem;
}


/* ---------------------------------------------------------------------
   6) CONTENT / PAGE SECTIONS
   --------------------------------------------------------------------- */
.content{ padding:28px 32px 12px; flex:1; }

.page-section{ display:none; animation:fadeUp .35s var(--ease-soft); }
.page-section.active{ display:block; }
@keyframes fadeUp{
  from{ opacity:0; transform:translateY(10px); }
  to{ opacity:1; transform:translateY(0); }
}

.section-toolbar{
  display:flex; align-items:center; justify-content:space-between;
  gap:16px; margin-bottom:22px; flex-wrap:wrap;
}
.section-toolbar__search{
  display:flex; align-items:center; gap:10px;
  background:var(--bg-card);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-pill);
  padding:.55rem 1.1rem;
  min-width:260px;
  flex:1 1 260px;
  max-width:360px;
  color:var(--text-muted);
}
.section-toolbar__search input{
  border:none; outline:none; background:transparent;
  flex:1; font-size:.88rem; color:var(--text-body);
}


/* ---------------------------------------------------------------------
   7) STAT CARDS (Dashboard)
   --------------------------------------------------------------------- */
.stat-cards-row{ margin-bottom:18px; }

.stat-card{
  background:var(--bg-card);
  border:1px solid var(--border-soft);
  border-radius:var(--radius-lg);
  padding:20px 22px;
  display:flex; align-items:center; gap:16px;
  box-shadow:var(--shadow-sm);
  height:100%;
  transition:transform .25s var(--ease-soft), box-shadow .25s var(--ease-soft);
}
.stat-card:hover{ transform:translateY(-3px); box-shadow:var(--shadow-md); }

.stat-card__icon{
  width:52px; height:52px; flex:0 0 auto;
  border-radius:16px;
  display:flex; align-items:center; justify-content:center;
  font-size:1.25rem; color:#fff;
}
.icon-brown{ background:linear-gradient(145deg, var(--brown-500), var(--brown-700)); }
.icon-clay{  background:linear-gradient(145deg, var(--clay-500), var(--brown-600)); }
.icon-sage{  background:linear-gradient(145deg, var(--sage-500), #6d7d5f); }

.stat-card__body{ display:flex; flex-direction:column; gap:4px; min-width:0; }
.stat-card__label{ font-size:.8rem; color:var(--text-muted); }
.stat-card__value{
  font-family:var(--font-mono); font-weight:600;
  font-size:1.35rem; color:var(--text-strong);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.stat-card__caption{
  font-size:.72rem; color:var(--text-muted);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.stat-card__caption.is-over{ color:var(--danger-500); font-weight:600; }

/* ---- Ring Gauge card (Signature element — วงกาแฟ) ---- */
.stat-card--ring{ justify-content:center; }
.ring-gauge{ position:relative; width:100px; height:100px; margin:0 auto; }
.ring-gauge__svg{ width:100%; height:100%; transform:rotate(-90deg); }
.ring-gauge__track{
  fill:none; stroke:var(--bg-beige); stroke-width:11;
}
.ring-gauge__fill{
  fill:none; stroke:url(#ringGradient); stroke-width:11;
  stroke-linecap:round;
  stroke-dasharray:314.16; /* 2 * π * 50 */
  stroke-dashoffset:314.16;
  transition:stroke-dashoffset 1s var(--ease-soft);
}
.ring-gauge__center{
  position:absolute; inset:0;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
}
.ring-gauge__percent{ font-family:var(--font-mono); font-weight:600; font-size:1.15rem; color:var(--brown-600); }
.ring-gauge__label{ font-size:.62rem; color:var(--text-muted); text-align:center; }

.stat-cards-row-secondary{ margin-bottom:22px; }
.mini-stat{
  display:flex; align-items:center; gap:12px;
  background:var(--bg-beige-soft);
  border-radius:var(--radius-md);
  padding:14px 18px;
}
.mini-stat i{ color:var(--clay-500); font-size:1.1rem; }
.mini-stat__value{ display:block; font-family:var(--font-mono); font-weight:600; color:var(--text-strong); }
.mini-stat__label{ display:block; font-size:.75rem; color:var(--text-muted); }


/* ---------------------------------------------------------------------
   8) PANELS (Charts / Tables container)
   --------------------------------------------------------------------- */
.panel{
  background:var(--bg-card);
  border:1px solid var(--border-soft);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-sm);
  height:100%;
  overflow:hidden;
}
.panel__header{
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 22px 0;
}
.panel__header h2{ font-size:1rem; font-weight:600; }
.panel__body{ padding:16px 22px 22px; }

.charts-row{ margin-bottom:18px; }
.chart-holder{ position:relative; height:230px; }

.tables-row .panel__body{ padding:8px 8px 12px; }


/* ---------------------------------------------------------------------
   9) TABLES
   --------------------------------------------------------------------- */
.app-table{ margin:0; font-size:.87rem; }
.app-table thead th{
  border:none;
  color:var(--text-muted);
  font-weight:600;
  font-size:.72rem;
  text-transform:uppercase;
  letter-spacing:.04em;
  padding:10px 14px;
  background:var(--bg-beige-soft);
}
.app-table thead tr th:first-child{ border-radius:10px 0 0 10px; }
.app-table thead tr th:last-child{ border-radius:0 10px 10px 0; }
.app-table tbody td{
  padding:12px 14px;
  border-bottom:1px solid var(--border-soft);
  color:var(--text-body);
  vertical-align:middle;
}
.app-table tbody tr:last-child td{ border-bottom:none; }
.app-table tbody tr{ transition:background .15s; }
.app-table tbody tr:hover{ background:var(--bg-beige-soft); }
.app-table td.text-end, .app-table th.text-end{ text-align:right; font-family:var(--font-mono); }

.row-invalid td{ background:rgba(176,80,59,.07); }
.row-duplicate td{ background:rgba(217,165,60,.1); }


/* ---------------------------------------------------------------------
   10) PROJECT CARDS
   --------------------------------------------------------------------- */
.project-card{
  background:var(--bg-card);
  border:1px solid var(--border-soft);
  border-radius:var(--radius-lg);
  padding:20px;
  cursor:pointer;
  height:100%;
  box-shadow:var(--shadow-sm);
  transition:transform .25s var(--ease-soft), box-shadow .25s var(--ease-soft);
}
.project-card:hover{ transform:translateY(-4px); box-shadow:var(--shadow-md); }
.project-card__top{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:14px; }
.project-card__name{ font-family:var(--font-display); font-weight:600; font-size:1rem; color:var(--text-strong); }
.project-card__row{ display:flex; justify-content:space-between; font-size:.82rem; color:var(--text-muted); margin-bottom:6px; }
.project-card__row span:last-child{ font-family:var(--font-mono); color:var(--text-strong); }

.badge-status{
  display:inline-flex; align-items:center; gap:6px;
  padding:4px 12px; border-radius:var(--radius-pill);
  font-size:.7rem; font-weight:600;
  background:var(--bg-beige); color:var(--brown-600);
}
.badge-status.is-active{ background:rgba(140,155,125,.18); color:#5e6e50; }
.badge-status.is-hold{ background:rgba(217,165,60,.18); color:#8a6d1f; }
.badge-status.is-completed{ background:rgba(107,68,35,.15); color:var(--brown-700); }
[data-theme="dark"] .badge-status.is-active{ background:rgba(140,155,125,.22); color:#B7C7A6; }
[data-theme="dark"] .badge-status.is-hold{ background:rgba(217,165,60,.22); color:#E3C273; }
[data-theme="dark"] .badge-status.is-completed{ background:rgba(201,129,79,.2); color:#E0B896; }


/* ---------------------------------------------------------------------
   11) PROGRESS BAR
   --------------------------------------------------------------------- */
.app-progress{
  height:10px; border-radius:var(--radius-pill);
  background:var(--bg-beige); overflow:hidden;
}
.app-progress .progress-bar{
  background:linear-gradient(90deg, var(--clay-500), var(--brown-600));
  transition:width .8s var(--ease-soft);
}
.app-progress.is-danger .progress-bar{
  background:linear-gradient(90deg,#c66a51, var(--danger-500));
}


/* ---------------------------------------------------------------------
   12) PROJECT DETAIL
   --------------------------------------------------------------------- */
.btn-back{
  display:inline-flex; align-items:center; gap:8px;
  background:none; border:none; color:var(--brown-600);
  font-size:.85rem; padding:6px 0; margin-bottom:14px;
  cursor:pointer;
}
.btn-back:hover{ text-decoration:underline; }

.project-detail-header{ margin-bottom:18px; }
.pd-header__top{ display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:18px; flex-wrap:wrap; }
.pd-header__stats{ display:flex; gap:32px; margin-bottom:14px; flex-wrap:wrap; }
.pd-stat{ display:flex; flex-direction:column; gap:2px; }
.pd-stat__label{ font-size:.75rem; color:var(--text-muted); }
.pd-stat__value{ font-family:var(--font-mono); font-weight:600; font-size:1.1rem; color:var(--text-strong); }


/* ---------------------------------------------------------------------
   13) REPORTS
   --------------------------------------------------------------------- */
.report-panel .panel__body{ display:flex; flex-direction:column; gap:14px; }
.report-export-btns{ display:flex; gap:10px; flex-wrap:wrap; }
.btn-export{
  flex:1; min-width:88px;
  border:1px solid var(--border-subtle);
  background:var(--bg-beige-soft);
  color:var(--brown-700);
  border-radius:var(--radius-sm);
  padding:.5rem .8rem;
  font-size:.8rem;
  transition:background .2s, transform .2s;
}
.btn-export:hover{ background:var(--bg-beige); transform:translateY(-2px); }


/* ---------------------------------------------------------------------
   14) BUTTONS (shared)
   --------------------------------------------------------------------- */
.btn-primary-brown{
  background:linear-gradient(135deg, var(--clay-500), var(--brown-600));
  border:none; color:#fff;
  border-radius:var(--radius-pill);
  padding:.55rem 1.3rem;
  font-size:.86rem; font-weight:500;
  box-shadow:var(--shadow-sm);
  transition:transform .2s var(--ease-soft), box-shadow .2s;
}
.btn-primary-brown:hover{ color:#fff; transform:translateY(-2px); box-shadow:var(--shadow-md); }
.btn-primary-brown:active{ transform:translateY(0); }

.btn-outline-secondary{
  border-radius:var(--radius-pill);
  border-color:var(--border-subtle);
  color:var(--text-body);
  font-size:.86rem;
}
.btn-outline-secondary:hover{
  background:var(--bg-beige-soft);
  border-color:var(--border-subtle);
  color:var(--text-strong);
}


/* ---------------------------------------------------------------------
   15) MODALS
   --------------------------------------------------------------------- */
.modal-content{
  border:none; border-radius:var(--radius-lg);
  box-shadow:var(--shadow-lg);
  background:var(--bg-card);
  color:var(--text-body);
}
.modal-header{ border-bottom:1px solid var(--border-soft); padding:18px 24px; }
.modal-title{ font-family:var(--font-display); font-size:1.05rem; }
.modal-body{ padding:20px 24px; }
.modal-footer{ border-top:1px solid var(--border-soft); padding:16px 24px; }
.form-label{ font-size:.82rem; color:var(--text-muted); font-weight:500; }
.form-control, .form-select{
  border-radius:var(--radius-sm);
  border-color:var(--border-subtle);
  font-size:.9rem;
  padding:.55rem .8rem;
  background-color:var(--bg-card);
  color:var(--text-strong);
}
.form-control:focus, .form-select:focus{
  border-color:var(--clay-500);
  box-shadow:0 0 0 .15rem rgba(169,113,66,.15);
  background-color:var(--bg-card);
  color:var(--text-strong);
}


/* ---------------------------------------------------------------------
   16) TOAST
   --------------------------------------------------------------------- */
.app-toast{
  min-width:280px;
  background:var(--bg-card);
  border:1px solid var(--border-soft);
  border-left:4px solid var(--clay-500);
  border-radius:var(--radius-sm);
  box-shadow:var(--shadow-md);
  padding:12px 16px;
  display:flex; align-items:center; gap:10px;
  font-size:.85rem;
  color:var(--text-strong);
  animation:toastIn .3s var(--ease-soft);
}
.app-toast.is-success{ border-left-color:var(--sage-500); }
.app-toast.is-error{ border-left-color:var(--danger-500); }
@keyframes toastIn{
  from{ opacity:0; transform:translateX(20px); }
  to{ opacity:1; transform:translateX(0); }
}


/* ---------------------------------------------------------------------
   17) SETTINGS — Theme switch
   --------------------------------------------------------------------- */
.theme-switch{ display:flex; gap:16px; flex-wrap:wrap; }
.theme-option{
  display:flex; align-items:center; gap:8px;
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-pill);
  padding:.5rem 1rem;
  cursor:pointer;
  font-size:.85rem;
}
.theme-option input{ accent-color:var(--brown-600); }


/* ---------------------------------------------------------------------
   18) SKELETON LOADING
   --------------------------------------------------------------------- */
.skeleton{
  background:linear-gradient(90deg, var(--bg-beige-soft) 25%, var(--bg-beige) 37%, var(--bg-beige-soft) 63%);
  background-size:400% 100%;
  animation:skeletonShine 1.4s ease infinite;
  border-radius:8px;
}
@keyframes skeletonShine{
  0%{ background-position:100% 50%; }
  100%{ background-position:0 50%; }
}


/* ---------------------------------------------------------------------
   19) RESPONSIVE
   --------------------------------------------------------------------- */
@media (max-width: 991.98px){
  .sidebar{ transform:translateX(-100%); width:var(--sidebar-w); }
  .sidebar.is-open{ transform:translateX(0); box-shadow:var(--shadow-lg); }
  .sidebar.is-collapsed{ width:var(--sidebar-w); }
  .sidebar.is-collapsed .brand-text,
  .sidebar.is-collapsed .nav-link span{ opacity:1; pointer-events:auto; }
  .sidebar__footer{ display:none; }

  .main-wrapper, .sidebar.is-collapsed ~ .main-wrapper{ margin-left:0; }
  .topbar__menu-btn{ display:flex; align-items:center; justify-content:center; }
}

@media (max-width: 767.98px){
  .content{ padding:20px 16px 8px; }
  .topbar{ padding:14px 16px; flex-wrap:wrap; }
  .topbar__filters{ width:100%; margin-left:0; }
  .topbar__filters .form-select{ flex:1; min-width:0; }
  .pd-header__stats{ gap:18px; }
}

@media (prefers-reduced-motion: reduce){
  *{ animation-duration:.001ms !important; transition-duration:.001ms !important; }
}
