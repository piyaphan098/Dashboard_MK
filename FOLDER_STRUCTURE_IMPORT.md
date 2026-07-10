# โครงสร้างโฟลเดอร์เพิ่มเติม — Excel Import Wizard

ฟีเจอร์นี้ต่อยอดจากโปรเจกต์เดิม (Marketing Budget Dashboard) โดยเพิ่มไฟล์ใหม่ตาม Coding Standard
ที่กำหนด แยกออกจากไฟล์เดิมทั้งหมด ไม่แก้โค้ดเดิมของ Dashboard

```
marketing-budget-dashboard/
│
├── index.html                     # (เดิม) Dashboard หลัก — เพิ่มเมนู "Import Data" ในไซด์บาร์
├── import.html                    # (ใหม่) หน้า Excel Import Wizard แบบ Step Wizard
│
├── assets/
│   ├── css/
│   │   ├── style.css              # (เดิม) ธีมหลักของระบบ
│   │   └── import.css             # (ใหม่) สไตล์เฉพาะหน้า Import Wizard (Stepper, Dropzone, ฯลฯ)
│   │
│   ├── js/
│   │   ├── config.js              # (เดิม) ใช้ร่วมกัน — ค่าคงที่ URL Apps Script
│   │   ├── api.js                 # (เดิม) เรียก Apps Script ของ Dashboard เดิม
│   │   ├── script.js              # (เดิม) Logic ของ Dashboard เดิม
│   │   │
│   │   ├── import.js              # (ใหม่) Controller หลักของ Wizard — คุม Step, State, Event
│   │   ├── excel-reader.js        # (ใหม่) อ่านไฟล์ Excel ด้วย SheetJS → คืน Sheet Names + Data
│   │   ├── mapping.js             # (ใหม่) Logic การจับคู่ Column (Auto Mapping + Manual Mapping)
│   │   ├── validator.js           # (ใหม่) ตรวจสอบความถูกต้องของข้อมูลก่อน Import
│   │   └── import-api.js          # (ใหม่) เรียก Apps Script เฉพาะสำหรับ Import (Batch Write)
│   │
│   └── img/
│       └── favicon.png
│
├── apps-script/
│   ├── apps-script.gs             # (เดิม) Backend หลักของ Dashboard (doGet/doPost CRUD)
│   └── apps-script-import.gs      # (ใหม่) Backend เฉพาะ Import — เขียนข้อมูลเป็น Array ทีเดียว
│                                   #        (ไม่ใช้ appendRow เพื่อความเร็วเวลา Import จำนวนมาก)
│
└── README.md
```

## แนวคิดการแยกไฟล์ของ Wizard

- **import.html** แยกเป็นหน้าใหม่ต่างหาก (ไม่รวมกับ `index.html`) เพราะ Import เป็น "งาน Migration"
  ที่มี Flow เฉพาะของตัวเอง (5 Steps) และมีปริมาณ Logic/State มาก แยกไฟล์ช่วยให้โค้ดอ่านง่าย
  และไม่ทำให้ `script.js` ของ Dashboard เดิมบวมขึ้น — ผู้ใช้กดเมนู "Import Data" จาก Sidebar
  เพื่อลิงก์มาที่หน้านี้ แล้วเมื่อ Import สำเร็จจะพากลับไป `index.html` พร้อม Refresh ข้อมูลอัตโนมัติ
- **excel-reader.js**: ห่อ SheetJS (`XLSX.read`) ไว้ในฟังก์ชันเดียว คืนค่าเป็นรายชื่อ Sheet และ
  ข้อมูลดิบ (Array of Array) เพื่อให้ import.js เรียกใช้ได้ง่าย ไม่ต้องรู้รายละเอียดของ SheetJS
- **mapping.js**: แยก Logic การจับคู่คอลัมน์ออกมาต่างหาก ทั้ง Auto Mapping (เทียบชื่อคอลัมน์แบบ
  Fuzzy/Normalize) และ Manual Mapping (ผู้ใช้เลือกเอง) เพื่อให้ทดสอบ/ปรับ Rule ได้อิสระ
- **validator.js**: ตรวจกฎ Validation ทั้งหมด (วันที่ถูกรูปแบบ, จำนวนเงินเป็นตัวเลข, ห้ามว่าง ฯลฯ)
  คืนค่าเป็นรายการแถวที่ผิด/ถูก พร้อมเหตุผล เพื่อให้ import.js นำไป Highlight ใน Preview Table
- **import-api.js**: แยกออกจาก `api.js` เดิม เพราะการ Import ต้องส่งข้อมูลจำนวนมาก (Batch Array)
  และมี Endpoint/Logic เฉพาะ (Append/Replace Mode) คนละแบบกับ CRUD ปกติของ Dashboard
- **apps-script-import.gs**: แยก Backend เฉพาะ Import ออกจาก `apps-script.gs` เดิม เพื่อให้เขียนข้อมูล
  ด้วย `setValues()` เป็น Array ทีเดียว (ไม่ใช้ `appendRow()` ที่ช้าเมื่อมีข้อมูลหลักพันแถว)

ไฟล์ทั้งหมดยังคงเป็น Static (HTML/CSS/Vanilla JS + SheetJS) จึง Deploy บน GitHub Pages ได้เหมือนเดิม

## Google Sheets Structure เพิ่มเติม (ตาม Spec ล่าสุด)

Sheet ใหม่ : **ImportHistory** — ใช้บันทึกประวัติการ Import ทุกครั้ง (เขียนโดย `apps-script-import.gs`)

| คอลัมน์     | คำอธิบาย                                  |
|-------------|---------------------------------------------|
| ImportDate  | วันเวลาที่ทำการ Import                       |
| Username    | ผู้ใช้งานที่ทำการ Import                     |
| Filename    | ชื่อไฟล์ Excel ต้นฉบับ                       |
| Rows        | จำนวนแถวที่ Import สำเร็จ                    |
| Mode        | รูปแบบการ Import (Append / Replace)          |
| Status      | สถานะผลลัพธ์ (Success / Failed)              |

หน้า `import.html` (ตาราง Import History) และ Backend (`apps-script-import.gs`) จะอ่าน/เขียน Sheet นี้
โดยตรง แยกจาก Sheet ข้อมูลหลัก (Projects / Expenses / Categories) ของระบบเดิม เพื่อไม่ปะปนกัน
