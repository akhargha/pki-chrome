// 1. Make website get unblocked when extension is opened (unblock by sending message on session open) - done
// 2. Get cookies from a website for the user ID instead of extension login page - done
// 3. Check cert everytime for our own experiemnts and only per browser session for usual websites - done
// 4. Send data (timestamp, action, unique user id) - done
// 5. Feedback (points functionality) - done
// 6. change time format - prithvi comment - done
// 7. List of changes (last meeting) - done
// 8. block website when user do not trust it without reload - done
// 9. do not notify user of pass field when site is protected - done
// 10. change background of blocker text to highlight - done
// 11. if cert chain does not match then block always subdomain
// 12. Make blockerMessage more elaborate and explain - done
// 13. remove login page - done
// 14. Fix points system conditions - done
// 15. problem with backend - sometimes data is not updated

// decide on points system
// review msg system
// change logo
// disable extension for period of time
// cookies stuff

import { ViewStates } from './utils/Enums'
import { fetchCertificateChain } from './utils/fetchUtils'
import { checkList } from './utils/LocalStorage'

var pointsLocal = 0
var user_id = '123456'
var viewState = ViewStates.DEFAULT
document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get('points', function (data) {
    if (data.points) {
      pointsLocal = data.points
    }
  })

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'testing' },
      function (response) {
        console.log('T' + pointsLocal)
        document.getElementById('points').textContent = `Points: ${pointsLocal}`
      }
    )
  })

  // retrieve user id
  chrome.storage.local.get('userId', function (data) {
    if (data.userId) {
      user_id = data.userId
    }
  })

  removeView()

  initializeExtension()

  const navbarBurger = document.querySelector('.navbar-burger')
  const navbarMenu = document.getElementById('navbarMenu')

  navbarBurger.addEventListener('click', function () {
    navbarBurger.classList.toggle('is-active')
    navbarMenu.classList.toggle('is-active')
  })
})

function initializeExtension () {
  logUserData(user_id, 3)
  console.log(user_id)

  displaySensitiveSitesDropdown()

  document.getElementById('choose-option').style.display = 'block' //
  document.getElementById('sensitive-save-btn').style.display = 'block' //
  document.getElementById('unsafe-save-btn').style.display = 'block' //
  document.getElementById('not-recognized-text').style.display = 'block' //
  document.getElementById('points').style.display = 'block' //
  document.getElementById('sensitive-sites-dropdown').style.display = 'block' //

  document.getElementById('sensitive-sites-dropdown-container').style.display =
    ''
  document.getElementById('report-phish-prompt-text').style.display = 'block' //
  document.getElementById('report-phish-prompt-text').style.display = 'block' //

  document.getElementById('sensitive-sites-dropdown-container').style.display =
    ''
  document.getElementById(
    'points-feedback-click-before-blocked'
  ).style.display = 'none'
  document.getElementById('points-feedback-click-when-blocked').style.display =
    'none'

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url
    const urlObj = new URL(url)
    const webDomain = urlObj.hostname
    const favicon = tabs[0].favIconUrl

    const urlContainer = document.getElementById('url-container')
    urlContainer.textContent = 'URL: ' + webDomain

    const faviconImage = document.createElement('img')
    faviconImage.src = favicon
    faviconImage.alt = 'Favicon'

    const previousFavicon = document.getElementById('favicon-img')
    if (previousFavicon) {
      previousFavicon.remove()
    }

    faviconImage.id = 'favicon-img'
    const faviconContainer = document.getElementById('favicon-container')
    faviconContainer.appendChild(faviconImage)

    checkList(webDomain).then(result => {
      if (result === 0) {
        removeView()
        document.getElementById('all-set').style.display = 'block'

        logUserData(user_id, 2)

        chrome.storage.local.get({ sessionList: {} }, function (items) {
          const sessionList = items.sessionList
          sessionList[webDomain] = true
          chrome.storage.local.set({ sessionList: sessionList }, function () {
            console.log('Website added to session list', webDomain)
            chrome.tabs.sendMessage(tabs[0].id, { action: 'removeBlocker' }) //send message to unblock
          })
        })
      } else if (result === 1) {
        removeView()
        document.getElementById('site-blocked-text').style.display = 'block'
        document.getElementById('unblock-once').style.display = 'block'

        chrome.storage.local.get({ sessionList: {} }, function (items) {
          const sessionList = items.sessionList
          sessionList[webDomain] = true
          chrome.storage.local.set({ sessionList: sessionList }, function () {
            console.log('Website added to session list', webDomain)
          })
        })
      } else {
        console.log('Website not found in the list')
      }
    })

    document
      .getElementById('sensitive-save-btn')
      .addEventListener('click', function () {
        chrome.storage.local.get(
          { websiteList: {}, sessionList: {} },
          function (items) {
            const websiteList = items.websiteList
            const sessionList = items.sessionList

            fetchCertificateChain(webDomain)
              .then(certificateChain => {
                websiteList[webDomain] = {
                  isSensitive: true,
                  certificateChain: certificateChain
                }
                sessionList[webDomain] = true
                chrome.storage.local.set(
                  { websiteList: websiteList, sessionList: sessionList },
                  function () {
                    console.log('Website Saved as Sensitive', webDomain)
                    console.log('Website added to session list', webDomain)
                    chrome.tabs.sendMessage(tabs[0].id, {
                      action: 'removeBlocker'
                    }) //send message to unblock
                  }
                )

                chrome.storage.local.get({ websiteList: {} }, function (items) {
                  const websiteList = items.websiteList
                  console.log('Website List:', websiteList)
                })
                removeView()
                document.getElementById('added-to-trusted').style.display =
                  'block'

                logUserData(user_id, 4)
                logUserData(user_id, 7)
              })
              .catch(error => {
                console.error('Error fetching certificate chain:', error)
                // Handle the error, e.g., display an error message to the user
              })
          }
        )
      })

    document
      .getElementById('unsafe-save-btn')
      .addEventListener('click', function () {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            const currentSite = new URL(tabs[0].url).hostname
            const selectedSite = document.getElementById(
              'sensitive-sites-dropdown'
            ).value

            if (currentSite && selectedSite) {
              chrome.storage.local.get({ websiteList: {} }, function (items) {
                const websiteList = items.websiteList
                websiteList[currentSite] = { isSensitive: false } // Mark the current site as unsafe
                chrome.storage.local.set(
                  { websiteList: websiteList },
                  function () {
                    console.log(
                      'Current website marked as unsafe:',
                      currentSite
                    )
                    displayUnsafeSites()
                  }
                )

                // Log the selected site with the current site
                logUserData(user_id, 10, selectedSite, currentSite)
              })
              removeView()
              document.getElementById('added-to-untrust').style.display =
                'block'
              document.getElementById('unblock-once').style.display = 'block'
              chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                  chrome.tabs.sendMessage(tabs[0].id, { action: 'addBlocker' }) // Optionally, send a message to block the site
                }
              )
            } else {
              console.error(
                'Error: No current site or no site selected to report.'
              )
            }
          }
        )
      })
  })

  const autoSearchCheckbox = document.getElementById('auto-search-checkbox')
  chrome.storage.local.get({ autoSearchEnabled: true }, function (data) {
    autoSearchCheckbox.checked = data.autoSearchEnabled
  })

  autoSearchCheckbox.addEventListener('change', function () {
    chrome.storage.local.set({ autoSearchEnabled: this.checked })
  })
}

