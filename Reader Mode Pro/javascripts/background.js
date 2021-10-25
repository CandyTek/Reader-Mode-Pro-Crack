//server = "http://127.0.0.1:3000";
server = "https://readermode.io";

// Open reader
function startChromeReader(tab) {
  var tabId = tab ? tab.id : null;
  chrome.tabs.executeScript(tabId, { file: "javascripts/readability.js" });
  chrome.tabs.executeScript(tabId, { file: "javascripts/jquery-3.4.1.min.js" });
  chrome.tabs.executeScript(tabId, { file: "javascripts/screenfull.min.js" });
  chrome.tabs.executeScript(tabId, { file: "javascripts/articulate.min.js" });
  chrome.tabs.executeScript(tabId, { file: "javascripts/rangy.js" });
  chrome.tabs.executeScript(tabId, {
    file: "javascripts/app.js"
  });

  // Add a badge to signify the extension is in use
  chrome.browserAction.setBadgeBackgroundColor({color:[242, 38, 19, 230]});
  chrome.browserAction.setBadgeText({text:"on"});
  setTimeout(function() {
    chrome.browserAction.setBadgeText({text:""});
  }, 2000);
}

// Open license modal
function openLicenseModal (tab) {
  var tabId = tab ? tab.id : null;
  chrome.tabs.executeScript(tabId, { file: "javascripts/jquery-3.4.1.min.js" });
  chrome.tabs.executeScript(tabId, {
    file: "javascripts/license.js",
    allFrames: false
  });
}

// Proxy for opening Reader/License
function open (tab) {
  chrome.storage.local.get('cr_license', function(license) {
    if (true) {
      startChromeReader();

      key = license.cr_license.key
      user_agent = license.cr_license.user_agent
      timestamp = license.cr_license.timestamp

      var url = `${server}/api/licenses/status?key=${key}&user_agent=${user_agent}&timestamp=${timestamp}`;
      fetch(url).then(response => {
        return response.json()
      }).then(data => {
        console.log(data.response.status);
        if (data.response && data.response.status == 403) {
          chrome.storage.local.remove('cr_license', function (result) {})
          console.log('License has been deactivated.');
          openLicenseModal(tab);
        } else if (data.response && data.response.status == 404) {
          console.log('Something wrong. Could not validate.');
        } else {
          console.log('Valid license.');
        }
      })
      .catch(e => {
        console.log('Could not validate.');
      })
    } else {
      openLicenseModal(tab)
    }
  })
}

// Listen for the extension's click
chrome.browserAction.onClicked.addListener(function (tab) {
  open(tab);
});

// Create contextMenu for user text selection
chrome.contextMenus.create({
  title: "View this selection in ReaderMode",
  contexts:["selection"],
  onclick: function(info, tab) {
    startChromeReader(tab);
  }
});

// Create contextMenu for when user want to link with CR automatically
linkCMId = chrome.contextMenus.create({
  title: "View the linked page using ReaderMode",
  id: "cr-context-menu",
  contexts:["link"],
  onclick: function(info, tab) {
    chrome.tabs.create(
      { url: info.linkUrl, active: false },
      function(newTab) {
        startChromeReader(newTab);
      }
    );
  }
});

// AutoRun setting if url match saved rules
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  //if (info.status === 'complete') {
    var url = new URL(tab.url);
    var protocol = url.protocol // http: or https:
    var domain = url.hostname; // domain name
    var pathname = url.pathname.substring(1); // use substring to remove '/' at the beginning

    /*
    * Checker List
    * if (pathname.indexOf("post") > -1)
    * pathname.indexOf(url_does_not_contain) === -1
    * pathname.startsWith("post")
    * pathname.endsWith("hunt")
    */

    chrome.storage.sync.get(['cr_auto_run_rules'], function(result) {
      let default_val = result.cr_auto_run_rules
      if (default_val) {
        rules = JSON.parse(default_val);

        for (var key in rules) {
          var id = rules[key]["id"];

          var domain_is = rules[key]["domain_name_is"];
          var url_is = rules[key]["url_is"];
          var url_is_not = rules[key]["url_is_not"];
          var url_contains = rules[key]["url_contains"];
          var url_does_not_contain = rules[key]["url_does_not_contain"];
          var url_starts_with = rules[key]["url_starts_with"];
          var url_ends_with = rules[key]["url_ends_with"];
          var url_rule_in_sentence = rules[key]["url_rule_in_sentence"];

          if ( (domain_is != "") && (url_is != "") && (url_is_not != "") && (url_contains != "") && (url_contains != "") &&
            (url_does_not_contain != "") && (url_starts_with != "") && (url_ends_with != "")
          ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not) &&
              (pathname.indexOf(url_contains) > -1 ) &&
              (pathname.indexOf(url_does_not_contain) === -1 ) &&
              (pathname.startsWith(url_starts_with)) &&
              (pathname.endsWith(url_ends_with))
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") && (url_is_not != "") && (url_contains != "") && (url_contains != "") && (url_does_not_contain != "") && (url_starts_with != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not) &&
              (pathname.indexOf(url_contains) > -1 ) &&
              (pathname.indexOf(url_does_not_contain) === -1 ) &&
              (pathname.startsWith(url_starts_with))
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") && (url_is_not != "") && (url_contains != "") && (url_contains != "") && (url_does_not_contain != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not) &&
              (pathname.indexOf(url_contains) > -1 ) &&
              (pathname.indexOf(url_does_not_contain) === -1 )
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") && (url_is_not != "") && (url_contains != "") && (url_contains != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not) &&
              (pathname.indexOf(url_contains) > -1 )
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") && (url_is_not != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not)
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is)
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") ) {
            if ( (domain == domain_is) ){
              startChromeReader(tab);
            }
          } else {
          }
        }
      }
    });

  //}
});

// Validate & activate license
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.query == "validate-license") {
      key = request.key
      user_agent = encodeURIComponent(navigator.userAgent);
      timestamp = Math.floor(Date.now() / 1000);

      var url = `${server}/api/licenses/activate?key=${key}&user_agent=${user_agent}&timestamp=${timestamp}`;
      fetch(url).then(response => {
        return response.json()
      }).then(data => {
        var licenseObj = {
          key: key,
          user_agent: user_agent,
          timestamp: timestamp
        }
        if (data.validation.success == true) {
          chrome.storage.local.set({'cr_license': licenseObj});
        }
        sendResponse({data: data});
      })
      .catch(err => {
        sendResponse({data: "Sorry, but the server can't be reached at the moment. Either there's no internet connection or our servers are offline. Please try again later."});
      })
    } else if ( request.query == "start-chrome-reader" ) {
      open();
    }

    return true;
  }
);
