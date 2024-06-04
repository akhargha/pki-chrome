// 1. Make website get unblocked when extension is opened (unblock by sending message on session open) - done
// 2. Get cookies from a website for the user ID instead of extension login page
// 3. Check cert everytime for our own experiemnts and only per browser session for usual websites - done
// 4. Send data (timestamp, action, unique user id) - done for one action
// 5. Feedback (points functionality)
// 6. change time format - prithvi comment
// 7. List of changes (last meeting)
// 8. block website when user do not trust it without reload
// 9. do not notify user of pass field when site is protected
// 10. change background of blocker text to highlight
let user_id = localStorage.getItem('user_id');
if (!user_id) {
  user_id = '35j2qx61';
}

document.addEventListener('DOMContentLoaded', function () {
  removeView();
  document.getElementById('points').style.display = 'none';
  checkUserKey().then((hasUserKey) => {
    if (hasUserKey) {
      initializeExtension();
    }
  });

  const navbarBurger = document.querySelector('.navbar-burger');
  const navbarMenu = document.getElementById('navbarMenu');

  navbarBurger.addEventListener('click', function () {
    navbarBurger.classList.toggle('is-active');
    navbarMenu.classList.toggle('is-active');
  });

  document.getElementById('user-key-submit').addEventListener('click', function () {
    const userKey = document.getElementById('user-key-field').value.trim();
    if (userKey !== '') {
      fetch('http://localhost:8080/validate?user_key=' + userKey)
        .then(response => response.text())
        .then(data => {
          if (data === 'success') {
            chrome.storage.local.set({ user_key: userKey }, function () {
              console.log('User key saved:', userKey);
              document.getElementById('user-key-input').style.display = 'none';
              initializeExtension();
            });
          } else {
            alert('Invalid user key. Please try again.');
          }
        })
        .catch(error => {
          console.error('Error validating user key');
          alert('An error occurred while validating the user key. Please try again later.');
        });
    }
  });


  document.getElementById('forgot-password').addEventListener('click', function () {
    document.getElementById('forgot-password-form').style.display = 'block';
    document.getElementById('recovery-prompt').style.display = 'none';
    document.getElementById('user-key-field').style.display = 'none';
    document.getElementById('user-key-submit').style.display = 'none';
  });

  document.getElementById('recover-password-submit').addEventListener('click', function () {
    const name = document.getElementById('name-field').value.trim();
    const dob = document.getElementById('dob-field').value;
    if (name !== '' && dob !== '') {
      fetch('http://localhost:8080/validate?name=' + encodeURIComponent(name) + '&dob=' + dob)
        .then(response => response.text())
        .then(data => {
          document.getElementById('password-recovery-response').style.display = 'block';
          if (data === 'not found') {
            document.getElementById('password-recovery-response').textContent = 'User not found. Please create a new account.';
          } else {
            document.getElementById('password-recovery-response').textContent = 'Your user key: ' + data;
          }
        })
        .catch(error => {
          document.getElementById('password-recovery-response').style.display = 'block';
          console.error('Error during password recovery');
          document.getElementById('password-recovery-response').textContent = 'An error occurred during password recovery. Please try again later.';
        });
    }
  });
});

