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
        newRow = (newRow > rowID) ? newRow : (rowID + 1);
        $("#tabFavourites").append(createRow(rowID, tabdata.name));
        addRowItemEventListeners(rowID);
      }
      break;

    default:
      break;
  }
});

// When page loads add form UI event listeners
document.addEventListener('DOMContentLoaded', function () {
  // event listener for the buttons inside popup window
  document.getElementById("backUp").addEventListener("click", backup);
  document.getElementById("clearall").addEventListener("click", clearall);
  document.getElementById("alert").addEventListener("click", closeBtn);
});

/*
* Add table row item event listeners
*
* @param rorwID the row id of the table
*/
function addRowItemEventListeners(rowID) {
  document.getElementById("favTabRestore".concat(rowID)).addEventListener("click", restoreTabs.bind(null, rowID), false);
  document.getElementById("favTabEdit".concat(rowID)).addEventListener("click", editRow.bind(null, rowID), false);
  document.getElementById("favTabSave".concat(rowID)).addEventListener("click", saveRow.bind(null, rowID), false);
  document.getElementById("favTabDelete".concat(rowID)).addEventListener("click", deleteRow.bind(null, rowID), false);
}

/**
 * Store all browser window tab URLs.
 *
 */
function backup() {
  var rowID = newRow;
  var sHtml = createRow(rowID);
  
  getCurrentWindowUrls(function (urls) {
    var backupName = { id: rowID, name: getBackupName(rowID), urls: urls };

    dataList[getBackupName(rowID)] = backupName;
    
    // Store the data
    chrome.storage.sync.set({ dataList }, function () {
      $("#tabFavourites").append(sHtml);
      addRowItemEventListeners(rowID);

      $('#msg').html('Backup Completed!!');
      $('#alert').show();
      newRow++;
    });
  });
}

/*
*  Clear all the stored data and reset the form
*/
function clearall() {
  chrome.storage.sync.clear(function () {
    dataList = {};
    newRow = 1;
    // Remove UI also
    $("#tabFavourites > tbody").html("");

    $('#msg').html('All data has been cleared!!');
    $('#alert').show();
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
  chrome.storage.sync.get(dataList[getBackupName(rowID)], function (result) {
    chrome.windows.create({ url: result.urls, state: "maximized" }, function (window) {
      $('#msg').html('All tabs restored in a new window');
      $('#alert').show();
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

/*
*  Close button functionality
*/
function closeBtn() {
  $("#alert").hide();
}

/*
*  Edit the table row functionality
*  @param rowID the table row id
*/
function editRow(rowID) {
  //TODO: check for undefined
  $('#favTabName' + rowID).prop("disabled", false);
  $('#favTabEdit' + rowID).hide();
  $('#favTabSave' + rowID).show();
}

/*
*  Save buuton functionality
*  @param rowID the table row id
*/
function saveRow(rowID) {
  //TODO: check for undefined
  $('#favTabName' + rowID).prop("disabled", true);
  $('#favTabSave' + rowID).hide();
  $('#favTabEdit' + rowID).show();
  // Update name in datalist and save in sync
  dataList[getBackupName(rowID)].name = $('#favTabName' + rowID).val();
  chrome.storage.sync.set({ dataList }, function () {
    $('#msg').html('Data Saved!!');
    $('#alert').show();
  });
}

/*
*  Delete the row
*  @param rowID the table row id
*/
function deleteRow(rowID) {
  //TODO: check for undefined
  chrome.storage.sync.remove(getBackupName(rowID), function () {
    delete dataList[getBackupName(rowID)];
    $('#row' + rowID).remove();
    chrome.storage.sync.set({ dataList }, function () {
      $('#msg').html('URL Collection Removed!!');
      $('#alert').show();
    });
  });
}

/*
*  Form the backup name
*  @param rowID the table row id
*/
function getBackupName(rowID) {
  //TODO: check for undefined
  return "Backup".concat(rowID);
}