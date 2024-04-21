chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.set({ sessionList: {} }, function() {
        console.log("Session list cleared on startup.");
    });
});