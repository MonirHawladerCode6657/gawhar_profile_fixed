/** গওহরডাঙ্গা মাদ্রাসা প্রোফাইল পিক — Google Apps Script */
const SPREADSHEET_ID = '11p5dfCj3CNbgBa6sXwrEadawOH-E3dTz4shI10cb_bY';
const SHEET_NAME = 'gawharmadrasamrofile';
const TEMP_FOLDER_NAME = 'Temporary_Profile_PNG';
const TEMP_PREFIX = 'TEMP_PROFILE_IMAGE_';
const IMAGE_LIFETIME = 60 * 60 * 1000;
function doPost(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    if (p.action === 'uploadImage') return uploadTemporaryImage_(p);
    if (p.website) return output_({ ok: true });
    const name = clean_(p.personName, 80), madrasa = clean_(p.institutionName, 120), address = clean_(p.address, 180);
    const submittedAt = clean_(p.submittedAt, 60) || Utilities.formatDate(new Date(), 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss');
    if (!name || !madrasa || !address) return output_({ ok: false, error: 'missing_fields' });
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID); let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) { sheet.appendRow(['ক্রমিক', 'ব্যবহারকারীর নাম', 'মাদ্রাসার নাম', 'ঠিকানা', 'জমা দেওয়ার সময়']); sheet.setFrozenRows(1); }
      sheet.appendRow([sheet.getLastRow(), name, madrasa, address, submittedAt]);
    } finally { lock.releaseLock(); }
    return output_({ ok: true });
  } catch (err) { console.error(err); return output_({ ok: false, error: 'server_error' }); }
}
function doGet() { return output_({ service: 'Gawhar Madrasa profile form', status: 'ready' }); }
function clean_(value, maxLength) { return String(value || '').replace(/[<>]/g, '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, maxLength); }
function output_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function uploadTemporaryImage_(p) {
  const nonce = String(p.nonce || '');
  try {
    const data = String(p.imageData || ''); if (!data.startsWith('data:image/png;base64,')) return imageResult_({ ok: false, nonce });
    const bytes = Utilities.base64Decode(data.substring('data:image/png;base64,'.length));
    const fileName = String(p.fileName || 'profile.png').replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
    const blob = Utilities.newBlob(bytes, 'image/png', fileName);
    const folders = DriveApp.getFoldersByName(TEMP_FOLDER_NAME); const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(TEMP_FOLDER_NAME);
    const file = folder.createFile(blob); file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    PropertiesService.getScriptProperties().setProperty(TEMP_PREFIX + file.getId(), String(Date.now() + IMAGE_LIFETIME));
    return imageResult_({
      ok: true,
      nonce,
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId(),
      previewUrl: 'https://drive.google.com/uc?export=view&id=' + file.getId()
    });
  } catch (err) { console.error(err); return imageResult_({ ok: false, nonce }); }
}
function imageResult_(result) {
  result.type = 'temporary-profile-image-result'; const safeJson = JSON.stringify(result).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><html><head><meta charset="utf-8"></head><body><script>window.parent.postMessage(' + safeJson + ',"*");</script></body></html>');
}
function deleteExpiredProfileImages() {
  const props = PropertiesService.getScriptProperties(), all = props.getProperties(), now = Date.now();
  Object.keys(all).forEach(key => { if (!key.startsWith(TEMP_PREFIX) || now < Number(all[key])) return; try { DriveApp.getFileById(key.slice(TEMP_PREFIX.length)).setTrashed(true); } catch (err) { console.warn(err); } props.deleteProperty(key); });
}
function installImageCleanupTrigger() {
  ScriptApp.getProjectTriggers().forEach(trigger => { if (trigger.getHandlerFunction() === 'deleteExpiredProfileImages') ScriptApp.deleteTrigger(trigger); });
  ScriptApp.newTrigger('deleteExpiredProfileImages').timeBased().everyMinutes(5).create();
}