function removeView () {
  document.getElementById('choose-option').style.display = 'none' //
  document.getElementById('added-to-trusted').style.display = 'none'
  document.getElementById('sensitive-save-btn').style.display = 'none' //
  document.getElementById('unsafe-save-btn').style.display = 'none' //
  document.getElementById(
    'not-marked-sensitive-proceed-caution'
  ).style.display = 'none'
  document.getElementById('added-to-untrust').style.display = 'none'
  document.getElementById('not-recognized-text').style.display = 'none' //
  document.getElementById('site-blocked-text').style.display = 'none'
  document.getElementById('sensitive-sites-dropdown-container').style.display =
    'none'
  document.getElementById('report-phish-prompt-text').style.display = 'none'
  document.getElementById('unblock-once').style.display = 'none'
}

const navEditSavedSitesButton = document.getElementById(
  'nav-edit-saved-sites-toggle'
)
navEditSavedSitesButton.addEventListener('click', () => {
  switch (viewState) {
    case ViewStates.DEFAULT:
      removeView()
      // document.getElementById('sensitive-sites-list').style.display = 'block'
      // document.getElementById('sensitive-input').style.display = 'block'
      // document.getElementById('sensitive-save').style.display = 'block'
      document.getElementById('sensitive-site-controls').style.display = 'block'
      document
      displaySensitiveSites()
      displayUnsafeSites()
      navEditSavedSitesButton.textContent = 'BACK'
      viewState = ViewStates.SavedSitesList
      break
    case ViewStates.SavedSitesList:
      document.getElementById('sensitive-site-controls').style.display = 'none'
      document.getElementById('choose-option').style.display = 'block' //
      document.getElementById('sensitive-save-btn').style.display = 'block' //
      document.getElementById('unsafe-save-btn').style.display = 'block' //
      document.getElementById('not-recognized-text').style.display = 'block' //
      document.getElementById('points').style.display = 'block' //
      document.getElementById('sensitive-sites-dropdown').style.display =
        'block' //

      document.getElementById(
        'sensitive-sites-dropdown-container'
      ).style.display = ''
      document.getElementById('report-phish-prompt-text').style.display =
        'block' //
      document.getElementById('report-phish-prompt-text').style.display =
        'block' //

      document.getElementById(
        'sensitive-sites-dropdown-container'
      ).style.display = ''
      document.getElementById(
        'points-feedback-click-before-blocked'
      ).style.display = 'none'
      document.getElementById(
        'points-feedback-click-when-blocked'
      ).style.display = 'none'

      navEditSavedSitesButton.textContent = 'Saved sites list'
      //check if our changes include this site now being safe...
      // const url = new URL(window.location.href)
      // const webDomain = url.hostname

      // checkList(webDomain).then(result => {
      //   removeView()
      //   document.getElementById('added-to-trusted').style.display = 'block'
      // })

      viewState = ViewStates.DEFAULT
      break
  }
})
// document.getElementById('nav-sensitive').addEventListener('click', function () {
//   removeView()
//   document.getElementById('sensitive-sites-list').style.display = 'block'
//   document.getElementById('sensitive-input').style.display = 'block'
//   document.getElementById('sensitive-save').style.display = 'block'
//   displaySensitiveSites()
// })

