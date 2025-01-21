import { initiateSession } from "../libs/api.js";
import { captureTabAudio, generateSessionId } from "../libs/helpers.js";
import { stopRecording, updateRecordingStatus, updateTimerDisplay } from "../libs/ui.js";
import { getBrowserInfo, getCurrentTabInfo } from "../libs/utils.js";


document.addEventListener("DOMContentLoaded", () => {
  let audioStream = null;
  let mediaRecorder = null;
  let seconds = 0;
  const local = true;
  const HOST = local ? "http://localhost:8000" : "https://llm-service-api-435l.onrender.com";
  const API_ENDPOINT = `${HOST}/upload/audio`;
  let sessionId=""
  document.getElementById("start").addEventListener("click", async () => {
     sessionId = await generateSessionId()
    const source = document.querySelector('input[name="audio-source"]:checked')?.value;
    document.getElementById("start").disabled = true;

    updateRecordingStatus(true);

    if (!source) {
      alert("Please select an audio source.");
      return;
    }
    const timerInterval = setInterval(() => {
      seconds++;
      updateTimerDisplay(seconds);
    }, 1000);

    try {
      getCurrentTabInfo((tabInfo) => {
        const browserInfo = getBrowserInfo();
      initiateSession({ sessionId, tabInfo, browserInfo })
      })
      captureTabAudio({ sessionId})

      

    } catch (error) {
      alert(`Error: ${error}`);
      console.error("Error capturing audio:", error);
    }
  });

  document.getElementById("stop").addEventListener("click", () => {
    stopRecording({ mediaRecorder, audioStream, sessionId });
  });
});

