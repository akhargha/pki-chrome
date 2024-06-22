import { fetchCertificateChain } from './utils/fetchUtils'

chrome.runtime.onStartup.addListener(function () {
  chrome.storage.local.set({ sessionList: {} }, function () {
    console.log('Session list cleared on startup')
  })
})

// background.js
chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request.type === 'storeUserId') {
    chrome.storage.local.set({ userId: request.userId }, function () {})
    sendResponse({ status: 'User ID stored' })
  }
  return true
})
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'fetchCertificateChain') {
    fetchCertificateChain(request.webDomain)
      .then(certificateChain => {
        sendResponse({ certificateChain: certificateChain })
      })
      .catch(error => {
        console.error('Error fetching certificate chain:', error)
        sendResponse({ error: error.message })
      })
    return true // Required to use sendResponse asynchronously
  } else if (request.action === 'logUserData') {
    logUserData(
      request.user_id,
      request.timestamp,
      request.event,
      request.comment
    )
  } else if (request.action === 'fetchTestWebsites') {
    fetchTestWebsites()
      .then(websites => {
        sendResponse({ websites: websites })
      })
      .catch(error => {
        console.error('Error fetching websites:', error)
        sendResponse({ error: error.message })
      })
    return true // Required to use sendResponse asynchronously
  }
})

function logUserData (user_id, timestamp, event, comment) {
  try{
    fetch(
      `http://pkie.engr.uconn.edu/user_data/${user_id}/${timestamp}/${event}/${comment}`
    ).catch((e)=>{
      console.log("failed to send data")
      //TODO: tell the client.
    })
  }catch(e){
    console.log("failed to send data")
    //TODO: tell the client.
  }

}
