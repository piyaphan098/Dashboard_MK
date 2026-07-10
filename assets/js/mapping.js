/**
 * ==========================================================================
 * mapping.js — จับคู่คอลัมน์ Excel กับฟิลด์ของระบบ
 * ==========================================================================
 */
const Mapping = (() => {
  const FIELDS = ['Date', 'Project', 'Category', 'Description', 'Vendor', 'Amount', 'Remark'];

  // คำที่ใช้เทียบแบบ Fuzzy (ตัวพิมพ์เล็ก, ตัดช่องว่าง) ต่อฟิลด์
  const SYNONYMS = {
    Date: ['date', 'วันที่', 'วัน'],
    Project: ['project', 'โครงการ', 'ชื่อโครงการ', 'projectname'],
    Category: ['category', 'หมวด', 'หมวดหมู่', 'ประเภท'],
    Description: ['description', 'รายละเอียด', 'รายการ', 'desc'],
    Vendor: ['vendor', 'ผู้ขาย', 'ร้านค้า', 'supplier'],
    Amount: ['amount', 'ราคา', 'จำนวนเงิน', 'ยอดเงิน', 'เงิน', 'ค่าใช้จ่ายจริง', 'ค่าใช้จ่าย', 'ราคา (บาท)', 'total'],
    Remark: ['remark', 'หมายเหตุ', 'note', 'comment']
  };

  // ฟิลด์เหล่านี้มักถูกเว้นว่างในแถวต่อเนื่อง (merged cell ใน Excel ต้นฉบับ)
  // ระบบจะเติมค่าจากแถวก่อนหน้าให้อัตโนมัติ (Forward Fill)
  const FORWARD_FILL_FIELDS = ['Project', 'Category'];

  function normalize(s) {
    return String(s || '').trim().toLowerCase().replace(/\s+/g, '');
  }

  function autoMap(headers) {
    return headers.map((header, index) => {
      const norm = normalize(header);
      let matchedField = null;
      for (const field of FIELDS) {
        if (SYNONYMS[field].some((syn) => norm.includes(normalize(syn)))) {
          matchedField = field;
          break;
        }
      }
      return { index, header, field: matchedField };
    });
  }

  // นำ mapping + dataRows(array of array) มาแปลงเป็น object ตาม field พร้อม Forward Fill
  function buildMappedRows(dataRows, mappingList) {
    const activeMap = mappingList.filter((m) => m.field);
    const lastSeen = {};
    return dataRows.map((row) => {
      const obj = {};
      activeMap.forEach((m) => {
        let val = row[m.index] !== undefined ? String(row[m.index]).trim() : '';
        if (!val && FORWARD_FILL_FIELDS.includes(m.field) && lastSeen[m.field]) {
          val = lastSeen[m.field];
        }
        if (val) lastSeen[m.field] = val;
        obj[m.field] = val;
      });
      FIELDS.forEach((f) => { if (obj[f] === undefined) obj[f] = ''; });
      return obj;
    });
  }

  return { FIELDS, autoMap, buildMappedRows };
})();
