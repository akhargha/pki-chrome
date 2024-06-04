document.getElementById('userIdForm').addEventListener('submit', function(event) {
  event.preventDefault();
  var userId = document.getElementById('userIdInput').value;
  chrome.runtime.sendMessage("golhfpgnpfpefkjnighmbfbpchclhmgi", {type: 'storeUserId', userId: userId});
});