// document.getElementById('nav-unsafe').addEventListener('click', function () {
//   removeView()
//   document.getElementById('unsafe-sites-list').style.display = 'block'
//   document.getElementById('unsafe-input').style.display = 'block'
//   document.getElementById('unsafe-save').style.display = 'block'
//   displayUnsafeSites()
// })

//temp unblocking site
document.getElementById('unblock-once').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = new URL(tabs[0].url)
    const domain = url.hostname

    // Send message to content script to remove the blocker
    chrome.tabs.sendMessage(tabs[0].id, { action: 'removeBlocker' })

    logUserData(user_id, 11)

    // Display the temporary unblock text
    document.getElementById('temp-unblock-text').style.display = 'block'
    document.getElementById('site-blocked-text').style.display = 'none'
    document.getElementById('unblock-once').style.display = 'none'
  })
})

function displaySensitiveSites () {
  chrome.storage.local.get({ websiteList: {} }, function (items) {
    const websiteList = items.websiteList
    const sensitiveSitesList = document.getElementById('sensitive-sites-list')
    sensitiveSitesList.innerHTML = ''

    for (const website in websiteList) {
      if (websiteList[website].isSensitive) {
        const siteButton = document.createElement('button')
        siteButton.textContent = website
        siteButton.classList.add(
          'button',
          'is-primary',
          'is-small',
          'is-rounded',
          'sensitive-site'
        )
        siteButton.addEventListener('click', function () {
          removeSensitiveSite(website)
        })
        sensitiveSitesList.appendChild(siteButton)
      }
    }
  })
}

function displaySensitiveSitesDropdown () {
  chrome.storage.local.get({ websiteList: {} }, function (items) {
    const websiteList = items.websiteList
    const sensitiveSitesDropdown = document.getElementById(
      'sensitive-sites-dropdown'
    )
    // Clear existing options
    sensitiveSitesDropdown.innerHTML = ''

    // Add a default option
    const defaultOption = document.createElement('option')
    defaultOption.textContent = 'Select the Protected Site'
    defaultOption.value = ''
    sensitiveSitesDropdown.appendChild(defaultOption)

    // Append new options for each sensitive site
    for (const website in websiteList) {
      if (websiteList[website].isSensitive) {
        const option = document.createElement('option')
        option.value = website
        option.textContent = website
        sensitiveSitesDropdown.appendChild(option)
      }
    }
  })
}

function displayUnsafeSites () {
  chrome.storage.local.get({ websiteList: {} }, function (items) {
    const websiteList = items.websiteList
    const unsafeSitesList = document.getElementById('unsafe-sites-list')
    unsafeSitesList.innerHTML = ''

    for (const website in websiteList) {
      if (!websiteList[website].isSensitive) {
        const siteButton = document.createElement('button')
        siteButton.textContent = website
        siteButton.classList.add(
          'button',
          'is-danger',
          'is-small',
          'is-rounded',
          'unsafe-site'
        )
        siteButton.addEventListener('click', function () {
          removeUnsafeSite(website)
        })
        unsafeSitesList.appendChild(siteButton)
      }
    }
  })
}

document
  .getElementById('sensitive-save')
  .addEventListener('click', function () {
    const sensitiveInput = document.querySelector('#sensitive-input input')
    const website = sensitiveInput.value.trim()
    console.log(sensitiveInput)
    if (website !== '') {
      fetchCertificateChain(website)
        .then(certificateChain => {
          chrome.storage.local.get({ websiteList: {} }, function (items) {
            const websiteList = items.websiteList
            websiteList[website] = {
              isSensitive: true,
              certificateChain: certificateChain
            }
            chrome.storage.local.set({ websiteList: websiteList }, function () {
              console.log('Website saved as protected:', website)
              sensitiveInput.value = ''
              displaySensitiveSites()
            })
          })

          logUserData(user_id, 4)
          logUserData(user_id, 7)
        })
        .catch(error => {
          console.error('Error fetching certificate chain:', error)
          // Handle the error, e.g., display an error message to the user
        })
    }
  })