function initializeExtension() {

  logUserData(user_id,3);

  document.getElementById('choose-option').style.display = 'block'; //
  document.getElementById('sensitive-save-btn').style.display = 'block'; //
  document.getElementById('unsafe-save-btn').style.display = 'block'; //
  document.getElementById('not-recognized-text').style.display = 'block'; //
  document.getElementById('points').style.display = 'block';

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    const urlObj = new URL(url);
    const webDomain = urlObj.hostname;
    const favicon = tabs[0].favIconUrl;

    const urlContainer = document.getElementById('url-container');
    urlContainer.textContent = 'URL: ' + webDomain;

    const faviconImage = document.createElement('img');
    faviconImage.src = favicon;
    faviconImage.alt = 'Favicon';

    const previousFavicon = document.getElementById('favicon-img');
    if (previousFavicon) {
      previousFavicon.remove();
    }

    faviconImage.id = 'favicon-img';
    const faviconContainer = document.getElementById('favicon-container');
    faviconContainer.appendChild(faviconImage);

    checkList(webDomain).then((result) => {
      if (result === 0) {
        removeView();
        document.getElementById('all-set').style.display = 'block';

        logUserData(user_id,2);

        chrome.storage.local.get({ sessionList: {} }, function (items) {
          const sessionList = items.sessionList;
          sessionList[webDomain] = true;
          chrome.storage.local.set({ sessionList: sessionList }, function () {
            console.log('Website added to session list', webDomain);
            chrome.tabs.sendMessage(tabs[0].id, { action: "removeBlocker" }); //send message to unblock
          });
        });
      } else if (result === 1) {
        removeView();
        document.getElementById('site-blocked-text').style.display = 'block';
        document.getElementById('sensitive-save-btn-1').style.display = 'block';
      } else {
        console.log('Website not found in the list');
      }
    });

    document.getElementById('sensitive-save-btn').addEventListener('click', function () {
      chrome.storage.local.get({ websiteList: {}, sessionList: {} }, function (items) {
        const websiteList = items.websiteList;
        const sessionList = items.sessionList;

        fetchCertificateChain(webDomain)
          .then(certificateChain => {
            websiteList[webDomain] = {
              isSensitive: true,
              certificateChain: certificateChain
            };
            sessionList[webDomain] = true;
            chrome.storage.local.set({ websiteList: websiteList, sessionList: sessionList }, function () {
              console.log('Website Saved as Sensitive', webDomain);
              console.log('Website added to session list', webDomain);
              chrome.tabs.sendMessage(tabs[0].id, { action: "removeBlocker" }); //send message to unblock
            });

            chrome.storage.local.get({ websiteList: {} }, function (items) {
              const websiteList = items.websiteList;
              console.log('Website List:', websiteList);
            });

            removeView();
            document.getElementById('added-to-trusted').style.display = 'block';

            logUserData(user_id,4);
            logUserData(user_id,7);
          })
          .catch(error => {
            console.error('Error fetching certificate chain:', error);
            // Handle the error, e.g., display an error message to the user
          });
      });
    });

    document.getElementById('sensitive-save-btn-1').addEventListener('click', function () {
      chrome.storage.local.get({ websiteList: {}, sessionList: {} }, function (items) {
        const websiteList = items.websiteList;
        const sessionList = items.sessionList;

        fetchCertificateChain(webDomain)
          .then(certificateChain => {
            websiteList[webDomain] = {
              isSensitive: true,
              certificateChain: certificateChain
            };
            sessionList[webDomain] = true;
            chrome.storage.local.set({ websiteList: websiteList, sessionList: sessionList }, function () {
              console.log('Website Saved as Sensitive', webDomain);
              console.log('Website added to session list', webDomain);
              chrome.tabs.sendMessage(tabs[0].id, { action: "removeBlocker" }); //send message to unblock
            });
            removeView();
            document.getElementById('added-to-trusted').style.display = 'block';

            logUserData(user_id,5);
            logUserData(user_id,7);
          })
          .catch(error => {
            console.error('Error fetching certificate chain:', error);
            // Handle the error, e.g., display an error message to the user
          });
      });
    });

    document.getElementById('unsafe-save-btn').addEventListener('click', function () {
      removeView();
      document.getElementById('sensitive-save-btn-1').style.display = 'block';
      document.getElementById('unsafe-save-btn-1').style.display = 'block';
      document.getElementById('not-marked-sensitive-proceed-caution').style.display = 'block';
    });

    document.getElementById('unsafe-save-btn-1').addEventListener('click', function () {
      chrome.storage.local.get({ websiteList: {} }, function (items) {
        const websiteList = items.websiteList;
        websiteList[webDomain] = { isSensitive: false };
        chrome.storage.local.set({ websiteList: websiteList }, function () {
          console.log('Website Saved as Unsafe', webDomain);
        });
        removeView();
        document.getElementById('added-to-untrust').style.display = 'block';

        logUserData(user_id,6);
        logUserData(user_id,7);
      });
    });
  });

  const autoSearchCheckbox = document.getElementById('auto-search-checkbox');
  chrome.storage.local.get({ autoSearchEnabled: true }, function (data) {
    autoSearchCheckbox.checked = data.autoSearchEnabled;
  });

  autoSearchCheckbox.addEventListener('change', function () {
    chrome.storage.local.set({ autoSearchEnabled: this.checked });
  });
}

