/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils/fetchUtils.js":
/*!*********************************!*\
  !*** ./src/utils/fetchUtils.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchCertificateChain: () => (/* binding */ fetchCertificateChain)
/* harmony export */ });
function fetchCertificateChain (webDomain) {
  // Remove "www." from the beginning of the domain
  const shortenedDomain = webDomain.replace(/^www\./, '')
  return fetch(
    `http://pkie.engr.uconn.edu/certificate_chain/${shortenedDomain}`
  )
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        return data.output
      } else {
        throw new Error('Failed to fetch certificate chain')
      }
    })
}

function fetchTestWebsites () {
  return fetch(`http://localhost:8080/websites`)
    .then(response => response.json())
    .then(data => {
      return data
    })
    .catch(error => {
      throw new Error('Failed to fetch websites')
    })
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!******************************!*\
  !*** ./src/serviceWorker.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_fetchUtils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/fetchUtils */ "./src/utils/fetchUtils.js");


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
    (0,_utils_fetchUtils__WEBPACK_IMPORTED_MODULE_0__.fetchCertificateChain)(request.webDomain)
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
  fetch(
    `http://pkie.engr.uconn.edu/user_data/${user_id}/${timestamp}/${event}/${comment}`
  )
}

/******/ })()
;
//# sourceMappingURL=serviceWorker.bundle.js.map