//this file is used for background stuff
// has no direct access to the DOM

import { fetchCertificateChain } from '../utils/fetchUtils';
import {
  eMsgReq,
  eMsgReqType,
  iMsgReq,
  iMsgReqType,
} from '../types/MessageTypes';
import { getTabData } from '../utils/ChromeQueryUtils';
import { localSendUserActionInfo } from '../utils/ExtensionPageUtils';
import {
  WebsiteListEntry,
  WebsiteListEntryLogType,
} from '../utils/LocalStorage';

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ sessionList: {}, tabDatabase: {} }, () => {
    console.log('Cleared session list and tab database on chrome startup');
  });
});

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    const data = request as eMsgReq;
    switch (data.type) {
      case eMsgReqType.storeUserId:
        //TODO: DEPRECATE THIS.
        //chrome.storage.local.set({ userId: data.userId }, () => {})
        sendResponse({ success: true, message: 'User ID stored' });
        break;
      default:
        throw Error(`Unsupported external message request type ${data.type}`);
    }
  },
);
//structure for our session database. will be cleared on refresh
/*
each website visited
{
  tabId: number,
  ... discuss this and remove it later if unneeded
}

*/
//for async, this cant elicit a response.
chrome.runtime.onMessage.addListener(async (request, sender, _) => {
  const data = request as iMsgReq;

  switch (data.type) {
    case iMsgReqType.frontEndRequestUserSaveSite:
      const tab = await getTabData();
      const webDomain: string = data.webDomain as string;

      // sendResponse('Ok relax')
      fetchCertificateChain(webDomain as string).then(
        async certificateChain => {
          const currentTimeInMs = Date.now(); // Get current time in milliseconds since Unix epoch
          const currentTime = new Date(currentTimeInMs).toLocaleString(); // Convert to local date and time string

          const localStorageData = await chrome.storage.local.get({
            websiteList: {},
            sessionList: {},
          });

          const userid = (
            await chrome.storage.local.get({
              _pki_userData: {
                user_id: 'abcd',
                TEST_ExtensionActive: true,
              },
            })
          )._pki_userData.user_id;
          const websiteList: { [key: string]: WebsiteListEntry } =
            localStorageData.websiteList;
          const sessionList: { [key: string]: boolean } =
            localStorageData.sessionList;

          websiteList[webDomain] = {
            LogType: WebsiteListEntryLogType.PROTECTED,
            certChain: certificateChain,
            addedAt: currentTime,
            lastVisit: currentTime,
            faviconUrl: tab.favIconUrl as string,
          };
          sessionList[webDomain] = true;
          console.log('Ok go go');

          await chrome.storage.local.set({
            websiteList,
            sessionList,
          });

          //so our ui can refresh on open
          chrome.runtime
            .sendMessage({
              type: iMsgReqType.siteDataRefresh,
            })
            .then(v => {})
            .catch(e => console.warn(e));
          console.log('Website Saved as Sensitive', webDomain);
          console.log('Website added to session list', webDomain);

          localSendUserActionInfo(userid, 4);
          localSendUserActionInfo(userid, 7);
        },
      );
  }
});

//other events that are synchronous. these can get a response back.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data = request as iMsgReq;

  switch (data.type) {
    case iMsgReqType.fetchCertificateChain:
      fetchCertificateChain(data.webDomain as string)
        .then(certChain => {
          sendResponse({ success: true, certificateChain: certChain });
        })
        .catch(error => {
          console.warn(`Error fetching certificate chain: ${error}`);
          sendResponse({ success: false, errorMessage: error.message });
        });
      return true;
    case iMsgReqType.sendUserActionInfo:
      fetch(
        `https://extension.mobyphish.com/user_data/${data.user_id}/${data.timestamp}/${data.event}/${data.comment}`,
      )
        .catch(reason => {
          console.warn('Failed to upload data: ', reason);
        })
        .finally(() => {});
      break;
    case iMsgReqType.fetchTestWebsites:
      sendResponse({ websites: [] });
      // fetchTestWebsites()
      //   .then(websites => {
      //     sendResponse({ websites: websites })
      //   })
      //   .catch(error => {
      //     console.error('Error fetching websites:', error)
      //     sendResponse({ error: error.message })
      //   })
      return true;
    case iMsgReqType.openNewTab:
      chrome.tabs.create({ url: data.url });
      break;
    case iMsgReqType.fetchCookieInfo:
      chrome.cookies.getAll({ domain: 'mobyphish.com' }, cookies => {
        sendResponse(cookies);
      });
      return true;
  }
});

//handler to detect when the popup opens and closes
chrome.runtime.onConnect.addListener(port => {
  // // Handle messages from the popup
  // port.onMessage.addListener(message => {
  //   console.log('Message from popup:', message)
  //   // Add your logic to handle messages from the popup
  //   if (message.type === 'greeting') {
  //     port.postMessage({ response: 'Hello from background script!' })
  //   }
  // })

  // // Detect when the popup is closed
  port.onDisconnect.addListener(() => {
    console.log('Popup closed');
  });

  port.postMessage('uirefresh');
});
