chrome.runtime.onInstalled.addListener(() => {
    console.log("QuickNote Extension Installed");

    
  });
  let sessionId ="";

  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "startRecording") {
      sessionId = message.sessionId;
      console.log("here recording started", sessionId)
      try {
        // audioStream = await captureTabAudio({ sessionId }); // Ensure you implement this function
        // isRecording = true;
        // chrome.storage.local.set({ recordingState: { isRecording, sessionId, seconds: 0 } });
        // startTimer();
        // sendResponse({ success: true });
      } catch (error) {
        console.error("Error starting recording:", error);
        sendResponse({ success: false, error: error.message });
      }
      return true; // Keep the message channel open for async response
    }
  
  })