function removeView() {
  document.getElementById('choose-option').style.display = 'none'; //
  document.getElementById('added-to-trusted').style.display = 'none';
  document.getElementById('sensitive-save-btn').style.display = 'none'; //
  document.getElementById('unsafe-save-btn').style.display = 'none'; //
  document.getElementById('not-marked-sensitive-proceed-caution').style.display = 'none';
  document.getElementById('added-to-untrust').style.display = 'none';
  document.getElementById('not-recognized-text').style.display = 'none'; //
  document.getElementById('site-blocked-text').style.display = 'none';
  document.getElementById('sensitive-save-btn-1').style.display = 'none';
  document.getElementById('unsafe-save-btn-1').style.display = 'none';
}

function checkList(webDomain) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList;
      if (websiteList.hasOwnProperty(webDomain)) {
        if (websiteList[webDomain].isSensitive) {
          resolve(0);
        } else {
          resolve(1);
        }
      } else {
        resolve(-1);
      }
    });
  });
}

document.getElementById('nav-sensitive').addEventListener('click', function () {
  removeView();
  document.getElementById('sensitive-sites-list').style.display = 'block';
  document.getElementById('sensitive-input').style.display = 'block';
  document.getElementById('sensitive-save').style.display = 'block';
  displaySensitiveSites();
});

document.getElementById('nav-unsafe').addEventListener('click', function () {
  removeView();
  document.getElementById('unsafe-sites-list').style.display = 'block';
  document.getElementById('unsafe-input').style.display = 'block';
  document.getElementById('unsafe-save').style.display = 'block';
  displayUnsafeSites();
});

function displaySensitiveSites() {
  chrome.storage.local.get({ websiteList: {} }, function (items) {
    const websiteList = items.websiteList;
    const sensitiveSitesList = document.getElementById('sensitive-sites-list');
    sensitiveSitesList.innerHTML = '';

    for (const website in websiteList) {
      if (websiteList[website].isSensitive) {
        const siteButton = document.createElement('button');
        siteButton.textContent = website;
        siteButton.classList.add('button', 'is-primary', 'is-small', 'is-rounded', 'sensitive-site');
        siteButton.addEventListener('click', function () {
          removeSensitiveSite(website);
        });
        sensitiveSitesList.appendChild(siteButton);
      }
    }
  });
}

function displayUnsafeSites() {
  chrome.storage.local.get({ websiteList: {} }, function (items) {
    const websiteList = items.websiteList;
    const unsafeSitesList = document.getElementById('unsafe-sites-list');
    unsafeSitesList.innerHTML = '';

    for (const website in websiteList) {
      if (!websiteList[website].isSensitive) {
        const siteButton = document.createElement('button');
        siteButton.textContent = website;
        siteButton.classList.add('button', 'is-danger', 'is-small', 'is-rounded', 'unsafe-site');
        siteButton.addEventListener('click', function () {
          removeUnsafeSite(website);
        });
        unsafeSitesList.appendChild(siteButton);
      }
    }
  });
}

