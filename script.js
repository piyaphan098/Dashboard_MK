/**
 * ==========================================================================
 * excel-reader.js — อ่านไฟล์ Excel ด้วย SheetJS
 * คืนค่ารายชื่อ Sheet + ข้อมูลดิบ (Array of Array) ต่อ Sheet
 * ==========================================================================
 */
const ExcelReader = (() => {

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target.result);
          const wb = XLSX.read(data, { type: 'array', cellDates: true });
          const sheets = wb.SheetNames.map((name) => {
            const ws = wb.Sheets[name];
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
            return { name, rows: trimEmptyRows(rows) };
          });
          resolve({ fileName: file.name, fileSize: file.size, sheets });
        } catch (err) {
          reject(new Error('ไม่สามารถอ่านไฟล์นี้ได้: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'));
      reader.readAsArrayBuffer(file);
    });
  }

  // ตัดแถวว่างท้ายไฟล์ทิ้ง (SheetJS มักคืนแถวว่างจำนวนมากตามขนาด used-range เดิม)
  function trimEmptyRows(rows) {
    let lastNonEmpty = -1;
    rows.forEach((r, i) => {
      if (r.some((c) => String(c).trim() !== '')) lastNonEmpty = i;
    });
    return rows.slice(0, lastNonEmpty + 1);
  }

  // หา header row แรกที่มีเซลล์ไม่ว่างอย่างน้อย 2 เซลล์ (heuristic)
  function detectHeaderRowIndex(rows) {
    for (let i = 0; i < rows.length; i++) {
      const filled = rows[i].filter((c) => String(c).trim() !== '').length;
      if (filled >= 2) return i;
    }
    return 0;
  }

  function toObjects(rows) {
    const headerIdx = detectHeaderRowIndex(rows);
    const headers = rows[headerIdx].map((h, i) => (String(h).trim() || `Column${i + 1}`));
    const dataRows = rows.slice(headerIdx + 1).filter((r) => r.some((c) => String(c).trim() !== ''));
    return { headers, headerIdx, dataRows };
  }

  return { readFile, toObjects, detectHeaderRowIndex };
})();
