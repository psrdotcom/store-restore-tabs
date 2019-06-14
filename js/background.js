var dataList;

chrome.extension.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    switch (msg) {
      case "GETDATA":
        getListNamesAndFormTable(port);
        break;

      default:
        break;
    }
  });
});

function getListNamesAndFormTable(port) {
  var nameList = [];
  chrome.storage.sync.get(null, function (result) {
    port.postMessage({"NAME": result.dataList});
  });
}