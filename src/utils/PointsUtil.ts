import axios from 'axios';
const user_id: string = require('../version').default.user_id;

export async function AddPoints(pointsToAdd = 1) {
  try {
    chrome.storage.local.get(['_pki_userData'], async (data) => {
      const userId = user_id; // Use optional chaining to prevent errors if _pki_userData is undefined

      if (userId && data._pki_userData.group === 1) {
        // Retrieve current points from the server
        const response = await axios.get(`https://mobyphish.com/user_points/${userId}`);
        const currentPoints = response.data.points || 0; // Default to 0 if points are undefined

        // Add points to the current server points
        const updatedPoints = currentPoints + pointsToAdd;

        // Update points on the server
        await axios.post(`https://mobyphish.com/user_points/${userId}`, {
          points: pointsToAdd,
        });

        // Update points locally in storage
        chrome.storage.local.set({ Points: updatedPoints }, () => {
          console.log(`Updated local points to ${updatedPoints}`);
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
