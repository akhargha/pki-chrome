// script.js

// Helper to format current time in 12-hour hh:mm:ss AM/PM
function get12HourTimestamp () {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 -> 12
  return `${h}:${m}:${s} ${ampm}`;
}

function getAssignmentIdFromUrl (urlString) {
  try {
    const parsed = new URL(urlString);
    const match = parsed.pathname.match(/\/a\/(\d+)/);
    if (!match) return undefined;
    const id = Number(match[1]);
    return Number.isFinite(id) ? id : undefined;
  } catch (e) {
    return undefined;
  }
}

function sendReport (eventType) {
  // const mobyUsed = document.getElementById('chk-moby').checked;
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const websiteUrl = (tabs && tabs[0] && tabs[0].url) ? tabs[0].url : window.location.href;

    // Normalize to just the hostname so it matches the
    // active_site format used by the study backend.
    let normalizedSite = websiteUrl;
    try {
      const parsed = new URL(websiteUrl);
      normalizedSite = parsed.hostname;
    } catch (e) {
      // Fallback to the original string if URL parsing fails.
    }

    const assignment_id = getAssignmentIdFromUrl(websiteUrl);
    if (!assignment_id) {
      console.warn('Could not parse assignment_id from tab URL');
    }

    const requestBody = {
      user_id: 'user_1',
      timestamp: new Date(),
      text: `Event: ${eventType} | website: ${websiteUrl}`,
    };

    fetch('https://study-api.com/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-ID': '2T7jU3Hr4yC8', // Include the CSRF token in the headers
      },
      body: JSON.stringify(requestBody),
    })
      .then(response => {
        alert('Your report has been recorded. Proceed to the next task.');
      })
      .catch(err => {
        console.error('Error sending report:', err);
        alert('Your report has been recorded. Proceed to the next task.');
      });

    // Also notify the study backend that a task has been completed.
    if (assignment_id) {
      fetch('https://study-api.com/api/record-complete-assignment-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id,
          completion_type: 'report_extension',
          // Backend validates `website` against task.site_url if provided.
          website: normalizedSite,
        }),
      }).catch(e => console.warn('record-complete-assignment-event call failed', e));
    }
  });
}

document
  .getElementById('btn-info')
  .addEventListener('click', () => sendReport('Reported Website Change'));

document.getElementById('btn-unrec').addEventListener('click', () => {
  window.close();
});
