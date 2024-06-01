
chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        console.log(details);
        return { requestHeaders: details.requestHeaders };
    },
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]
);