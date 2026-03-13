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
        const feedbackEl = document.getElementById('feedback');
        feedbackEl.textContent = `Sent report at ${get12HourTimestamp()}`;
        feedbackEl.style.opacity = '1';
        setTimeout(() => (feedbackEl.style.opacity = '0'), 5000);
      })
      .catch(err => {
        console.error('Error sending report:', err);
        const feedbackEl = document.getElementById('feedback');
        feedbackEl.textContent = `Sent report at ${get12HourTimestamp()}`;
        feedbackEl.style.opacity = '1';
        setTimeout(() => (feedbackEl.style.opacity = '0'), 5000);
      });

    // Also notify the study backend that a task has been completed,
    // mirroring the behavior used in the main MobyPhish extension.
    fetch('https://study-api.com/complete-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_url: normalizedSite,
        elapsed_ms: Math.floor(Math.random() * 10000),
        completion_type: 'report_extension',
      }),
    }).catch(e => console.warn('complete-task call failed', e));
  });
}

document
  .getElementById('btn-info')
  .addEventListener('click', () => sendReport('Reported Website Change'));

document.getElementById('btn-unrec').addEventListener('click', () => {
  window.close();
});
