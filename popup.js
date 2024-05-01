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
          chrome.storage.local.get({ sessionList: {} }, function (items) {
            const sessionList = items.sessionList;
            sessionList[webDomain] = true;
            chrome.storage.local.set({ sessionList: sessionList }, function () {
              console.log('Website added to session list', webDomain);
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
          websiteList[webDomain] = { isSensitive: true };
          sessionList[webDomain] = true;
          chrome.storage.local.set({ websiteList: websiteList, sessionList: sessionList }, function () {
            console.log('Website Saved as Sensitive', webDomain);
            console.log('Website added to session list', webDomain);
          });
          removeView();
          document.getElementById('added-to-trusted').style.display = 'block';
        });
      });
  
      document.getElementById('sensitive-save-btn-1').addEventListener('click', function () {
        chrome.storage.local.get({ websiteList: {}, sessionList: {} }, function (items) {
          const websiteList = items.websiteList;
          const sessionList = items.sessionList;
          websiteList[webDomain] = { isSensitive: true };
          sessionList[webDomain] = true;
          chrome.storage.local.set({ websiteList: websiteList, sessionList: sessionList }, function () {
            console.log('Website Saved as Sensitive', webDomain);
            console.log('Website added to session list', webDomain);
          });
          removeView();
          document.getElementById('added-to-trusted').style.display = 'block';
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
      chrome.storage.local.get({ websiteList: {} }, function (items) {
        const websiteList = items.websiteList;
        websiteList[website] = { isSensitive: true };
        chrome.storage.local.set({ websiteList: websiteList }, function () {
          console.log('Website saved as sensitive:', website);
          sensitiveInput.value = '';
          displaySensitiveSites();
        });
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
    }
  });
  
  function removeSensitiveSite(website) {
    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList;
      delete websiteList[website];
      chrome.storage.local.set({ websiteList: websiteList }, function () {
        console.log('Sensitive site removed:', website);
        displaySensitiveSites();
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