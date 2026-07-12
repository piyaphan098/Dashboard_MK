/**
 * ==========================================================================
 * Marketing Budget Dashboard — Google Apps Script Backend
 * ==========================================================================
 * วิธีใช้:
 * 1. สร้าง Google Sheet ใหม่ ตั้งชื่อ Sheet (Tab) ดังนี้ (ตัวสะกดต้องตรงเป๊ะ):
 *    - Projects    : ProjectID | ProjectName | Budget | StartDate | EndDate | Status
 *    - Expenses    : ExpenseID | ProjectID | Date | Category | Description | Vendor | Amount | Remark
 *    - Categories  : CategoryID | CategoryName
 *    - Years       : YearID | Year | Budget   (Budget = งบประมาณรวมของปีนั้น ใส่เองใน Settings > Budget Year)
 * 2. เปิด Extensions > Apps Script แล้ววางโค้ดไฟล์นี้ทั้งหมด (ลบโค้ดเดิมออกก่อน)
 * 3. กด Deploy > New deployment > เลือกประเภท "Web app"
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. คัดลอก Web app URL ที่ได้ ไปใส่ใน assets/js/config.js (ค่า API_URL)
 * ==========================================================================
 */

const SHEET_PROJECTS = 'Projects';
const SHEET_EXPENSES = 'Expenses';
const SHEET_CATEGORIES = 'Categories';
const SHEET_YEARS = 'Years';
const SHEET_IMPORT_HISTORY = 'ImportHistory'; // สร้าง Tab นี้เพิ่มถ้าต้องการใช้ฟีเจอร์ Import Wizard

function doGet(e) {
  try {
    const data = {
      projects: readSheet_(SHEET_PROJECTS),
      expenses: readSheet_(SHEET_EXPENSES),
      categories: readSheet_(SHEET_CATEGORIES),
      years: readSheet_(SHEET_YEARS),
      importHistory: readSheetOptional_(SHEET_IMPORT_HISTORY) // ไม่มี Tab นี้ก็ไม่พัง คืน [] แทน
    };
    return jsonResponse_({ success: true, data: data });
  } catch (err) {
    return jsonResponse_({ success: false, message: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};
    let result;

    switch (action) {
      // ---- Projects ----
      case 'addProject':
        result = addRow_(SHEET_PROJECTS, 'ProjectID', ['ProjectName', 'Budget', 'StartDate', 'EndDate', 'Status'], payload);
        break;
      case 'updateProject':
        result = updateRow_(SHEET_PROJECTS, 'ProjectID', payload);
        break;
      case 'deleteProject':
        result = deleteRow_(SHEET_PROJECTS, 'ProjectID', payload.id);
        deleteExpensesByProject_(payload.id); // ลบรายการค่าใช้จ่ายที่ผูกกับโปรเจกต์นี้ไปด้วย ป้องกันข้อมูลค้าง
        break;

      // ---- Expenses ----
      case 'addExpense':
        result = addRow_(SHEET_EXPENSES, 'ExpenseID', ['ProjectID', 'Date', 'Category', 'Description', 'Vendor', 'Amount', 'Remark'], payload);
        break;
      case 'updateExpense':
        result = updateRow_(SHEET_EXPENSES, 'ExpenseID', payload);
        break;
      case 'deleteExpense':
        result = deleteRow_(SHEET_EXPENSES, 'ExpenseID', payload.id);
        break;

      // ---- Categories ----
      case 'addCategory':
        result = addRow_(SHEET_CATEGORIES, 'CategoryID', ['CategoryName'], payload);
        break;
      case 'deleteCategory':
        result = deleteRow_(SHEET_CATEGORIES, 'CategoryID', payload.id);
        break;

      // ---- Years ----
      case 'addYear':
        result = addRow_(SHEET_YEARS, 'YearID', ['Year', 'Budget'], payload);
        break;
      case 'updateYear':
        result = updateRow_(SHEET_YEARS, 'YearID', payload);
        break;
      case 'deleteYear':
        result = deleteRow_(SHEET_YEARS, 'YearID', payload.id);
        break;

      // ---- Import Wizard ----
      case 'batchImportExpenses':
        result = batchImportExpenses_(payload.rows, payload.mode);
        break;
      case 'logImport':
        result = logImportHistory_(payload);
        break;

      default:
        throw new Error('Unknown action: ' + action);
    }

    return jsonResponse_({ success: true, data: result });
  } catch (err) {
    return jsonResponse_({ success: false, message: err.message });
  }
}

/* ------------------------- Helpers ------------------------- */

function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('ไม่พบ Sheet ชื่อ "' + name + '" กรุณาสร้าง Tab นี้ก่อน');
  return sheet;
}

function readSheet_(name) {
  const sheet = getSheet_(name);
  const values = sheet.getDataRange().getValues();
  if (values.length < 1) return [];
  const headers = values[0];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i].join('') === '') continue; // skip empty rows
    const obj = {};
    headers.forEach((h, idx) => {
      let v = values[i][idx];
      if (v instanceof Date) v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      obj[h] = v;
    });
    rows.push(obj);
  }
  return rows;
}

