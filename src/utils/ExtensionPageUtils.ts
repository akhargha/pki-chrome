import { iMsgReqType } from '../types/MessageTypes';
import {
  WebsiteListEntryLogType,
} from '../utils/LocalStorage';
import { WebsiteListDefaults } from './Defaults';
const user_id: string = require('../version').default.user_id;

async function fetchPoints(): Promise<number> {
  try {
    // Retrieve userId from Chrome storage
    const userId = await new Promise<string | undefined>((resolve) => {
      chrome.storage.local.get('_pki_userData', (data) => {
        resolve(user_id);
      });
    });

    if (!userId) {
      console.error("User ID not found in storage.");
      return -1; // Return -1 if userId is not found
    }

    // Fetch points from server using the retrieved userId
    const response = await fetch(`https://mobyphish.com/user_points/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch points');

    const data = await response.json();
    return data.points ?? -1; // Use -1 if points data is missing
  } catch (error) {
    console.error("Error fetching points from server:", error);
    return -1; // Default to -1 on error
  }
}

export async function sendUserActionInfo(
  _user_id: string,
  event_number: number,
  reportedSite = '',
  currentSite = '',
) {
  const timestamp = Date.now();
  const eventComments = {
    1: 'Interact with Moby-protected website without opening extension',
    2: 'Open popup on Moby-protected site',
    3: 'Open popup',
    4: 'Site saved as Moby-protected',
    5: 'Site saved as Moby-protected after being saved as unsafe',
    6: 'Site saved as unsafe',
    8: 'Saved site removed',
    11: 'Unsafe site unblocked temporarily',
    12: "Site info changed"
  };

  // Retrieve userId from Chrome storage since user_id given in function is wrong at times - do NOT remove this without making sure the function is invoked with the correct id at other parts of code

  const userId = user_id;
  // const userId = await new Promise<string | undefined>((resolve) => {
  //   chrome.storage.local.get('_pki_userData', (data) => {
  //     resolve(user_id);
  //   });
  // });

  if (!userId) {
    console.error("User ID not found in storage.");
    return -1; // Return -1 if userId is not found
  }

  let comment =
    eventComments[event_number as keyof typeof eventComments] || 'Unknown event';


  // Handling event 10 for reporting phishing
  if (event_number === 10) {
    comment = `Reported phishing on site ${reportedSite} by ${currentSite}`;
  }

  const points = await fetchPoints(); // Fetch points from server

  if (event_number === 7) {
    // Special handling for event 7 - save sensitive site info
    chrome.storage.local.get({ websiteList: WebsiteListDefaults }, function (items) {
      const websiteList = items.websiteList;
      const sensitiveWebsites = [];
      for (const domain in websiteList) {
        if (websiteList[domain].LogType === WebsiteListEntryLogType.PROTECTED) {
          sensitiveWebsites.push(domain);
        }
      }
      const comment = 'List of Sensitive Websites: ' + sensitiveWebsites.join(', ');

      console.log("LOG SENT:", event_number);

      chrome.runtime.sendMessage({
        type: iMsgReqType.sendUserActionInfo,
        user_id: userId, // override function user_id with userId that we retrieve
        timestamp: timestamp,
        event: event_number,
        comment: comment,
        points: points, // Send points from server response
      });
    });
  }
  else if (event_number === 17) {
    // Special handling for event 17 - save unsafe site info
    chrome.storage.local.get({ websiteList: WebsiteListDefaults }, function (items) {
      const websiteList = items.websiteList;
      const unsafeSites = [];
      for (const domain in websiteList) {
        if (websiteList[domain].LogType === WebsiteListEntryLogType.BLOCKED) {
          unsafeSites.push(domain);
        }
      }
      const comment = 'List of Unsafe Websites: ' + unsafeSites.join(', ');

      console.log("LOG SENT:", event_number);

      chrome.runtime.sendMessage({
        type: iMsgReqType.sendUserActionInfo,
        user_id: userId, // override function user_id with userId that we retrieve
        timestamp: timestamp,
        event: event_number,
        comment: comment,
        points: points, // Send points from server response
      });
    });
  }
  else {
    console.log("LOG SENT:", event_number);
    chrome.runtime.sendMessage({
      type: iMsgReqType.sendUserActionInfo,
      user_id: userId, // override function user_id with userId that we retrieve
      timestamp: timestamp,
      event: event_number,
      comment: comment,
      points: points, // Send points from server response
    });
  }
}
