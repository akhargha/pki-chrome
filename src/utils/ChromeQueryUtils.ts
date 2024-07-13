//utilities to make asynchronous calls etc

/**
 * Returns the current tab id. To be used with await
 * @returns {any}
 */
export function getTabData (): Promise<chrome.tabs.Tab> {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query(
        {
          active: true
        },
        function (tabs) {
          resolve(tabs[0])
        }
      )
    } catch (e) {
      reject(e)
    }
  })
}