function addRow_(sheetName, idField, fields, payload) {
  const sheet = getSheet_(sheetName);
  const newId = idField + '_' + new Date().getTime();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => {
    if (h === idField) return newId;
    return payload[h] !== undefined ? payload[h] : '';
  });
  sheet.appendRow(row);
  const obj = {};
  headers.forEach((h, i) => obj[h] = row[i]);
  return obj;
}

function updateRow_(sheetName, idField, payload) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf(idField);
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(payload[idField])) {
      headers.forEach((h, col) => {
        if (h !== idField && payload[h] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(payload[h]);
        }
      });
      return payload;
    }
  }
  throw new Error('ไม่พบข้อมูล ' + idField + ' = ' + payload[idField]);
}

function deleteRow_(sheetName, idField, id) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf(idField);
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { id: id };
    }
  }
  throw new Error('ไม่พบข้อมูล ' + idField + ' = ' + id);
}

// ลบรายการค่าใช้จ่าย (Expenses) ทั้งหมดที่ผูกกับ ProjectID ที่ระบุ — เรียกใช้ตอนลบโปรเจกต์
// เพื่อไม่ให้มีรายการค่าใช้จ่ายค้างอยู่โดยไม่มีโปรเจกต์อ้างอิง
function deleteExpensesByProject_(projectId) {
  const sheet = getSheet_(SHEET_EXPENSES);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const projCol = headers.indexOf('ProjectID');
  // ลบจากแถวล่างขึ้นบน เพื่อไม่ให้เลขแถวเลื่อนระหว่างลบ
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][projCol]) === String(projectId)) {
      sheet.deleteRow(i + 1);
    }
  }
}

// เหมือน readSheet_ แต่ถ้าไม่มี Tab นี้ จะคืน [] แทนที่จะ throw (ใช้กับ Tab ที่เป็น optional เช่น ImportHistory)
function readSheetOptional_(name) {
  try {
    return readSheet_(name);
  } catch (err) {
    return [];
  }
}

/* ------------------------- Import Wizard Backend -------------------------
 * เขียนข้อมูลเป็น Array ทีเดียวด้วย setValues() แทน appendRow() ทีละแถว
 * เพื่อความเร็วเมื่อ Import ข้อมูลจำนวนมาก
 * --------------------------------------------------------------------- */

function batchImportExpenses_(rows, mode) {
  if (!rows || !rows.length) throw new Error('ไม่มีข้อมูลให้ Import');

  const sheet = getSheet_(SHEET_EXPENSES);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  if (mode === 'replace') {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  const now = new Date().getTime();
  const newRows = rows.map((r, i) => {
    const projectId = resolveProjectId_(r.Project);
    ensureCategoryExists_(r.Category);
    const rowObj = {
      ExpenseID: 'ExpenseID_' + now + '_' + i,
      ProjectID: projectId,
      Date: r.Date || '',
      Category: r.Category || '',
      Description: r.Description || '',
      Vendor: r.Vendor || '',
      Amount: Number(r.Amount) || 0,
      Remark: r.Remark || ''
    };
    return headers.map((h) => rowObj[h] !== undefined ? rowObj[h] : '');
  });

  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, newRows.length, headers.length).setValues(newRows);

  return { imported: newRows.length };
}

// หา ProjectID จากชื่อโปรเจกต์ (case-insensitive) ถ้าไม่พบให้สร้างโปรเจกต์ใหม่ (Budget = 0, รอผู้ใช้แก้ไข)
function resolveProjectId_(projectName) {
  const name = String(projectName || '').trim();
  if (!name) return '';

  const sheet = getSheet_(SHEET_PROJECTS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const nameCol = headers.indexOf('ProjectName');
  const idCol = headers.indexOf('ProjectID');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][nameCol]).trim().toLowerCase() === name.toLowerCase()) {
      return values[i][idCol];
    }
  }

  // ไม่พบ -> สร้างโปรเจกต์ใหม่อัตโนมัติ
  const created = addRow_(SHEET_PROJECTS, 'ProjectID', ['ProjectName', 'Budget', 'StartDate', 'EndDate', 'Status'], {
    ProjectName: name, Budget: 0, StartDate: '', EndDate: '', Status: 'Active'
  });
  return created.ProjectID;
}

// สร้าง Category ใหม่อัตโนมัติถ้ายังไม่มีในระบบ (เงียบๆ ไม่ throw ถ้าซ้ำ)
function ensureCategoryExists_(categoryName) {
  const name = String(categoryName || '').trim();
  if (!name) return;
  const sheet = getSheet_(SHEET_CATEGORIES);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const nameCol = headers.indexOf('CategoryName');
  const exists = values.slice(1).some((row) => String(row[nameCol]).trim().toLowerCase() === name.toLowerCase());
  if (!exists) {
    addRow_(SHEET_CATEGORIES, 'CategoryID', ['CategoryName'], { CategoryName: name });
  }
}

function logImportHistory_(payload) {
  const sheet = getSheet_(SHEET_IMPORT_HISTORY); // ต้องสร้าง Tab นี้ไว้ก่อน ไม่งั้นจะ throw (ถูก catch ที่ import-api.js แล้ว ไม่ critical)
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  sheet.appendRow([now, payload.Username || '-', payload.Filename || '-', payload.Rows || 0, payload.Mode || '-', payload.Status || '-']);
  return { logged: true };
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
