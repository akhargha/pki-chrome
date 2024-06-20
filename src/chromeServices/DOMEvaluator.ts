import {
  DOMMessageResponse,
  DOMMessageType,
  RequestPayload
} from '../types/DOMMessage'

// Function called when a new message is received
const messagesFromReactAppListener = (
  payload: RequestPayload,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: DOMMessageResponse) => void
) => {
  console.log('[content.js]. Message received', payload)

  // Prepare the response object with information about the site
  const response: DOMMessageResponse = {
    title: document.title,
    headlines: []
  }
  switch (payload.type) {
    case DOMMessageType.GET_DOM:
      break
    case DOMMessageType.TOGGLE_EXTENSION_PAGE:
      const data = payload.data as { page: string }
      if (data.page === 'landing') {
      }
      break
  }
  sendResponse(response)
}

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener)
