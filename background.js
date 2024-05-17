chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.set({ sessionList: {} }, function() {
        console.log("Session list cleared on startup");
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'fetchCertificateChain') {
      fetchCertificateChain(request.webDomain)
        .then(certificateChain => {
          sendResponse({ certificateChain: certificateChain });
        })
        .catch(error => {
          console.error('Error fetching certificate chain:', error);
          sendResponse({ error: error.message });
        });
      return true; // Required to use sendResponse asynchronously
    }
  });

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