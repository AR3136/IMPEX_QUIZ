/**
 * =====================================================================
 * IMTEX Exhibition Quiz - Google Apps Script Lead Webhook
 * =====================================================================
 * Stores final total score and maximum score (10) without individual answers.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("IMTEX_Leads");

    if (!sheet) {
      sheet = ss.insertSheet("IMTEX_Leads");
      var headers = [
        "Timestamp",
        "Attempt ID",
        "Full Name",
        "Email Address",
        "Mobile Number",
        "Company / Organization",
        "Designation",
        "City",
        "Visitor Category",
        "Total Score",
        "Max Score",
        "Time (seconds)"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0A1128");
      headerRange.setFontColor("#00E5FF");
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);

    var newRow = [
      data.timestamp || new Date().toISOString(),
      data.attemptId || "",
      data.name || "",
      data.email || "",
      data.phone || "",
      data.company || "Not Specified",
      data.designation || "Not Specified",
      data.city || "Not Specified",
      data.visitorType || "Industry Professional",
      data.score !== undefined ? data.score : 0,
      data.maxScore !== undefined ? data.maxScore : 10,
      data.timeSpentSeconds || 0
    ];

    sheet.appendRow(newRow);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
