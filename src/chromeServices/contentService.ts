import { iMsgReqType } from '../types/MessageTypes'
import {
  WebsiteListEntry,
  WebsiteListEntryLogType
} from '../utils/LocalStorage'
import {
  customAlert3Prompts,
  customAlertUpdatePrompt
} from '../utils/PagesUtils'
import { GitHubRelease } from '../utils/fetchUtils'
import { ChromeCookie } from '../types/Cookies'

//CONTENT SCRIPTS ARE SCRIPTS RAN IN THE CONTEXT OF THE WEBPAGES. THEY ARE WHAT HAS ACCESS TO THE DOM AND ALL IT'S ELEMENTS
const url = new URL(window.location.href)
const webDomain = url.hostname
const shortenedDomain = webDomain.replace(/^www\./, '')

let blockerClicked = false

let user_id = '123456'
let isActive = true

chrome.runtime.sendMessage({ type: iMsgReqType.fetchCookieInfo }, c => {
  const cookies: ChromeCookie[] = c

  //this is because we have one cookie which is the crsf token! we need at least 2 cookies
  //should we check this on every page... idk. but I don't think this
  //will have an impact on performance either way.
  if (cookies.length <= 1) return // we dont have the required data, do nothing as of right now...

  cookies.forEach((cookie: ChromeCookie) => {
    switch (cookie.name) {
      case 'user_id':
        user_id = cookie.value
        break
      case 'use_extension':
        //convert to boolean, is string.
        isActive = cookie.value === 'True' ? true : false
        break
      default:
        break
    }
  })

  chrome.storage.local.set({
    _pki_userData: {
      user_id: user_id,
      TEST_ExtensionActive: isActive
    }
  })
})

