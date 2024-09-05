import { iMsgReqType } from '../types/MessageTypes';
import { ChromeCookie } from '../types/Cookies';
import { grabMainUrl } from '../utils/fetchUtils';

function fetchAndHandleCookies(callback: (user_id: string, isActive: boolean, group: number) => void) {
  const url = new URL(window.location.href);
  const webDomain = url.hostname;
  const shortenedDomain = grabMainUrl(url);

  let user_id = '123456';
  let isActive = true;
  let group = 0;

  chrome.runtime.sendMessage({ type: iMsgReqType.fetchCookieInfo }, c => {
    const cookies: ChromeCookie[] = c;

    if (cookies.length <= 1) {
      callback(user_id, isActive, group);
      return;
    }

    cookies.forEach((cookie: ChromeCookie) => {
      switch (cookie.name) {
        case 'user_id':
          user_id = cookie.value;
          console.log('Found cookie', user_id);
          break;
        case 'use_extension':
          isActive = cookie.value === 'True';
          console.log('Found extension access. Enabled: ', isActive);
          break;
        case 'long_term_group':
          group = parseInt(cookie.value) || 0;
          console.log('Found long_term_group. Group: ', group);
          break;
        default:
          break;
      }
    });

    callback(user_id, isActive, group);
  });
}

export function sendUserActionInfo(
  user_id: string,
  event_number: number,
  reportedSite = '',
  currentSite = '',
) {
  fetchAndHandleCookies((user_id, isActive, group) => {
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

    let comment = eventComments[event_number as keyof typeof eventComments] || 'Unknown event';

    if (event_number === 10) {
      comment = `Reported phishing on site ${reportedSite} by ${currentSite}`;
    }

    const points = group ? -1 : 0;

    if (event_number === 7) {
      chrome.storage.local.get({ websiteList: {} }, function (items) {
        const websiteList = items.websiteList;
        const sensitiveWebsites = [];
        for (const domain in websiteList) {
          if (websiteList[domain].isSensitive) {
            sensitiveWebsites.push(domain);
          }
        }
        const sensitiveListComment =
          'List of Sensitive Websites: ' + sensitiveWebsites.join(', ');

        chrome.runtime.sendMessage({
          type: iMsgReqType.sendUserActionInfo,
          user_id: user_id,
          timestamp: timestamp,
          event: event_number,
          comment: sensitiveListComment,
        });
      });
    } else {
      chrome.runtime.sendMessage({
        type: iMsgReqType.sendUserActionInfo,
        user_id: user_id,
        timestamp: timestamp,
        event: event_number,
        comment: comment,
        points: points,
      });
    }
  });
}

export function localSendUserActionInfo(
  user_id: string,
  event_number: number,
  reportedSite = '',
  currentSite = '',
) {
  fetchAndHandleCookies((user_id, isActive, group) => {
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

    let comment = eventComments[event_number as keyof typeof eventComments] || 'Unknown event';

    // Handling event 10 for reporting phishing
    if (event_number === 10) {
      comment = `Reported phishing on site ${reportedSite} by ${currentSite}`;
    }

    const points = group ? -1 : 0;

    if (event_number === 7) {
      // Special handling for event 7 - save sensitive site info
      chrome.storage.local.get({ websiteList: {}, Points: points }, function (items) {
        const websiteList = items.websiteList;
        const sensitiveWebsites = [];
        for (const domain in websiteList) {
          if (websiteList[domain].isSensitive) {
            sensitiveWebsites.push(domain);
          }
        }
        const sensitiveListComment =
          'List of Sensitive Websites: ' + sensitiveWebsites.join(', ');
        fetch(
          `https://extension.mobyphish.com/user_data/${user_id}/${timestamp}/${event_number}/${sensitiveListComment}/?points=${points}`,
        )
          .catch(reason => {
            console.warn('Failed to upload data: ', reason);
          })
          .finally(() => { });
      });
    } else {
      chrome.storage.local.get({ points: points }, function (items) {
        const points = items.points;

        fetch(
          `https://extension.mobyphish.com/user_data/${user_id}/${timestamp}/${event_number}/${comment}/${points}`,
        )
          .catch(reason => {
            console.warn('Failed to upload data: ', reason);
          })
          .finally(() => { });
      });
    }
  });
}
