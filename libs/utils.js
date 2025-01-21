export function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
  
    if (userAgent.includes("Chrome")) {
      browserName = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browserName = "Safari";
    } else if (userAgent.includes("Edge")) {
      browserName = "Edge";
    }
  

    return { browserName, userAgent };
  }

 export  function getCurrentTabInfo(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error("No active tab found.");
        return;
      }
  
      const activeTab = tabs[0];
      const tabInfo = {
        title: activeTab.title,
        url: activeTab.url,
        favIconUrl: activeTab.favIconUrl
      };
  

      if (callback) callback(tabInfo);
    });
  }
  

  