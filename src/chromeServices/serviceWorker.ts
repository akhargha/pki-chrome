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
import { sendUserActionInfo } from '../utils/ExtensionPageUtils';
import {
  WebsiteListEntry,
  WebsiteListEntryLogType,
} from '../utils/LocalStorage';
import { WebsiteListDefaults } from '../utils/Defaults';

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
            websiteList: WebsiteListDefaults,
            sessionList: {},
          });

          // Retrieve userId from Chrome storage
          const userId = await new Promise<string | undefined>((resolve) => {
            chrome.storage.local.get('_pki_userData', (data) => {
              resolve(data._pki_userData?.user_id);
            });
          });

          if (!userId) {
            console.error("User ID not found in storage.");
            return -1; // Return -1 if userId is not found
          }

          const websiteList: { [key: string]: WebsiteListEntry; } =
            localStorageData.websiteList;
          const sessionList: { [key: string]: boolean; } =
            localStorageData.sessionList;

          websiteList[webDomain] = {
            LogType: WebsiteListEntryLogType.PROTECTED,
            certChain: certificateChain,
            addedAt: currentTime,
            lastVisit: currentTime,
            faviconUrl: tab.favIconUrl as string,
          };

          // Only add to session list if it's not the test domain
          if (webDomain !== 'acct.ilogicalloanssavings.mobyphish.com') {
            sessionList[webDomain] = true;
          }

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
            .then(v => { })
            .catch(e => console.warn(e));
          console.log('Website Saved as Sensitive', webDomain);
          console.log('Website added to session list', webDomain);

          if (webDomain !== 'acct.ilogicalloanssavings.mobyphish.com') {
            sendUserActionInfo(userId, 4);
            sendUserActionInfo(userId, 7);
          }
        },
      );
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setCookie') {
    const { url, name, value } = message.payload;
    chrome.cookies.set({ url, name, value, path: '/' }, (cookie) => {
      if (chrome.runtime.lastError) {
        console.error('Error setting cookie:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('Cookie set successfully:', cookie);
        sendResponse({ success: true, cookie });
      }
    });

    // Keep the message channel open for async response
    return true;
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
      // Retrieve 'Points' from Chrome storage
      chrome.storage.local.get('Points', (result) => {
        const points = result.Points || -1; // Default to -1 if Points is not available
        console.log(`Retrieved points: ${points}`);

        console.log("SENDING DATA:", data.user_id, data.event, data.timestamp, data.comment);

        // Construct the request body
        const requestBody = {
          user_id: data.user_id,
          timestamp: data.timestamp,
          text: `Event Id ${data.event}: ${data.comment}`
        };

        // Make the POST request to the backend
        fetch('https://localhost:5001/log/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Extension-ID': '2T7jU3Hr4yC8', // Include the CSRF token in the headers
          },
          body: JSON.stringify(requestBody),
        })
          .then((response) => {
            if (!response.ok) {
              // Attempt to get the raw response text (e.g., HTML error page)
              return response.text().then((rawResponse) => {
                console.error(`Error response received:`, rawResponse);
                throw new Error(`Server responded with status ${response.status}`);
              });
            }
            return response.json(); // Parse the successful response as JSON
          })
          .then((responseData) => {
            console.log('Data successfully sent to backend:', responseData);
          })
          .catch((error) => {
            console.error("Failed to upload data:", error);
          });
      });
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
