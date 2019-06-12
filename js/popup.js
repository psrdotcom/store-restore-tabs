'use strict';
var newRow = 1;
var dataList = {};

var port = chrome.extension.connect({
  name: "Data Communication"
});
port.postMessage("GETDATA");
port.onMessage.addListener(function (msg) {
  var rowID;
  switch (Object.keys(msg)[0]) {
    case "NAME":
      dataList = msg.NAME;
      for (var i = 0; i < Object.keys(dataList).length; i++) {
        var tabdata = dataList[Object.keys(dataList)[i]];
        rowID = tabdata.id;
        newRow = rowID + 1;
        // TODO: Refactor to global method
        $("#tabFavourites").append(createRow(rowID, tabdata.name));
        document.getElementById("favTabRestore".concat(rowID)).addEventListener("click", restoreTabs.bind(null, rowID), false);
        document.getElementById("favTabEdit".concat(rowID)).addEventListener("click", editRow.bind(null, rowID), false);
        document.getElementById("favTabSave".concat(rowID)).addEventListener("click", saveRow.bind(null, rowID), false);
        document.getElementById("favTabDelete".concat(rowID)).addEventListener("click", deleteRow.bind(null, rowID), false);
      }
      break;

    default:
      break;
  }
});

document.addEventListener('DOMContentLoaded', function () {  
  // event listener for the buttons inside popup window
  document.getElementById("backUp").addEventListener("click", backup);
  document.getElementById("clearall").addEventListener("click", clearall);
  document.getElementById("alert").addEventListener("click", closeBtn);
});


/**
 * Store all browser window tab URLs.
 *
 */
function backup() {
  var rowID = newRow;
  var sHtml = createRow(rowID);

  getCurrentWindowUrls(function (urls) {
    var backupName = { id: rowID, name: getBackupName(rowID), urls: urls };
    //backupName[getBackupName(rowID)] = urls;
    //dataList.push(backupName);
    dataList[getBackupName(rowID)] = backupName;

    chrome.storage.sync.set({ dataList }, function () {
      $("#tabFavourites").append(sHtml);
      // TODO: refactor to global method
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

function clearall() {
  chrome.storage.sync.clear(function () {
    $('#msg').html('All data has been cleared!!');
    $('#alert').show();
    //TODO: Remove UI also $('#row' + rowID).remove();
  });
}

function createRow(rowID, name) {
  //TODO: check for undefined
  if (name == undefined || name.length <= 0) {
    name = getBackupName(rowID);
  }

  return "<tr id='row" + rowID + "'>" +
    "<td><i id=\"favTabRestore" + rowID + "\" class='material-icons'>tab</i>&nbsp;" +
    "<td id=\"favTab" + rowID + "\">" + "<input type='text' value=\"" + name + "\" id=\"favTabName" + rowID + "\" disabled='true' />" + "</td>" +
    "<td><i id=\"favTabEdit" + rowID + "\" class='material-icons'>edit</i>&nbsp;" +
    "<i id=\"favTabSave" + rowID + "\" class='material-icons' style=\"display:none\;\">save</i>&nbsp;" +
    "<i id=\"favTabDelete" + rowID + "\" class='material-icons'>delete</i>" +
    "</td>" +
    "</tr>";
}

/**
 * Restore all stored tab URLs in a new browser window.
 *
 */
function restoreTabs(rowID) {
  //TODO: check for undefined
  var backupName = [];
  backupName.push(getBackupName(rowID));
  //chrome.storage.sync.get({list:[]}, function (result) {
  chrome.storage.sync.get(dataList[getBackupName(rowID)], function (result) {
    console.log(result);
    //chrome.windows.create({ url: result.list[rowID-1].urls, state: "maximized" }, function (window) {
    chrome.windows.create({ url: result.urls, state: "maximized" }, function (window) {
      var x = document.getElementById("alert");
      document.getElementById('msg').innerHTML = 'All tabs restored in a new window';
      if (x.style.display === "" || x.style.display === "none") {
        x.style.display = "block";
      } //TODO: use .show()
    });
  });
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

function closeBtn() {
  $("#alert").hide();
}

function editRow(rowID) {
  //TODO: check for undefined
  $('#favTabName' + rowID).prop("disabled", false);
  $('#favTabEdit' + rowID).hide();
  $('#favTabSave' + rowID).show();
}

function saveRow(rowID) {
  //TODO: check for undefined
  $('#favTabName' + rowID).prop("disabled", true);
  $('#favTabSave' + rowID).hide();
  $('#favTabEdit' + rowID).show();
  //TODO: Update name in datalist and save in sync
}

function deleteRow(rowID) {
  //TODO: check for undefined
  chrome.storage.sync.remove(getBackupName(rowID), function () {
    $('#row' + rowID).remove();
  });
}

function getBackupName(rowID) {
  //TODO: check for undefined
  return "Backup".concat(rowID);
}