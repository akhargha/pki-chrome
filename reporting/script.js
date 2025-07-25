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
  const websiteUrl = window.location.href; // ← grab current URL

  const requestBody = {
    user_id: 'user_1',
    timestamp: new Date(),
    text: `Event: ${eventType} | website: ${websiteUrl}`,
  };
  fetch('https://localhost:5001/log/', {
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
}

document
  .getElementById('btn-info')
  .addEventListener('click', () => sendReport('reportInformationChange'));

document
  .getElementById('btn-unrec')
  .addEventListener('click', () => sendReport('unrecognizedWebsite'));
