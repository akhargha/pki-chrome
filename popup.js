document.addEventListener("DOMContentLoaded", function () {
    console.log("TEST1");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
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
                chrome.tabs.sendMessage(tabs[0].id, {action: "removeBlocker"});
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
                    websiteList[webDomain] = { isSensitive: true, label: "test" };
                    sessionList[webDomain] = true;
                    chrome.storage.local.set({ websiteList: websiteList, sessionList: sessionList }, function () {
                        console.log("Website Saved as Sensitive", webDomain);
                        console.log("Website added to session list", webDomain);
                    });
                    removeView();
                    document.getElementById("added-to-trusted").style.display = "block";
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
                    websiteList[webDomain] = { isSensitive: true, label: "test" };
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