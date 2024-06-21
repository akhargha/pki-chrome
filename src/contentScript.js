//CONTENT SCRIPTS ARE SCRIPTS RAN IN THE CONTEXT OF THE WEBPAGES. THEY ARE WHAT HAS ACCESS TO THE DOM AND ALL IT'S ELEMENTS
const url = new URL(window.location.href)
const webDomain = url.hostname

console.log(webDomain)

let blockerClicked = false

user_id = '123456'
chrome.storage.local.get('userId', function (data) {
  if (data.userId) {
    user_id = data.userId
  }
})

chrome.storage.local.get(
  { websiteList: {}, sessionList: {} },
  function (items) {
    if (items.websiteList[webDomain]) {
      if (items.websiteList[webDomain].isSensitive) {
        // Check if the site is in protected list
        console.log('sensitive site')
        // Check if the site is in session list
        if (items.sessionList[webDomain]) {
          console.log('in session list')
          // If in session list, remove blocker if it exists
          removeBlocker()

          // Check if site is test site
          chrome.runtime.sendMessage(
            { action: 'fetchTestWebsites' },
            function (response) {
              console.log('checking')
              if (response && response.websites) {
                const testWebsites = response.websites
                if (testWebsites.includes(webDomain)) {
                  //if site is test site then check cert
                  const shortenedDomain = webDomain.replace(/^www\./, '')
                  chrome.runtime.sendMessage(
                    {
                      action: 'fetchCertificateChain',
                      webDomain: shortenedDomain
                    },
                    function (response) {
                      if (response.certificateChain) {
                        const savedCertificateChain =
                          items.websiteList[webDomain].certificateChain
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
          console.log(shortenedDomain)

          chrome.runtime.sendMessage(
            { action: 'fetchCertificateChain', webDomain: shortenedDomain },
            function (response) {
              if (response.certificateChain) {
                const savedCertificateChain =
                  items.websiteList[webDomain].certificateChain
                if (
                  compareCertificateChains(
                    response.certificateChain,
                    savedCertificateChain
                  )
                ) {
                  console.log('Certificate chain matches')
                  addBlocker(
                    'You have marked this site to be protected. Please click on the extension before proceeding to prevent yourself from cyber attacks.'
                  )
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
        console.log('unsafe site')

        //check for password fields for unsafe sites
        chrome.storage.local.get(
          { autoSearchEnabled: true },
          function (settings) {
            if (settings.autoSearchEnabled) {
              const passwordFields = document.querySelectorAll(
                'input[type="password"]'
              )
              if (passwordFields.length > 0) {
                alert(
                  '🔒 Extension Alert: This site may contain sensitive information with password fields. Click the 🔒 extension for safety. \n \n To disable future alerts, uncheck "automatic detection" in extension settings 🔒.'
                )
              }
            }
          }
        )

        // Add blocker
        addBlocker(
          'This site is marked as unsafe. Please click on the extension before proceeding to prevent yourself from cyber attacks.'
        )
      }
    } else {
      //check for password fields for unsaved sites
      chrome.storage.local.get(
        { autoSearchEnabled: true },
        function (settings) {
          if (settings.autoSearchEnabled) {
            const passwordFields = document.querySelectorAll(
              'input[type="password"]'
            )
            if (passwordFields.length > 0) {
              alert(
                '🔒 Extension Alert: This site may contain sensitive information with password fields. Click the 🔒 extension for safety. \n \n To disable future alerts, uncheck "automatic detection" in extension settings 🔒.'
              )
            }
          }
        }
      )
    }
  }
)

function addBlocker (
  message = 'This site is blocked by the extension. Click on the extension to continue'
) {
  if (!document.getElementById('myBlockerDiv')) {
    var blockerDiv = document.createElement('div')
    blockerDiv.id = 'myBlockerDiv'
    blockerDiv.style.position = 'fixed'
    blockerDiv.style.left = '0'
    blockerDiv.style.top = '0'
    blockerDiv.style.width = '100vw' // Width as 100% of viewport width
    blockerDiv.style.height = '100vh' // Height as 100% of viewport height
    blockerDiv.style.zIndex = '10000'

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

      chrome.runtime.sendMessage({ action: 'blockerDivClicked' }) // Send msg to popup.js to show feedback

      const timestamp = Date.now()
      console.log(timestamp)
      const event = '1'
      const comment =
        'Interact with protected website without opening extension'
      chrome.runtime.sendMessage({
        action: 'logUserData',
        user_id: user_id,
        timestamp: timestamp,
        event: event,
        comment: comment
      })
    })
  }
}

function removeBlocker () {
  var blockerDiv = document.getElementById('myBlockerDiv')
  if (blockerDiv) {
    blockerDiv.remove()
  }
}

// Listener for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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

function compareCertificateChains (chain1, chain2) {
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

function compareObjects (obj1, obj2) {
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
