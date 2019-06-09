'use strict';
document.getElementById("backUp").addEventListener("click", backup);
document.getElementById("restore").addEventListener("click", restore);
document.getElementById("alert").addEventListener("click", closeBtn);

/**
 * Store all browser window tab URLs.
 *
 */
function backup() {
  getCurrentWindowUrls(function (urls) {
    chrome.storage.sync.set({ 'urls': urls }, function () {
      var x = document.getElementById("alert");
      document.getElementById('msg').innerHTML = 'Backup Completed!!';
      if (x.style.display === "" || x.style.display === "none") {
        x.style.display = "block";
      }
    });
  });
}

/**
 * Restore all stored tab URLs in a new browser window.
 *
 */
function restore() {
  chrome.storage.sync.get(['urls'], function (result) {
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
  document.getElementById("alert").style.display = 'none';
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