document.getElementById('sensitive-save').addEventListener('click', function () {
  const sensitiveInput = document.querySelector('#sensitive-input input');
  const website = sensitiveInput.value.trim();

  if (website !== '') {
    fetchCertificateChain(website)
      .then(certificateChain => {
        chrome.storage.local.get({ websiteList: {} }, function (items) {
          const websiteList = items.websiteList;
          websiteList[website] = {
            isSensitive: true,
            certificateChain: certificateChain
          };
          chrome.storage.local.set({ websiteList: websiteList }, function () {
            console.log('Website saved as protected:', website);
            sensitiveInput.value = '';
            displaySensitiveSites();
          });
        });

        logUserData(user_id,4);
        logUserData(user_id,7);
      })
      .catch(error => {
        console.error('Error fetching certificate chain:', error);
        // Handle the error, e.g., display an error message to the user
      });
  }
});

document.getElementById('unsafe-save').addEventListener('click', function () {
  const unsafeInput = document.querySelector('#unsafe-input input');
  const website = unsafeInput.value.trim();

  if (website !== '') {
    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList;
      websiteList[website] = { isSensitive: false };
      chrome.storage.local.set({ websiteList: websiteList }, function () {
        console.log('Website saved as unsafe:', website);
        unsafeInput.value = '';
        displayUnsafeSites();
      });
    });

    logUserData(user_id,6);
    logUserData(user_id, 7);
  }
});

function removeSensitiveSite(website) {
  chrome.storage.local.get({ websiteList: {} }, function (items) {
    const websiteList = items.websiteList;
    delete websiteList[website];
    chrome.storage.local.set({ websiteList: websiteList }, function () {
      console.log('Sensitive site removed:', website);
      displaySensitiveSites();
      logUserData(user_id,8);
      logUserData(user_id,7)
    });
  });
}

function removeUnsafeSite(website) {
  chrome.storage.local.get({ websiteList: {} }, function (items) {
    const websiteList = items.websiteList;
    delete websiteList[website];
    chrome.storage.local.set({ websiteList: websiteList }, function () {
      console.log('Unsafe site removed:', website);
      displayUnsafeSites();
      logUserData(user_id,9);
      logUserData(user_id,7)
    });
  });
}

function checkUserKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['user_key'], function (result) {
      if (result.user_key) {
        resolve(true);
      } else {
        document.getElementById('user-key-input').style.display = 'block';
        resolve(false);
      }
    });
  });
}

function fetchCertificateChain(webDomain) {
  // Remove "www." from the beginning of the domain
  const shortenedDomain = webDomain.replace(/^www\./, '');
  return fetch(`http://pkie.engr.uconn.edu/certificate_chain/${shortenedDomain}`)
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        return data.output;
      } else {
        throw new Error('Failed to fetch certificate chain');
      }
    });
}

// log data - happens manually in contentScript
function logUserData(user_id, event_number) {
  //var date = new Date();
  const timestamp = Date.now();
  console.log(timestamp);

  let eventComments = {
    '1': 'Interact with protected website without opening extension',
    '2': 'Open popup on protected site',
    '3': 'Open popup',
    '4': 'Site saved as protected',
    '5': 'Site saved as protected after being saved as unsafe',
    '6': 'Site saved as unsafe',
    '8': 'Protected site removed',
    '9': 'Unsafe site removed',
  };
  if (event_number === 7) { // 7th event - save sensitive site info
    console.log("SAVEE");
    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList;
      const sensitiveWebsites = [];
      for (const domain in websiteList) {
        if (websiteList[domain].isSensitive) {
          sensitiveWebsites.push(domain);
        }
      }
      const sensitiveListComment = 'List of Sensitive Websites: ' + sensitiveWebsites.join(', ');
      console.log(sensitiveListComment);
      chrome.runtime.sendMessage({
        action: 'logUserData',
        user_id: user_id,
        timestamp: timestamp,
        event: event_number,
        comment: sensitiveListComment
      });
    });
  } else {
    console.log("sad");
    const comment = eventComments[event_number] || 'Unknown event';
    chrome.runtime.sendMessage({
      action: 'logUserData',
      user_id: user_id,
      timestamp: timestamp,
      event: event_number,
      comment: comment
    });
  }
}


