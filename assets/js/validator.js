/**
 * ==========================================================================
 * validator.js — ตรวจสอบความถูกต้องของข้อมูลก่อน Import
 * ==========================================================================
 */
const Validator = (() => {

  function isValidDate(str) {
    if (!str) return false;
    const d = new Date(str);
    return !isNaN(d.getTime());
  }

  function toIsoDate(str) {
    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }

  function validateRow(row, projectNames, seenKeys, existingKeys) {
    const reasons = [];

    if (!row.Date || !isValidDate(row.Date)) reasons.push('ไม่มีวันที่ หรือรูปแบบวันที่ไม่ถูกต้อง');
    if (!row.Project) reasons.push('ไม่ระบุโปรเจกต์');
    if (!row.Description) reasons.push('ไม่มีคำอธิบายรายการ');
    const amountNum = Number(String(row.Amount).replace(/,/g, ''));
    if (!row.Amount || isNaN(amountNum) || amountNum <= 0) reasons.push('จำนวนเงินไม่ถูกต้อง');

    const isoDate = isValidDate(row.Date) ? toIsoDate(row.Date) : row.Date;
    const key = [isoDate, row.Project, row.Description, amountNum].join('|').toLowerCase();

    let status = reasons.length ? 'invalid' : 'valid';
    if (status === 'valid' && (seenKeys.has(key) || existingKeys.has(key))) {
      status = 'duplicate';
      reasons.push('ข้อมูลนี้อาจซ้ำกับรายการที่มีอยู่แล้ว');
    }
    if (status === 'valid') seenKeys.add(key);

    return {
      ...row,
      Date: isoDate,
      Amount: amountNum,
      status,
      reason: reasons.join(', ')
    };
  }

  // existingExpenses: array จากระบบปัจจุบัน (ใช้เช็คซ้ำ), projects: array โปรเจกต์ปัจจุบัน (สำหรับอ้างอิงชื่อ ไม่บังคับต้องมีอยู่ก่อน)
  function validate(mappedRows, existingExpenses, projects) {
    const projectNames = new Set((projects || []).map((p) => String(p.ProjectName).trim().toLowerCase()));
    const existingKeys = new Set((existingExpenses || []).map((e) => [e.Date, '', e.Description, Number(e.Amount)].join('|').toLowerCase()));
    // หมายเหตุ: existingKeys ไม่รวมชื่อโปรเจกต์เพราะ Expense เดิมเก็บเป็น ProjectID ไม่ใช่ชื่อ — ใช้ Date+Description+Amount เป็นตัวเช็คซ้ำหลัก
    const seenKeys = new Set();

    const rows = mappedRows.map((row) => validateRow(row, projectNames, seenKeys, existingKeys));
    const summary = {
      total: rows.length,
      valid: rows.filter((r) => r.status === 'valid').length,
      invalid: rows.filter((r) => r.status === 'invalid').length,
      duplicate: rows.filter((r) => r.status === 'duplicate').length
    };
    return { rows, summary };
  }

  return { validate, isValidDate, toIsoDate };
})();
