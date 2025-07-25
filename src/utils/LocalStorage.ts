import { WebsiteListDefaults } from "./Defaults";

export enum checkListReturn {
  Safe,
  Unsafe,
  Error
}
/* new website data 
url: {
    certChain: certChain,
    savedSafe: boolean,
    addedAt: date,
    lastVisit: date
}
*/
export enum WebsiteListEntryLogType {
  PROTECTED,
  BLOCKED,
  NONE
}
export interface WebsiteListEntry {
  certChain: any;
  LogType: WebsiteListEntryLogType; // true if protected false if block
  addedAt: string;
  lastVisit: string;
  faviconUrl: string;
}
export function checkList(webDomain: string): Promise<checkListReturn> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ websiteList: WebsiteListDefaults }, function (items) {
      const websiteList = items.websiteList;
      if (websiteList.hasOwnProperty(webDomain)) {
        if (
          websiteList[webDomain].LogType === WebsiteListEntryLogType.PROTECTED
        ) {
          resolve(checkListReturn.Safe);
        } else {
          resolve(checkListReturn.Unsafe);
        }
      } else {
        resolve(checkListReturn.Error);
      }
    });
  });
}
export function getLocalStorageItem(
  keys: string | string[] | { [key: string]: any; } | null,
  callback: (items: { [key: string]: any; }) => void
) {
  chrome.storage.local.get(keys, callback);
}