function main () {
  if (!isActive) {
    //if extension shouldn't be used... don't do anything.
    return
  }

  //check for auto updater,
  try {
    chrome.storage.local.get(
      {
        _pkiExtensionUpdateInfo: {
          lastCheck: 0
        }
      },
      d => {
        console.warn(
          d,
          d._pkiExtensionUpdateInfo.lastCheck + 60 * 60 * 1000,
          Date.now()
        )
        //only check once per hr
        if (d._pkiExtensionUpdateInfo.lastCheck + 60 * 60 * 1000 < Date.now()) {
          const owner = 'akhargha'
          const repo = 'pki-chrome'

          const url = `https://api.github.com/repos/${owner}/${repo}/releases`
          const vers: string = require('../version').default.version
          const isbeta = vers.endsWith('-beta')

          if (vers !== 'dev') {
            fetch(url)
              .then(response => response.json())
              .then((data: GitHubRelease[]) => {
                data.sort(
                  (a, b) =>
                    new Date(b.published_at).getTime() -
                    new Date(a.published_at).getTime()
                )
                let last: GitHubRelease | undefined = undefined
                let current: GitHubRelease | undefined = undefined
                data.forEach((release: GitHubRelease) => {
                  // console.log(release)
                  if (isbeta && release.prerelease === true) {
                    if (release.tag_name === vers) {
                      current = release
                    } else {
                      last = release
                    }
                  } else {
                    if (isbeta && release.prerelease === false) return
                    if (release.tag_name === vers) {
                      current = release
                    } else {
                      last = release
                    }
                  }
                })
                if (last === undefined || current === undefined) {
                  throw new Error('undefined error when checking version')
                }
                last = last as GitHubRelease
                current = current as GitHubRelease
                let lastIndex = data.indexOf(last)
                let currentIndex = data.indexOf(current)

                customAlertUpdatePrompt(
                  'MobyPish Alert!',
                  `Your extension isn't up to date! Would you like to update? Declining will silence update notifications for an hour.`,
                  {
                    text: 'Yes',
                    color: 'green',
                    callback: () => {
                      // chrome.tabs.create({ url: last?.html_url })
                      chrome.storage.local.set({
                        _pkiExtensionUpdateInfo: {
                          lastCheck: Date.now() - 55 * 60 * 1000
                        }
                      })
                      chrome.runtime.sendMessage({
                        type: iMsgReqType.openNewTab,
                        url: last?.html_url
                      })
                    }
                  },
                  {
                    text: 'No',
                    color: 'red',
                    callback: () => {
                      chrome.storage.local.set({
                        _pkiExtensionUpdateInfo: {
                          lastCheck: Date.now()
                        }
                      })
                    }
                  }
                )
              })

              .catch(error => console.error('Error fetching releases:', error))
          }
        }
      }
    )
  } catch (e) {}
  chrome.storage.local.get(
    //websiteList is the list of sites we have saved as safe or unsafe
    //session list is the list of sites that we have visitied in this session, so no reverification is needed.
    { websiteList: {}, sessionList: {}, ignoreList: [] },
    function (items) {
      const websiteList: { [key: string]: WebsiteListEntry } = items.websiteList
      const sessionList: { [key: string]: boolean } = items.sessionList
      const ignoreList: string[] = items.ignoreList

      const siteData = websiteList[shortenedDomain]
      console.warn(siteData)
      if (siteData) {
        const currentTimeInMs = Date.now() // Get current time in milliseconds since Unix epoch
        const localTimeString = new Date(currentTimeInMs).toLocaleString() // Convert to local date and time string

        siteData.lastVisit = localTimeString
        websiteList[shortenedDomain] = siteData
        chrome.storage.local.set({
          websiteList,
          sessionList
        })
        chrome.runtime.sendMessage({ type: iMsgReqType.siteDataRefresh })
        if (siteData.LogType === WebsiteListEntryLogType.PROTECTED) {
          // Check if the site is in protected list
          console.log('protected site')
          // Check if the site is in session list
          if (sessionList[shortenedDomain]) {
            console.log('in session list')
            // If in session list, remove blocker if it exists
            removeBlocker()

            // Check if site is test site
            chrome.runtime.sendMessage(
              { type: iMsgReqType.fetchTestWebsites },
              function (response) {
                console.log('checking')
                if (response && response.websites) {
                  const testWebsites = response.websites
                  if (testWebsites.includes(shortenedDomain)) {
                    //if site is test site then check cert
                    const shortenedDomain = webDomain.replace(/^www\./, '')
                    chrome.runtime.sendMessage(
                      {
                        type: iMsgReqType.fetchCertificateChain,
                        webDomain: shortenedDomain
                      },
                      function (response) {
                        if (response.certificateChain) {
                          const savedCertificateChain = siteData.certChain
                          if (
                            compareCertificateChains(
                              response.certificateChain,
                              savedCertificateChain
                            )
                          ) {
                            console.log('Certificate chain matches')
                          } else {
                            console.log('Certificate chain does not match')
                            //DO OTHER STUFF HERE
                            addBlocker(
                              'Some security information about this site has been changed! This is usually an indicator of an attack. Please click on the extension to proceed.'
                            )
                          }
                        } else if (response.error) {
                          console.error(
                            'Error fetching certificate chain:',
                            response.error
                          )
                          // If there's an error fetching the certificate chain, add blocker
                          addBlocker(
                            'Some security information about this site has been changed! This is usually an indicator of an attack. Please click on the extension to proceed.'
                          )
                        }
                      }
                    )
                  }
                }
              }
            )
          } else {
            console.log('not in session list')
            // If not in session list, send a message to the background script to fetch the certificate chain

            // Remove "www." from the beginning of the domain
            const shortenedDomain = webDomain.replace(/^www\./, '')

            chrome.runtime.sendMessage(
              {
                type: iMsgReqType.fetchCertificateChain,
                webDomain: shortenedDomain
              },
              function (response) {
                if (response.certificateChain) {
                  const savedCertificateChain = siteData.certChain
                  if (
                    compareCertificateChains(
                      response.certificateChain,
                      savedCertificateChain
                    )
                  ) {
                    console.log('Certificate chain matches')
                    // addBlocker(
                    //   'You have marked this site to be protected. Please click on the extension before proceeding to prevent yourself from cyber attacks.'
                    // )
                    //TODO: do we really want to add a blocker if the extension verifies the cert chain
                    // is the same? like what is the point in that? just asking...
                  } else {
                    console.log('Certificate chain does not match')
                    //DO OTHER STUFF HERE
                    addBlocker(
                      'Some security information about this site has been changed! This is usually an indicator of an attack. Please click on the extension to proceed.'
                    )
                  }
                } else if (response.error) {
                  console.error(
                    'Error fetching certificate chain:',
                    response.error
                  )
                  // If there's an error fetching the certificate chain, add blocker
                  addBlocker(
                    'Some security information about this site has been changed! This is usually an indicator of an attack. Please click on the extension to proceed.'
                  )
                }
              }
            )
          }
        } else {
          console.log('blocked site')

          //check for password fields for unsafe sites
          // chrome.storage.local.get(
          //   { autoSearchEnabled: true },
          //   function (settings) {
          //     if (settings.autoSearchEnabled) {
          //       const passwordFields = document.querySelectorAll(
          //         'input[type="password"]'
          //       )
          //       if (passwordFields.length > 0) {
          //         // Add blocker todo: fix this
          //         addBlocker(
          //           'This site is marked as blocked. Please click on the extension before proceeding to prevent yourself from cyber attacks.'
          //         )
          //       }
          //     }
          //   }
          // )
          //why do we do the above..?

          //instead. just block the site regardless of passwords.
          addBlocker(
            'This site is marked as blocked. Please click on the extension before proceeding to prevent yourself from cyber attacks.'
          )
        }
      } else {
        if (!ignoreList.includes(shortenedDomain)) {
          //check for password fields for unsaved sites
          chrome.storage.local.get(
            { autoSearchEnabled: true },
            function (settings) {
              if (settings.autoSearchEnabled) {
                const passwordFields = document.querySelectorAll(
                  'input[type="password"]'
                )
                if (passwordFields.length > 0) {
                  customAlert3Prompts(
                    'MobyPhish Info',
                    'Moby thinks this page contains password fields, so it recommends to protect it.',
                    {
                      text: 'Do not ask again for this website.'
                    },
                    { text: 'Do not ask again for any website.' },
                    {
                      text: 'Add to safe list',
                      color: 'green',
                      callback: () => {
                        chrome.runtime.sendMessage({
                          type: iMsgReqType.frontEndRequestUserSaveSite,
                          webDomain: shortenedDomain
                        })
                      }
                    },
                    {
                      text: 'Close',
                      color: 'red',
                      callback: () => {
                        //Do not ask again for this website.
                        const check1 = document.getElementById(
                          '_pkiPopupCheckbox1'
                        ) as HTMLInputElement

                        //DO NOT ASK AGAIN FOR ANY WEBSITE
                        const check2 = document.getElementById(
                          '_pkiPopupCheckbox2'
                        ) as HTMLInputElement

                        //we add this to our saved list(?)
                        if (check1.checked) {
                          chrome.storage.local.get({ ignoreList: [] }, data => {
                            const ignoreList: string[] = data.ignoreList
                            ignoreList.push(shortenedDomain)
                            chrome.storage.local.set({ ignoreList })
                          })
                        }
                        if (check2.checked) {
                          // set autosearch to off.
                          chrome.storage.local.set({
                            autoSearchEnabled: false
                          })
                        }
                      }
                    }
                  )
                }
              }
            }
          )
        }
      }
    }
  )
}
// Listener for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.warn(request)
  if (request.action === 'removeBlocker') {
    removeBlocker()
  }
  if (request.action === 'addBlocker') {
    addBlocker()
  }
  if (request.action === 'checkIfClicked') {
    sendResponse({ clicked: blockerClicked })
    blockerClicked = false
  }
})

