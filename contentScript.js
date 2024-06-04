const url = new URL(window.location.href);
const webDomain = url.hostname;

console.log(webDomain);

chrome.storage.local.get('userId', function (data) {
  if (data.userId) {
    user_id = data.userId;
  } else {
    user_id = 'abcde';
  }
});

chrome.storage.local.get({ autoSearchEnabled: true }, function (settings) {
  if (settings.autoSearchEnabled) {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    if (passwordFields.length > 0) {
      alert('🔒 Extension Alert: This site may contain sensitive information with password fields. Click the 🔒 extension for safety. \n \n To disable future alerts, uncheck "automatic detection" in extension settings 🔒.');
    }
  }
});

chrome.storage.local.get({ websiteList: {}, sessionList: {} }, function (items) {
  if (items.websiteList[webDomain]) {
    if (items.websiteList[webDomain].isSensitive) { // Check if the site is in protected list
      console.log("sensitive site");
      // Check if the site is in session list
      if (items.sessionList[webDomain]) {
        console.log("in session list");
        // If in session list, remove blocker if it exists
        removeBlocker();

        // Check if site is test site
        chrome.runtime.sendMessage({ action: 'fetchTestWebsites' }, function (response) {
          console.log("checking");
          if (response && response.websites) {
            const testWebsites = response.websites;
            if (testWebsites.includes(webDomain)) {
              //if site is test site then check cert
              const shortenedDomain = webDomain.replace(/^www\./, '');
              chrome.runtime.sendMessage({ action: 'fetchCertificateChain', webDomain: shortenedDomain }, function (response) {
                if (response.certificateChain) {
                  const savedCertificateChain = items.websiteList[webDomain].certificateChain;
                  if (compareCertificateChains(response.certificateChain, savedCertificateChain)) {
                    console.log("Certificate chain matches");
                  } else {
                    console.log("Certificate chain does not match");
                    //DO OTHER STUFF HERE
                    addBlocker();
                  }
                } else if (response.error) {
                  console.error('Error fetching certificate chain:', response.error);
                  // If there's an error fetching the certificate chain, add blocker
                  addBlocker();
                }
              });
            }
          }
        });
      } else {
        console.log("not in session list");
        // If not in session list, send a message to the background script to fetch the certificate chain

        // Remove "www." from the beginning of the domain
        const shortenedDomain = webDomain.replace(/^www\./, '');
        console.log(shortenedDomain);

        chrome.runtime.sendMessage({ action: 'fetchCertificateChain', webDomain: shortenedDomain }, function (response) {
          if (response.certificateChain) {
            const savedCertificateChain = items.websiteList[webDomain].certificateChain;
            if (compareCertificateChains(response.certificateChain, savedCertificateChain)) {
              console.log("Certificate chain matches");
              addBlocker();
            } else {
              console.log("Certificate chain does not match");
              //DO OTHER STUFF HERE
              addBlocker();
            }
          } else if (response.error) {
            console.error('Error fetching certificate chain:', response.error);
            // If there's an error fetching the certificate chain, add blocker
            addBlocker();
          }
        });
      }
    } else {
      console.log("unsafe site");
      // Add blocker
      addBlocker();
    }
  }
});

function addBlocker() {
  if (!document.getElementById('myBlockerDiv')) {
    var blockerDiv = document.createElement('div');
    blockerDiv.id = 'myBlockerDiv';
    blockerDiv.style.position = 'fixed';
    blockerDiv.style.left = '0';
    blockerDiv.style.top = '0';
    blockerDiv.style.width = '100%';
    blockerDiv.style.height = '100%';
    blockerDiv.style.zIndex = '10000';
    blockerDiv.style.backgroundColor = 'rgba(0,0,0,0.2)';
    document.body.appendChild(blockerDiv);

    var blockerMessage = document.createElement('h1');
    blockerMessage.style.color = 'white';
    blockerMessage.style.textAlign = 'center';
    blockerMessage.style.marginTop = '20%';
    blockerMessage.innerHTML = 'This site is blocked by the extension. Click on the extension to continue.';
    blockerMessage.style.display = 'none'; // Initially hide the message

    blockerDiv.appendChild(blockerMessage);

    // show message/feedback when user clicks without opening extension
    blockerDiv.addEventListener('click', function () {
      blockerMessage.style.display = 'block'; // Show the message on click

      chrome.runtime.sendMessage({ action: "blockerDivClicked" }); // send msg to popup.js to show feedback

      const timestamp = Date.now();
      console.log(timestamp);
      const event = '1';
      const comment = 'Interact with protected website without opening extension';
      chrome.runtime.sendMessage({ action: 'logUserData', user_id: user_id, timestamp: timestamp, event: event, comment: comment });
    });
  }
}

function removeBlocker() {
  var blockerDiv = document.getElementById('myBlockerDiv');
  if (blockerDiv) {
    blockerDiv.remove();
  }
}

// Listener for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "removeBlocker") {
    removeBlocker();
  }
  if (request.action === "addBlocker") {
    addBlocker();
  }
});

function compareCertificateChains(chain1, chain2) {
  if (Object.keys(chain1).length !== Object.keys(chain2).length) {
    return false;
  }

  for (const key in chain1) {
    if (key === 'ev') {
      if (chain1[key] !== chain2[key]) {
        return false;
      }
    } else {
      const obj1 = chain1[key];
      const obj2 = chain2[key];

      if (!compareObjects(obj1.subject, obj2.subject) || !compareObjects(obj1.issuer, obj2.issuer)) {
        return false;
      }
    }
  }

  return true;
}

function compareObjects(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}