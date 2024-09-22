export function AddPoints() {
  chrome.storage.local.get(['_pki_userData', 'Points'], (data) => {
    const userData = data._pki_userData;
    const currentPoints = data.Points || 0;

    if (userData.group === 1) { // TODO: group user 1
      chrome.storage.local.set({ Points: currentPoints + 1 });
    }
  });
}


// NOTE: no longer subtracting points
// export function SubtractPoints () {
//   chrome.storage.local.get({ Points: 0 }, d => {
//     const res = d.Points - 1;
//     chrome.storage.local.set({ Points: res >= 0 ? res : 0 });
//   });
// }
