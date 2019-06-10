'use strict';
var newRow = 1;

document.getElementById("backUp").addEventListener("click", backup);

document.getElementById("alert").addEventListener("click", closeBtn);

/**
 * Store all browser window tab URLs.
 *
 */
function backup() {
  var rowID = newRow;
  var sHtml = "<tr id='row" + rowID + "'>" +
    "<td><i id=\"favTabRestore" + rowID + "\" class='material-icons'>tab</i>&nbsp;" +
    "<td id=\"favTab" + rowID + "\">" + "<input type='text' value=\"Backup" + rowID + "\" id=\"favTabName" + rowID + "\" disabled='true' />" + "</td>" +
    "<td><i id=\"favTabEdit" + rowID + "\" class='material-icons'>edit</i>&nbsp;" +
    "<i id=\"favTabSave" + rowID + "\" class='material-icons' style=\"display:none\;\">save</i>&nbsp;" +
    "<i id=\"favTabDelete" + rowID + "\" class='material-icons'>delete</i>" +
    "</td>" +
    "</tr>";

  getCurrentWindowUrls(function (urls) {
    var backupName = getBackupName(rowID);
    chrome.storage.sync.set({ backupName: urls }, function () {
      $("#tabFavourites").append(sHtml);
      
      document.getElementById("favTabRestore".concat(rowID)).addEventListener("click", restoreTabs.bind(null, rowID), false);
      document.getElementById("favTabEdit".concat(rowID)).addEventListener("click", editRow.bind(null, rowID), false);
      document.getElementById("favTabSave".concat(rowID)).addEventListener("click", saveRow.bind(null, rowID), false);
      document.getElementById("favTabDelete".concat(rowID)).addEventListener("click", deleteRow.bind(null, rowID), false);
      
      $('#msg').html('Backup Completed!!');
      $('#alert').show();
      newRow++;
    });
  });
}

function editRow(rowID) {
  $('#favTabName' + rowID).prop("disabled", false);
  $('#favTabEdit' + rowID).hide();
  $('#favTabSave' + rowID).show();
}

function saveRow(rowID) {
  $('#favTabName' + rowID).prop("disabled", true);
  $('#favTabSave' + rowID).hide();
  $('#favTabEdit' + rowID).show();
}

function deleteRow(rowID) {
  chrome.storage.sync.remove(getBackupName(rowID), function () {
    $('#row' + rowID).remove();
  });
}

function getBackupName(rowID) {
  return "Backup".concat(rowID);
}

/**
 * Restore all stored tab URLs in a new browser window.
 *
 */
function restoreTabs(rowID) {
  var backupName = getBackupName(rowID);
  chrome.storage.sync.get([backupName], function (result) {
    chrome.windows.create({ url: result.urls, state: "maximized" }, function (window) {
      var x = document.getElementById("alert");
      document.getElementById('msg').innerHTML = 'All tabs restored in a new window';
      if (x.style.display === "" || x.style.display === "none") {
        x.style.display = "block";
      }
    });
  });
}

function closeBtn() {
  $("#alert").hide();
}
/**
 * Get all the window URLs.
 *
 * @param {function(string)} callback
 */
function getCurrentWindowUrls(callback) {
  var queryInfo = {
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    var i, tab;
    var urls = [];

    for (i = 0; i < tabs.length; i++) {
      tab = tabs[i];
      urls[i] = tab.url;
      console.log(encodeURIComponent(urls[i]));
    }
    callback(urls);
  });
}