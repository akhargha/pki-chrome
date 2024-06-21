export function checkList (webDomain) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList
      if (websiteList.hasOwnProperty(webDomain)) {
        if (websiteList[webDomain].isSensitive) {
          resolve(0)
        } else {
          resolve(1)
        }
      } else {
        resolve(-1)
      }
    })
  })
}
