// Ensure the blocker is only added once and if the site is marked unsafe
if (!document.getElementById('myBlockerDiv')) {
    chrome.storage.local.get({ websiteList: {} }, function(items) {
        const url = new URL(window.location.href);
        const webDomain = url.hostname;

        // Check if the current site is marked as unsafe
        if (items.websiteList[webDomain] && !items.websiteList[webDomain].isSensitive || items.websiteList[webDomain].isSensitive)  {
            var blockerDiv = document.createElement('div');
            blockerDiv.id = 'myBlockerDiv';
            blockerDiv.style.position = 'fixed';
            blockerDiv.style.left = '0';
            blockerDiv.style.top = '0';
            blockerDiv.style.width = '100%';
            blockerDiv.style.height = '100%';
            blockerDiv.style.zIndex = '10000';
            blockerDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
            
            var blockerMessage = document.createElement('h1');
            blockerMessage.style.color = 'white';
            blockerMessage.style.textAlign = 'center';
            blockerMessage.style.marginTop = '20%';
            blockerMessage.innerHTML = 'This site is blocked by the extension. Click on the extension to continue.';
            blockerDiv.appendChild(blockerMessage);
            
            document.body.appendChild(blockerDiv);
        }
    });
}

// Listener in content script for receiving a message to remove the blocker
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "removeBlocker") {
        var blockerDiv = document.getElementById('myBlockerDiv');
        if (blockerDiv) {
            blockerDiv.style.display = 'none';
        }
    }
});
