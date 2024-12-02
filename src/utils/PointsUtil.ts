import axios from 'axios';

export async function AddPoints(pointsToAdd = 1) {
  try {
    chrome.storage.local.get(['_pki_userData', 'Points'], async (data) => {
      const userId = data._pki_userData?.user_id; // Use optional chaining to prevent errors if _pki_userData is undefined

      if (userId && data._pki_userData.group === 1) {
        // Only make the request if userId is available
        await axios.post(`https://mobyphish.com/user_points/${userId}`, {
          points: pointsToAdd,
        });

        // Update points locally in storage
        const newPoints = (data.Points || 0) + pointsToAdd;
        chrome.storage.local.set({ Points: newPoints }, () => {
          console.log(`Updated local points to ${newPoints}`);
        });
        
        console.log(`Successfully added ${pointsToAdd} points for user ${userId}`);
      } else {
        console.error('User ID not found in storage.');
      }
    });
  } catch (error) {
    console.error('Error adding points:', error);
  }
}




// NOTE: no longer subtracting points
// export function SubtractPoints () {
//   chrome.storage.local.get({ Points: 0 }, d => {
//     const res = d.Points - 1;
//     chrome.storage.local.set({ Points: res >= 0 ? res : 0 });
//   });
// }
