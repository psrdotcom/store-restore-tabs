var dataList;

chrome.extension.onConnect.addListener(function (port) {
  //console.log("Connected .....");
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
    // for (var name in result.dataList) {
    //   nameList.push({"id": result.dataList[name].id, "name": result.dataList[name].name});
    // }
    port.postMessage({"NAME": result.dataList});
  });
}