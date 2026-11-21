/**
 * Google Apps Script Web App API
 * ระบบลอยกระทงออนไลน์ ณ วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
 * พัฒนาโดย แผนกวิชาเทคโนโลยีคอมพิวเตอร์ 68
 * 
 * หน้าที่:
 * 1. รับข้อมูลการลอยกระทง/ปล่อยโคม พร้อมอัปโหลดรูปภาพไปยัง Google Drive
 * 2. บันทึกข้อมูลลง Google Sheets: [Timestamp, ID, Type, FullName, Department, Avatar, Wish, ImageURL, DesignConfig_JSON]
 * 3. ส่งคืนรายการทั้งหมดในรูปแบบ JSON API สำหรับ Frontend
 */

// ชื่อโฟลเดอร์สำหรับเก็บรูปภาพบน Google Drive
const UPLOAD_FOLDER_NAME = "LoyKrathong_Uploads";

// ชื่อชีตที่ใช้บันทึกข้อมูล
const SHEET_NAME = "Data";

/**
 * ฟังก์ชันสำหรับรับคำขอแบบ GET (อ่านข้อมูล)
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : "getList";
    
    if (action === "getList") {
      const data = getAllRecords();
      return createJsonResponse({ status: "success", data: data });
    }
    
    if (action === "getStats") {
      const stats = getStatistics();
      return createJsonResponse({ status: "success", stats: stats });
    }

    return createJsonResponse({ status: "success", message: "Loy Krathong API is running." });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * ฟังก์ชันสำหรับรับคำขอแบบ POST (บันทึกข้อมูล + อัปโหลดรูปภาพ)
 */
function doPost(e) {
  try {
    let requestData = {};
    if (e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (err) {
        requestData = e.parameter;
      }
    } else {
      requestData = e.parameter || {};
    }

    const action = requestData.action || "uploadAndSave";

    if (action === "uploadAndSave") {
      // 1. จัดการอัปโหลดรูปภาพลง Google Drive (ถ้ามีรูปภาพแบบ Base64 ส่งมา)
      let directImageUrl = "";
      if (requestData.base64Image && requestData.base64Image.indexOf("base64,") !== -1) {
        directImageUrl = saveImageToDrive(requestData.base64Image, requestData.fileName || "photo.jpg");
      } else if (requestData.imageUrl) {
        directImageUrl = requestData.imageUrl;
      }

      // 2. จัดเตรียมแถวข้อมูลบันทึกลง Google Sheet
      const sheet = getOrCreateSheet();
      const timestamp = new Date().toISOString();
      const id = requestData.id || ("LK_" + new Date().getTime());
      const type = requestData.type || "krathong";
      const fullName = requestData.fullName || "ไม่ระบุชื่อ";
      const department = requestData.department || "ไม่ระบุแผนก";
      const avatar = requestData.avatar !== undefined ? requestData.avatar : 0;
      const wish = requestData.wish || "";
      const designConfig = requestData.designConfig || "{}";

      // เพิ่มแถวใหม่: [Timestamp, ID, Type, FullName, Department, Avatar, Wish, ImageURL, DesignConfig_JSON]
      sheet.appendRow([
        timestamp,
        id,
        type,
        fullName,
        department,
        avatar,
        wish,
        directImageUrl,
        designConfig
      ]);

      return createJsonResponse({
        status: "success",
        message: "บันทึกข้อมูลสำเร็จ",
        id: id,
        imageUrl: directImageUrl
      });
    }

    return createJsonResponse({ status: "error", message: "Invalid action" });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * ฟังก์ชันสำหรับบันทึกรูป Base64 ลงใน Google Drive โฟลเดอร์ที่กำหนด
 * พร้อมตั้งค่าสิทธิ์ Anyone with the link can view และสร้าง Direct Image URL
 */
function saveImageToDrive(base64DataUrl, fileName) {
  try {
    const parts = base64DataUrl.split("base64,");
    const contentType = parts[0].split(":")[1].split(";")[0];
    const decodedBytes = Utilities.base64Decode(parts[1]);
    const blob = Utilities.newBlob(decodedBytes, contentType, fileName);

    // ดึงหรือสร้างโฟลเดอร์สำหรับเก็บไฟล์
    const folder = getOrCreateFolder(UPLOAD_FOLDER_NAME);
    const file = folder.createFile(blob);

    // ตั้งค่าสิทธิ์ให้ทุกคนที่มีลิงก์สามารถดูได้
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    // สร้าง Direct Image URL ที่สามารถนำไปใส่ในแท็ก <img> ได้ทันที
    const directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    return directUrl;
  } catch (err) {
    Logger.log("Error saving image: " + err.toString());
    return "";
  }
}

/**
 * ดึงรายการข้อมูลทั้งหมดจาก Google Sheet แปลงเป็น JSON Array
 */
function getAllRecords() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const range = sheet.getRange(2, 1, lastRow - 1, 9);
  const values = range.getValues();

  const records = [];
  for (let i = values.length - 1; i >= 0; i--) { // เรียงจากล่าสุดไปหาเก่าสุด
    const row = values[i];
    let designConfig = {};
    try {
      designConfig = typeof row[8] === "string" ? JSON.parse(row[8]) : row[8];
    } catch (e) {
      designConfig = {};
    }

    records.push({
      timestamp: row[0],
      id: row[1],
      type: row[2],
      fullName: row[3],
      department: row[4],
      avatar: row[5],
      wish: row[6],
      imageUrl: row[7],
      designConfig: designConfig,
      likes: 1
    });
  }

  return records;
}

/**
 * คำนวณตัวเลขสถิติ
 */
function getStatistics() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { total: 0, krathong: 0, lantern: 0 };
  }

  const types = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
  let krathongCount = 0;
  let lanternCount = 0;

  for (let i = 0; i < types.length; i++) {
    if (types[i][0] === "krathong") krathongCount++;
    else if (types[i][0] === "lantern") lanternCount++;
  }

  return {
    total: types.length,
    krathong: krathongCount,
    lantern: lanternCount
  };
}

/**
 * ค้นหาหรือสร้างโฟลเดอร์บน Google Drive
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

/**
 * ค้นหาหรือสร้างชีตสำหรับเก็บข้อมูล พร้อมใส่หัวตาราง
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // ตั้งค่าคอลัมน์ Header:
    sheet.appendRow([
      "Timestamp",
      "ID",
      "Type",
      "FullName",
      "Department",
      "Avatar",
      "Wish",
      "ImageURL",
      "DesignConfig_JSON"
    ]);
    // จัดรูปแบบ Header
    sheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#F59E0B").setFontColor("#000000");
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * ฟังก์ชันช่วยสร้าง Response JSON พร้อมตั้งค่า CORS และ Content-Type
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ฟังก์ชันสำหรับกดรันครั้งแรกด้วยตนเอง (สำหรับทดสอบสิทธิ์และเตรียมตาราง)
 */
function setupSheet() {
  getOrCreateSheet();
  getOrCreateFolder(UPLOAD_FOLDER_NAME);
  Logger.log("ตาราง Google Sheets และโฟลเดอร์ Google Drive พร้อมใช้งานเรียบร้อยแล้ว!");
}
