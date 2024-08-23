export function AddPoints () {
  chrome.storage.local.get({ Points: 0 }, d => {
    chrome.storage.local.set({ Points: d.Points + 1 });
  });
}

// NOTE: no longer subtracting points
// export function SubtractPoints () {
//   chrome.storage.local.get({ Points: 0 }, d => {
//     const res = d.Points - 1;
//     chrome.storage.local.set({ Points: res >= 0 ? res : 0 });
//   });
// }
