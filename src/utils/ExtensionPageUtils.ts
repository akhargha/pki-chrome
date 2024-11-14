import { iMsgReqType } from '../types/MessageTypes';

async function fetchPoints(): Promise<number> {
  try {
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
  user_id: string,
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
    8: 'Moby-protected site removed',
    9: 'Unsafe site removed',
    11: 'Site Unblocked Temporarily',
  };

  let comment =
    eventComments[event_number as keyof typeof eventComments] || 'Unknown event';

  // Handling event 10 for reporting phishing
  if (event_number === 10) {
    comment = `Reported phishing on site ${reportedSite} by ${currentSite}`;
  }

  const points = await fetchPoints(); // Fetch points from server

  if (event_number === 7) {
    // Special handling for event 7 - save sensitive site info
    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList;
      const sensitiveWebsites = [];
      for (const domain in websiteList) {
        if (websiteList[domain].isSensitive) {
          sensitiveWebsites.push(domain);
        }
      }
      const sensitiveListComment = 'List of Sensitive Websites: ' + sensitiveWebsites.join(', ');

      chrome.runtime.sendMessage({
        type: iMsgReqType.sendUserActionInfo,
        user_id: user_id,
        timestamp: timestamp,
        event: event_number,
        comment: sensitiveListComment,
        points: points, // Send points from server response
      });
    });
  } else {
    chrome.runtime.sendMessage({
      type: iMsgReqType.sendUserActionInfo,
      user_id: user_id,
      timestamp: timestamp,
      event: event_number,
      comment: comment,
      points: points, // Send points from server response
    });
  }
}

export async function localSendUserActionInfo(
  user_id: string,
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
    8: 'Moby-protected site removed',
    9: 'Unsafe site removed',
    11: 'Site Unblocked Temporarily',
  };

  let comment =
    eventComments[event_number as keyof typeof eventComments] || 'Unknown event';

  // Handling event 10 for reporting phishing
  if (event_number === 10) {
    comment = `Reported phishing on site ${reportedSite} by ${currentSite}`;
  }

  const points = await fetchPoints(); // Fetch points from server
  console.log("Points fetched:", points);

  if (event_number === 7) {
    // Special handling for event 7 - save sensitive site info
    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList;
      const sensitiveWebsites = [];
      for (const domain in websiteList) {
        if (websiteList[domain].isSensitive) {
          sensitiveWebsites.push(domain);
        }
      }
      const sensitiveListComment = 'List of Sensitive Websites: ' + sensitiveWebsites.join(', ');

      fetch(
        `https://extension.mobyphish.com/user_data/${user_id}/${timestamp}/${event_number}/${sensitiveListComment}/?points=${points}`,
      )
        .catch(reason => {
          console.warn('Failed to upload data: ', reason);
        });
    });
  } else {
    fetch(
      `https://extension.mobyphish.com/user_data/${user_id}/${timestamp}/${event_number}/${comment}/${points}`,
    )
      .catch(reason => {
        console.warn('Failed to upload data: ', reason);
      });
  }
}
