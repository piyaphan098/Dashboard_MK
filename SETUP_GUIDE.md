# คู่มือตั้งค่าเชื่อมต่อ Google Sheets (ตั้งแต่ต้น)

ไฟล์ที่เพิ่มให้ในรอบนี้:
- `assets/js/config.js`
- `assets/js/api.js`
- `assets/js/script.js`
- `apps-script/apps-script.gs`

## ขั้นตอนที่ 1 — สร้าง Google Sheet

1. ไปที่ [sheets.google.com](https://sheets.google.com) สร้างไฟล์ใหม่ ตั้งชื่อ เช่น `Marketing Budget Data`
2. สร้าง Tab (Sheet) ทั้งหมด 4 อัน ตั้งชื่อให้ตรงเป๊ะ แล้วใส่หัวตารางแถวแรกตามนี้:

**Tab: `Projects`**
| ProjectID | ProjectName | Budget | StartDate | EndDate | Status |
|---|---|---|---|---|---|

**Tab: `Expenses`**
| ExpenseID | ProjectID | Date | Category | Description | Vendor | Amount | Remark |
|---|---|---|---|---|---|---|---|

**Tab: `Categories`**
| CategoryID | CategoryName |
|---|---|

**Tab: `Years`**
| YearID | Year |
|---|---|

**Tab: `ImportHistory`** (ใช้กับหน้า Import Data / import.html — ถ้าไม่สร้างไว้ ระบบยังทำงานได้ปกติ แค่จะไม่บันทึกประวัติการ Import)
| ImportDate | Username | Filename | Rows | Mode | Status |
|---|---|---|---|---|---|

(ไม่ต้องใส่ข้อมูลตัวอย่าง ระบบจะเพิ่มแถวให้เองเวลากด Add หรือ Import จากหน้าเว็บ)

## ขั้นตอนที่ 2 — ใส่ Apps Script

1. ในสเปรดชีตเดียวกัน ไปที่เมนู **Extensions > Apps Script**
2. ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดทั้งหมดจากไฟล์ `apps-script/apps-script.gs` ที่แนบมาให้
3. กด บันทึก (Ctrl+S)

## ขั้นตอนที่ 3 — Deploy เป็น Web App

1. กดปุ่ม **Deploy > New deployment**
2. เลือกไอคอนเฟือง (Select type) → **Web app**
3. ตั้งค่า:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. กด **Deploy** แล้วอนุญาต (Authorize) สิทธิ์การเข้าถึงตามที่ Google ขอ
5. คัดลอก **Web app URL** ที่ได้ (จะมีรูปแบบ `https://script.google.com/macros/s/xxxxx/exec`)

> ⚠️ ทุกครั้งที่แก้โค้ด `.gs` ต้องกด **Deploy > Manage deployments > แก้ไข (ไอคอนดินสอ) > New version > Deploy** ใหม่ ไม่งั้น URL เดิมจะยังใช้โค้ดเวอร์ชันเก่าอยู่

## ขั้นตอนที่ 4 — ใส่ URL ในโปรเจกต์

เปิดไฟล์ `assets/js/config.js` แล้วแก้บรรทัด:

```js
const CONFIG = {
  API_URL: 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
};
```

เป็น URL ที่คัดลอกมาจากขั้นตอนที่ 3 เช่น:

```js
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycb.../exec'
};
```

## ขั้นตอนที่ 5 — Deploy หน้าเว็บใหม่บน Cloudflare Workers

จากภาพหน้าจอที่ส่งมา เว็บรันอยู่บน Cloudflare Workers (`dashboard-mk.greenwoodstaff03.workers.dev`) ผ่าน `wrangler.jsonc` ที่มีอยู่แล้ว ให้รันคำสั่งนี้จากโฟลเดอร์โปรเจกต์ (เครื่องที่มี Node.js/npm):

```bash
npx wrangler deploy
```

หรือถ้าใช้ GitHub เชื่อมกับ Cloudflare Pages/Workers อัตโนมัติอยู่แล้ว แค่ push โค้ดที่แก้ขึ้น GitHub repo `piyaphan098/Dashboard_MK` ระบบจะ deploy ให้เองตาม pipeline เดิม

## ทดสอบ

เปิดหน้าเว็บใหม่ → ควรเห็นข้อมูล (หรือ "ยังไม่มีข้อมูล" ถ้า Sheet ว่าง) แทนที่จะค้างที่ "กำลังโหลดข้อมูลงบประมาณ..." และกดปุ่ม "Add Project" ทดสอบเพิ่มข้อมูล แล้วเช็คว่าไปโผล่ใน Google Sheet จริงไหม

## นำเข้าข้อมูลเก่าจากไฟล์ "งบประมาณการตลาดปี 2569.xlsx"

ไฟล์ Excel เดิมที่ส่งมามีโครงสร้างซับซ้อน (มีชีทสรุปรวม + ชีทย่อยของแต่ละโปรเจกต์ ไม่มีคอลัมน์วันที่)
ซึ่งไม่เหมาะกับการใช้ Import Wizard แบบอัตโนมัติ (Wizard ต้องการคอลัมน์วันที่และ 1 แถว = 1 รายการที่ชัดเจน)
ผมจึงแปลงข้อมูลให้แล้วเป็น 2 ไฟล์ พร้อมนำเข้า Google Sheet ได้ทันที:

- `projects_seed.csv` — 11 โปรเจกต์ (บางโปรเจกต์ไม่มี Budget ระบุในไฟล์เดิม ใส่ไว้เป็น 0 ให้ไปกรอกเพิ่มเอง)
- `expenses_seed.csv` — 36 รายการค่าใช้จ่าย (คอลัมน์ Date ว่างทั้งหมด เพราะไฟล์เดิมไม่มีข้อมูลวันที่ — แนะนำให้กรอกวันที่จริงหลัง Import เพื่อให้กราฟรายเดือนในหน้า Dashboard ทำงานถูกต้อง)

**วิธีนำเข้า:** เปิด Google Sheet ที่สร้างไว้ → ไปที่ Tab `Projects` → เมนู File > Import > Upload > เลือก
`projects_seed.csv` → เลือก "Append to current sheet" (ต่อท้าย ไม่ทับของเดิม) → ทำแบบเดียวกันกับ Tab `Expenses`
ด้วยไฟล์ `expenses_seed.csv`

## ใช้งาน Import Wizard (import.html) สำหรับไฟล์ในอนาคต

ตอนนี้หน้า Import Data ใช้งานได้แล้วครบ 5 ขั้นตอน (Upload → Preview → Column Mapping → Validation → Import)
เหมาะกับไฟล์ Excel ที่เป็นตาราง 1 แถว = 1 รายการค่าใช้จ่าย และ **มีคอลัมน์วันที่** เท่านั้น — ระบบจะข้าม
(Skip) แถวที่ไม่มีวันที่/ไม่มีชื่อโปรเจกต์/ไม่มีจำนวนเงินโดยอัตโนมัติ และจะสร้างโปรเจกต์หรือหมวดหมู่ใหม่ให้เอง
ถ้าชื่อในไฟล์ยังไม่มีอยู่ในระบบ

## หมายเหตุขอบเขตของรอบนี้

- ปุ่ม Export ใน Reports: รองรับเฉพาะ **CSV** ในตอนนี้ (Excel/PDF ยังไม่ได้ทำ)
