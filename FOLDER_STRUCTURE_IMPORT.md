/**
 * ==========================================================================
 * Marketing Budget Dashboard — API Layer
 * เรียก Google Apps Script Web App (CONFIG.API_URL) เพื่ออ่าน/เขียนข้อมูล
 * ==========================================================================
 */
const Api = (() => {

  function isConfigured() {
    return !!CONFIG.API_URL && !CONFIG.API_URL.startsWith('PASTE_');
  }

  async function fetchAll() {
    if (!isConfigured()) {
      throw new Error('ยังไม่ได้ตั้งค่า API_URL ใน assets/js/config.js');
    }
    const res = await fetch(CONFIG.API_URL, { method: 'GET' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'โหลดข้อมูลไม่สำเร็จ');
    return json.data; // { projects, expenses, categories, years }
  }

  async function send(action, payload) {
    if (!isConfigured()) {
      throw new Error('ยังไม่ได้ตั้งค่า API_URL ใน assets/js/config.js');
    }
    // ใช้ text/plain เพื่อเลี่ยง CORS preflight ของ Google Apps Script
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'บันทึกข้อมูลไม่สำเร็จ');
    return json.data;
  }

  return {
    isConfigured,
    fetchAll,
    addProject: (p) => send('addProject', p),
    updateProject: (p) => send('updateProject', p),
    deleteProject: (id) => send('deleteProject', { id }),

    addExpense: (p) => send('addExpense', p),
    updateExpense: (p) => send('updateExpense', p),
    deleteExpense: (id) => send('deleteExpense', { id }),

    addCategory: (p) => send('addCategory', p),
    deleteCategory: (id) => send('deleteCategory', { id }),

    addYear: (p) => send('addYear', p),
    updateYear: (p) => send('updateYear', p),
    deleteYear: (id) => send('deleteYear', { id })
  };
})();
