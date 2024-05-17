const url = new URL(window.location.href);
const webDomain = url.hostname;

console.log(webDomain);

chrome.storage.local.get({ autoSearchEnabled: true }, function(settings) {
    if (settings.autoSearchEnabled) {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        if (passwordFields.length > 0) {
            alert('🔒 Extension Alert: This site may contain sensitive information with password fields. Click the 🔒 extension for safety. \n \n To disable future alerts, uncheck "automatic detection" in extension settings 🔒.');
        }
    }
});

chrome.storage.local.get({ websiteList: {}, sessionList: {} }, function (items) {
    if (items.websiteList[webDomain]) {
      if (items.websiteList[webDomain].isSensitive) {
        console.log("sensitive site");
        // Check if the site is in session list
        if (items.sessionList[webDomain]) {
          console.log("in session list");
          // If in session list, remove blocker if it exists
          removeBlocker();
        } else {
          console.log("not in session list");
          // If not in session list, send a message to the background script to fetch the certificate chain
          chrome.runtime.sendMessage({ action: 'fetchCertificateChain', webDomain: webDomain }, function(response) {
            if (response.certificateChain) {
              const savedCertificateChain = items.websiteList[webDomain].certificateChain;
              if (compareCertificateChains(response.certificateChain, savedCertificateChain)) {
                console.log("Certificate chain matches");
                // If certificate chain matches, remove blocker if it exists
                removeBlocker();
              } else {
                console.log("Certificate chain does not match");
                // If certificate chain does not match, add blocker
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

        // Add click event listener to show the message
        blockerDiv.addEventListener('click', function () {
            blockerMessage.style.display = 'block'; // Show the message on click
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
});

// Function to fetch the certificate chain information
function fetchCertificateChain(webDomain) {
    return fetch(`http://pkie.engr.uconn.edu/certificate_chain/${webDomain}`)
      .then(response => response.json())
      .then(data => {
        if (data.status) {
          return data.output;
        } else {
          throw new Error('Failed to fetch certificate chain');
        }
      });
  }

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
