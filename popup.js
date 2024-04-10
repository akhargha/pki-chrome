/**
 * 1. Store frequency of random testing as input. - done
 * 2. Display cert info (call function with a 0 probability of fakecert) - save that in string - done
 * 3. use saved string and save cert info for sensitive site when the site is added to list - done
 * 4. use function call (using frequency stored) when opening popup and determining site list - if in sensitive and different from list-saved, then do not send 'removeblocker' and display message and give option to trust. - done
 * 5. in this, if the cert info is fake (match strings), then if user clicks on "trust" - give feedback - done
 * 6. !Create actual string for feedback
 * 7. !Cert info currently not updating to fake
 * 8. !check validation (OV, DV, EV)
 */

//same codebase
//same functionality - for no noise
// have a list of CA names (real) and make sure the same CA is NOT Displayed
// bad indicator - click box without clicking extension - also give feedback to user if user clicks on website
// option1: i want to continue || option2: no there's something wrong (random testing or attack)




document.addEventListener("DOMContentLoaded", function () {

    /** 
     * To access frequency
    chrome.storage.local.get('testingFrequency', function(result) {
        // 'result' is an object with keys and values stored in local storage.
        // The frequency we saved earlier is accessed by using the same key we used to save it.
        if (result.testingFrequency !== undefined) {
            console.log("Testing frequency is: ", result.testingFrequency);
            // You can now use 'result.testingFrequency' as needed in your script.
        } else {
            console.log("Testing frequency not found.");
            // Handle the case where 'testingFrequency' might not be set yet.
        }
    }); 
    */
    console.log("TEST1");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let curr_issuerCommonName;
        let test_issuerCommonName;
        const url = tabs[0].url;
        const urlObj = new URL(url);
        const webDomain = urlObj.hostname;
        const favicon = tabs[0].favIconUrl;

        // Display the website URL
        const urlContainer = document.getElementById("url-container");
        urlContainer.textContent = "URL: " + webDomain;

        // Display the favicon
        const faviconImage = document.createElement("img");
        faviconImage.src = favicon;
        faviconImage.alt = "Favicon";

        // Clear previous favicon image if any
        const previousFavicon = document.getElementById("favicon-img");
        if (previousFavicon) {
            previousFavicon.remove();
        }

        // Append the new favicon image to the container
        faviconImage.id = "favicon-img";
        const faviconContainer = document.getElementById("favicon-container");
        faviconContainer.appendChild(faviconImage);

        // Call backend to display certificate information
        let apiUrl = `http://127.0.0.1:5000/certificate?url=${encodeURIComponent(url)}`;
        apiUrl += `&frequency=99999999`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const issuerCommonName = data.issuer.commonName;
                curr_issuerCommonName = issuerCommonName;
                const issuerOrganizationName = data.issuer.organizationName;

                const commonNameElement = document.getElementById('commonname');
                commonNameElement.textContent = `Common Name: ${issuerCommonName}`;

                const organizationNameElement = document.getElementById('organizationname');
                organizationNameElement.textContent = `Organization Name: ${issuerOrganizationName}`;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while retrieving the certificate information.');
            });

        checkList(webDomain).then((result) => {
            if (result === 0) {
                //Website is sensitive
                removeView();
                document.getElementById("all-set").style.display = "block";
                chrome.storage.local.get({ sessionList: {} }, function (items) {
                    const sessionList = items.sessionList;
                    sessionList[webDomain] = true;
                    chrome.storage.local.set({ sessionList: sessionList }, function () {
                        console.log("Website added to session list", webDomain);
                    });
                });

                // Get the testing frequency from local storage
                chrome.storage.local.get('testingFrequency', function (result) {
                    let frequency = 101 - result.testingFrequency;
                    if (frequency === undefined) {
                        frequency = 100; // Default frequency if not set
                    }

                    // Call backend to display certificate information
                    let apiUrl = `http://127.0.0.1:5000/certificate?url=${encodeURIComponent(url)}`;
                    apiUrl += `&frequency=${frequency}`;
                    fetch(apiUrl)
                        .then(response => response.json())
                        .then(data => {
                            const issuerCommonName = data.issuer.commonName;
                            console.log(issuerCommonName);
                            test_issuerCommonName = issuerCommonName;
                            const issuerOrganizationName = data.issuer.organizationName;

                            const commonNameElement = document.getElementById('commonname');
                            commonNameElement.textContent = `Common Name: ${issuerCommonName}`;

                            const organizationNameElement = document.getElementById('organizationname');
                            organizationNameElement.textContent = `Organization Name: ${issuerOrganizationName}`;

                            // Check if the current issuer common name matches the stored label for the web domain
                            chrome.storage.local.get({ websiteList: {} }, function (items) {
                                const websiteList = items.websiteList;
                                if (websiteList.hasOwnProperty(webDomain) && websiteList[webDomain].label === test_issuerCommonName) {
                                    // Send the removeBlocker message
                                    chrome.tabs.sendMessage(tabs[0].id, { action: "removeBlocker" });
                                } else {
                                    // Change display mode to block for element with id "cert-info-change"
                                    document.getElementById("cert-info-change").style.display = "block";

                                    console.log("TEST" + test_issuerCommonName);
                                    // Add event listener for the "trust-on-change" button
                                    document.getElementById("trust-on-change").addEventListener("click", function () {
                                        console.log("TEST" + test_issuerCommonName);
                                        if (test_issuerCommonName === "fakeissuer.com") {
                                            // Change display to block for element "feedback"
                                            console.log("Displayed feedbakc")
                                            document.getElementById("feedback").style.display = "block";
                                        } else {
                                            // Save the web domain with the current issuer common name as the label
                                            chrome.storage.local.get({ websiteList: {}, sessionList: {} }, function (items) {
                                                const websiteList = items.websiteList;
                                                const sessionList = items.sessionList;
                                                websiteList[webDomain] = { isSensitive: true, label: test_issuerCommonName };
                                                sessionList[webDomain] = true;
                                                chrome.storage.local.set({ websiteList: websiteList, sessionList: sessionList }, function () {
                                                    console.log("Website Saved as Sensitive", webDomain);
                                                    console.log("Website added to session list", webDomain);
                                                });
                                                removeView();
                                                document.getElementById("added-to-trusted").style.display = "block";
                                            });
                                        }
                                    });
                                }
                            });
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while retrieving the certificate information.');
                        });
                });

            } else if (result === 1) {
                //Website is unsafe
                removeView();
                document.getElementById("site-blocked-text").style.display = "block";
                document.getElementById("sensitive-save-btn-1").style.display = "block";
            } else {
                //Website not found
                console.log("Website not found in the list");
            }
        });

        // Add to sensitive list
        document
            .getElementById("sensitive-save-btn")
            .addEventListener("click", function () {
                chrome.storage.local.get({ websiteList: {}, sessionList: {} }, function (items) {
                    const websiteList = items.websiteList;
                    const sessionList = items.sessionList;
                    // Storing the URL with values: true for sensitive and a string "test"
                    websiteList[webDomain] = { isSensitive: true, label: curr_issuerCommonName };
                    sessionList[webDomain] = true;
                    chrome.storage.local.set({ websiteList: websiteList, sessionList: sessionList }, function () {
                        console.log("Website Saved as Sensitive", webDomain);
                        console.log("Website added to session list", webDomain);
                        console.log("Website Saved as Sensitive", webDomain);
                    });
                    removeView();
                    document.getElementById("added-to-trusted").style.display = "block";


                    /**
                     * access saved cert info
                    chrome.storage.local.get({ websiteList: {} }, function (items) {
                        const websiteList = items.websiteList;
                    
                        // Check if the websiteList contains the webDomain
                        if (websiteList.hasOwnProperty(webDomain)) {
                            // Access the label for the specified webDomain
                            const label = websiteList[webDomain].label;
                            console.log("Label for google.com:", label);
                        } else {
                            console.log("WebDomain not found in the websiteList.");
                        }
                    });
                     */


                });
            });

        // Add to sensitive list
        document
            .getElementById("sensitive-save-btn-1")
            .addEventListener("click", function () {
                chrome.storage.local.get({ websiteList: {}, sessionList: {} }, function (items) {
                    const websiteList = items.websiteList;
                    const sessionList = items.sessionList;
                    // Storing the URL with values: true for sensitive and a string "test"
                    websiteList[webDomain] = { isSensitive: true, label: curr_issuerCommonName };
                    sessionList[webDomain] = true;
                    chrome.storage.local.set({ websiteList: websiteList, sessionList: sessionList }, function () {
                        console.log("Website Saved as Sensitive", webDomain);
                        console.log("Website added to session list", webDomain);
                    });
                    removeView();
                    document.getElementById("added-to-trusted").style.display = "block";
                });
            });

        // Add to unsafe list
        document
            .getElementById("unsafe-save-btn")
            .addEventListener("click", function () {
                removeView();
                document.getElementById("sensitive-save-btn-1").style.display = "block";
                document.getElementById("unsafe-save-btn-1").style.display = "block";
                document.getElementById("not-marked-sensitive-proceed-caution").style.display = "block";
            });

        document
            .getElementById("unsafe-save-btn-1")
            .addEventListener("click", function () {
                chrome.storage.local.get({ websiteList: {} }, function (items) {
                    const websiteList = items.websiteList;
                    // Storing the URL with values: false for unsafe and a string "test"
                    websiteList[webDomain] = { isSensitive: false, label: "test" };
                    chrome.storage.local.set({ websiteList: websiteList }, function () {
                        console.log("Website Saved as Unsafe", webDomain);
                    });
                    removeView();
                    document.getElementById("added-to-untrust").style.display = "block";
                });
            });

        document.getElementById('save_frequency').addEventListener('click', function () {
            const sliderValue = document.getElementById('test_frequency_slider').value;
            const frequency = parseInt(sliderValue, 10); // 10 for decimal

            // Save the frequency to local storage
            chrome.storage.local.set({ 'testingFrequency': frequency }, function () {
                console.log("Testing frequency saved:", frequency);
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const navbarBurger = document.querySelector(".navbar-burger");
    const navbarMenu = document.getElementById("navbarMenu");

    navbarBurger.addEventListener("click", function () {
        navbarBurger.classList.toggle("is-active");
        navbarMenu.classList.toggle("is-active");
    });
});

// Remove all elements from screen
function removeView() {
    document.getElementById("choose-option").style.display = "none";
    document.getElementById("added-to-trusted").style.display = "none";
    document.getElementById("sensitive-save-btn").style.display = "none";
    document.getElementById("unsafe-save-btn").style.display = "none";
    document.getElementById(
        "not-marked-sensitive-proceed-caution"
    ).style.display = "none";
    document.getElementById("added-to-untrust").style.display = "none";
    document.getElementById("not-recognized-text").style.display = "none";
    document.getElementById("site-blocked-text").style.display = "none";
    document.getElementById("sensitive-save-btn-1").style.display = "none";
    document.getElementById("unsafe-save-btn-1").style.display = "none";
}

//Returns 0 for sensitive, 1 for unsafe, and -1 for not-found
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

// Edit sensitive site list
document.getElementById("nav-sensitive").addEventListener("click", function () {
    removeView();
    document.getElementById("sensitive-sites-list").style.display = "block";
    document.getElementById("sensitive-input").style.display = "block";
    document.getElementById("sensitive-save").style.display = "block";
    displaySensitiveSites();
});

// Edit unsafe site list
document.getElementById("nav-unsafe").addEventListener("click", function () {
    removeView();
    document.getElementById("unsafe-sites-list").style.display = "block";
    document.getElementById("unsafe-input").style.display = "block";
    document.getElementById("unsafe-save").style.display = "block";
    displayUnsafeSites();
});

// Display sensitive sites
function displaySensitiveSites() {
    chrome.storage.local.get({ websiteList: {} }, function (items) {
        const websiteList = items.websiteList;
        const sensitiveSitesList = document.getElementById("sensitive-sites-list");
        sensitiveSitesList.innerHTML = "";

        for (const website in websiteList) {
            if (websiteList[website].isSensitive) {
                const siteButton = document.createElement("button");
                siteButton.textContent = website;
                siteButton.classList.add("button", "is-primary", "is-small", "is-rounded", "sensitive-site");
                siteButton.addEventListener("click", function () {
                    removeSensitiveSite(website);
                });
                sensitiveSitesList.appendChild(siteButton);
            }
        }
    });
}

// Display unsafe sites
function displayUnsafeSites() {
    chrome.storage.local.get({ websiteList: {} }, function (items) {
        const websiteList = items.websiteList;
        const unsafeSitesList = document.getElementById("unsafe-sites-list");
        unsafeSitesList.innerHTML = "";

        for (const website in websiteList) {
            if (!websiteList[website].isSensitive) {
                const siteButton = document.createElement("button");
                siteButton.textContent = website;
                siteButton.classList.add("button", "is-danger", "is-small", "is-rounded", "unsafe-site");
                siteButton.addEventListener("click", function () {
                    removeUnsafeSite(website);
                });
                unsafeSitesList.appendChild(siteButton);
            }
        }
    });
}

// Save sensitive site
document.getElementById("sensitive-save").addEventListener("click", function () {
    const sensitiveInput = document.querySelector("#sensitive-input input");
    const website = sensitiveInput.value.trim();

    if (website !== "") {
        chrome.storage.local.get({ websiteList: {} }, function (items) {
            const websiteList = items.websiteList;
            websiteList[website] = { isSensitive: true, label: "test" };
            chrome.storage.local.set({ websiteList: websiteList }, function () {
                console.log("Website saved as sensitive:", website);
                sensitiveInput.value = "";
                displaySensitiveSites();
            });
        });
    }
});

// Save unsafe site
document.getElementById("unsafe-save").addEventListener("click", function () {
    const unsafeInput = document.querySelector("#unsafe-input input");
    const website = unsafeInput.value.trim();

    if (website !== "") {
        chrome.storage.local.get({ websiteList: {} }, function (items) {
            const websiteList = items.websiteList;
            websiteList[website] = { isSensitive: false, label: "test" };
            chrome.storage.local.set({ websiteList: websiteList }, function () {
                console.log("Website saved as unsafe:", website);
                unsafeInput.value = "";
                displayUnsafeSites();
            });
        });
    }
});

// Remove sensitive site
function removeSensitiveSite(website) {
    chrome.storage.local.get({ websiteList: {} }, function (items) {
        const websiteList = items.websiteList;
        delete websiteList[website];
        chrome.storage.local.set({ websiteList: websiteList }, function () {
            console.log("Sensitive site removed:", website);
            displaySensitiveSites();
        });
    });
}

// Remove unsafe site
function removeUnsafeSite(website) {
    chrome.storage.local.get({ websiteList: {} }, function (items) {
        const websiteList = items.websiteList;
        delete websiteList[website];
        chrome.storage.local.set({ websiteList: websiteList }, function () {
            console.log("Unsafe site removed:", website);
            displayUnsafeSites();
        });
    });
}