document.getElementById('unsafe-save').addEventListener('click', function () {
  const unsafeInput = document.querySelector('#unsafe-input input')
  const website = unsafeInput.value.trim()

  if (website !== '') {
    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList
      websiteList[website] = { isSensitive: false }
      chrome.storage.local.set({ websiteList: websiteList }, function () {
        console.log('Website saved as unsafe:', website)
        unsafeInput.value = ''
        displayUnsafeSites()
      })
    })

    logUserData(user_id, 6)
    logUserData(user_id, 7)
  }
})

// for feedback on points
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const url = new URL(tabs[0].url)
  const domain = url.hostname // Get the domain of the current site

  // Retrieve the session list from storage
  chrome.storage.local.get({ sessionList: {} }, function (items) {
    const sessionList = items.sessionList

    // Check if the current site is in the session list
    if (!sessionList[domain]) {
      // Only proceed if the site is NOT in the session list
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'checkIfClicked' },
        function (response) {
          if (response && response.clicked) {
            document.getElementById(
              'points-feedback-click-when-blocked'
            ).style.display = 'block'
            pointsLocal -= 5 // deduct points for interacting with blocked site
            chrome.storage.local.set({ points: pointsLocal }, function () {
              console.log(pointsLocal)
            })
          } else {
            checkList(domain).then(result => {
              // first check if site is protected
              if (result === 0) {
                document.getElementById(
                  'points-feedback-click-before-blocked'
                ).style.display = 'block'
                pointsLocal += 5 //add points for being proactive in protected sites
                chrome.storage.local.set({ points: pointsLocal }, function () {
                  console.log(pointsLocal)
                  document.getElementById(
                    'points'
                  ).textContent = `Points: ${pointsLocal}`
                })
              }
            })
          }
        }
      )
    } else {
      // Optionally, handle the case where the site is in the session list
      console.log('The site is in the session list. No feedback message shown.')
    }
  })
})

function removeSensitiveSite (website) {
  chrome.storage.local.get({ websiteList: {} }, function (items) {
    const websiteList = items.websiteList
    delete websiteList[website]
    chrome.storage.local.set({ websiteList: websiteList }, function () {
      console.log('Sensitive site removed:', website)
      displaySensitiveSites()
      logUserData(user_id, 8)
      logUserData(user_id, 7)
    })
  })
}

function removeUnsafeSite (website) {
  chrome.storage.local.get({ websiteList: {} }, function (items) {
    const websiteList = items.websiteList
    delete websiteList[website]
    chrome.storage.local.set({ websiteList: websiteList }, function () {
      console.log('Unsafe site removed:', website)
      displayUnsafeSites()
      logUserData(user_id, 9)
      logUserData(user_id, 7)
    })
  })
}

// log data - happens manually in contentScript
function logUserData (
  user_id,
  event_number,
  reportedSite = '',
  currentSite = ''
) {
  const timestamp = Date.now()
  console.log(timestamp)

  let eventComments = {
    1: 'Interact with protected website without opening extension',
    2: 'Open popup on protected site',
    3: 'Open popup',
    4: 'Site saved as protected',
    5: 'Site saved as protected after being saved as unsafe',
    6: 'Site saved as unsafe',
    8: 'Protected site removed',
    9: 'Unsafe site removed',
    11: 'Site Unblocked Temporarily'
  }

  let comment = eventComments[event_number] || 'Unknown event'

  // Handling event 10 for reporting phishing
  if (event_number === 10) {
    comment = `Reported phishing on site ${reportedSite} by ${currentSite}`
  }
  if (event_number === 7) {
    // Special handling for event 7 - save sensitive site info
    console.log('SAVEE')
    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList
      const sensitiveWebsites = []
      for (const domain in websiteList) {
        if (websiteList[domain].isSensitive) {
          sensitiveWebsites.push(domain)
        }
      }
      const sensitiveListComment =
        'List of Sensitive Websites: ' + sensitiveWebsites.join(', ')
      console.log(sensitiveListComment)

      chrome.runtime.sendMessage({
        action: 'logUserData',
        user_id: user_id,
        timestamp: timestamp,
        event: event_number,
        comment: sensitiveListComment
      })
    })
  } else {
    console.log(comment)
    chrome.runtime.sendMessage({
      action: 'logUserData',
      user_id: user_id,
      timestamp: timestamp,
      event: event_number,
      comment: comment
    })
  }
}
console.log('Ok done with setup')