function compareCertificateChains (
  chain1: { [x: string]: any },
  chain2: { [x: string]: any }
) {
  if (Object.keys(chain1).length !== Object.keys(chain2).length) {
    return false
  }

  for (const key in chain1) {
    if (key === 'ev') {
      if (chain1[key] !== chain2[key]) {
        return false
      }
    } else {
      const obj1 = chain1[key]
      const obj2 = chain2[key]

      if (
        !compareObjects(obj1.subject, obj2.subject) ||
        !compareObjects(obj1.issuer, obj2.issuer)
      ) {
        return false
      }
    }
  }

  return true
}

function compareObjects (
  obj1: { [x: string]: any },
  obj2: { [x: string]: any }
) {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}

function addBlocker (
  message = 'This site is blocked by the extension. Click on the extension to continue'
) {
  const find = document.getElementById('myBlockerDiv')
  if (find) {
    find.remove()
  }
  console.log('made blocker')
  // if (!document.getElementById('myBlockerDiv')) {
  var blockerDiv = document.createElement('div')
  blockerDiv.id = 'myBlockerDiv'
  blockerDiv.style.position = 'fixed'
  blockerDiv.style.left = '0'
  blockerDiv.style.top = '0'
  blockerDiv.style.width = '100vw' // Width as 100% of viewport width
  blockerDiv.style.height = '100vh' // Height as 100% of viewport height
  blockerDiv.style.zIndex = '10001'

  document.body.appendChild(blockerDiv)

  var blockerMessage = document.createElement('h1')
  blockerMessage.style.color = 'black' // Changed to yellow background
  blockerMessage.style.fontFamily = 'Trebuchet MS'
  blockerMessage.style.fontSize = '50px'
  blockerMessage.style.textAlign = 'center'
  blockerMessage.style.position = 'absolute' // Ensure it's positioned relative to the blockerDiv
  blockerMessage.style.top = '50%' // Center vertically in the middle of the viewport
  blockerMessage.style.left = '50%' // Center horizontally
  blockerMessage.style.transform = 'translate(-50%, -50%)' // Ensure it's centered perfectly
  blockerMessage.innerHTML = message // Use the message parameter
  blockerMessage.style.display = 'none' // Initially hide the message

  // Flashing colors for the text
  var colors = ['red', 'blue', 'green', 'white'] // Define colors to cycle through
  var currentColorIndex = 0 // Starting index
  setInterval(function () {
    blockerMessage.style.backgroundColor = colors[currentColorIndex] // Update the color
    currentColorIndex = (currentColorIndex + 1) % colors.length // Move to the next color
  }, 500) // Change color every 500 milliseconds

  blockerDiv.appendChild(blockerMessage)

  // Show message/feedback when user clicks without opening extension
  blockerDiv.addEventListener('click', function () {
    blockerClicked = true
    blockerMessage.style.display = 'block' // Show the message on click

    //TODO: IMPLEMENT THIS LOGIC!!!
    chrome.runtime.sendMessage({ type: 'blockerDivClicked' }) // Send msg to popup.js to show feedback

    const timestamp = Date.now()

    const event = '1'
    const comment = 'Interact with protected website without opening extension'
    chrome.runtime.sendMessage({
      type: iMsgReqType.sendUserActionInfo,
      user_id: user_id,
      timestamp: timestamp,
      event: event,
      comment: comment
    })
  })
  // }
}

function removeBlocker () {
  console.log('ok remove')
  var blockerDiv = document.getElementById('myBlockerDiv')
  if (blockerDiv) {
    blockerDiv.remove()
  }
}

main()