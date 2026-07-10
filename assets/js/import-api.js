/**
 * ==========================================================================
 * import-api.js — เรียก Apps Script เฉพาะสำหรับ Import (Batch Write)
 * ใช้ Web App URL เดียวกับ api.js (CONFIG.API_URL) แต่คนละ action
 * ==========================================================================
 */
const ImportApi = (() => {

  async function send(action, payload) {
    if (!Api.isConfigured()) throw new Error('ยังไม่ได้ตั้งค่า API_URL ใน assets/js/config.js');
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Import ไม่สำเร็จ');
    return json.data;
  }

  // ส่งเป็น batch (chunk ละ ~25 แถว) พร้อม callback รายงานความคืบหน้า
  async function importBatches(rows, mode, filename, username, onProgress) {
    const chunkSize = 25;
    const chunks = [];
    for (let i = 0; i < rows.length; i += chunkSize) chunks.push(rows.slice(i, i + chunkSize));

    let success = 0, failed = 0;
    for (let i = 0; i < chunks.length; i++) {
      const isFirstChunk = i === 0;
      // โหมด replace ใช้แค่ chunk แรกเป็นตัวล้างข้อมูลเดิม ที่เหลือ append ต่อ
      const effectiveMode = isFirstChunk ? mode : 'append';
      try {
        await send('batchImportExpenses', { rows: chunks[i], mode: effectiveMode });
        success += chunks[i].length;
      } catch (err) {
        failed += chunks[i].length;
      }
      if (onProgress) onProgress(Math.round(((i + 1) / chunks.length) * 100), i + 1, chunks.length);
    }

    try {
      await send('logImport', {
        Filename: filename, Username: username || '-', Rows: rows.length,
        Mode: mode, Status: failed === 0 ? 'Success' : (success === 0 ? 'Failed' : 'Partial')
      });
    } catch (e) { /* ไม่ critical หากบันทึกประวัติไม่สำเร็จ */ }

    return { success, failed, total: rows.length };
  }

  return { importBatches };
})();
