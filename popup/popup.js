document.addEventListener("DOMContentLoaded", () => {
    let audioStream = null;
    let opusWorker = null;
    const local = true;
  
    const HOST = local ? "http://localhost:6060" : "https://api.ajmalnasumudeen.in";
    const API_ENDPOINT = `${HOST}/api/v1/llm/audio`;
    const API_KEY = "X-Cipher-Key 4 U2FsdGVkX18iX1taq3rTsEY8hH2/CUILcPr59RKxmN3hg2YW6o3UyKgK9FmMhnTSBnWpM9Yaa8ElzmZegykWjW/ScMFFaFGBKo9LP9scWKMFPhthlZpELWATtkoywlOVowmtM2NddmFbH6CPHPFjRQ==";
  
    document.getElementById("start").addEventListener("click", async () => {
      const source = document.querySelector('input[name="audio-source"]:checked').value;
  
      try {
        audioStream = source === "mic"
          ? await navigator.mediaDevices.getUserMedia({ audio: true })
          : await new Promise((resolve, reject) => {
              chrome.tabCapture.capture({ audio: true, video: false, audioMirroring: true }, (stream) => {
                stream ? resolve(stream) : reject(chrome.runtime.lastError.message);
              });
            });
  
        // Initialize Opus Encoder Worker
        opusWorker = new Worker('opusEncoderWorker.js');
        opusWorker.postMessage({
          command: 'init',
          data: {
            stream: audioStream,
            apiKey: API_KEY,
            apiEndpoint: API_ENDPOINT
          }
        });
  
        opusWorker.onmessage = (e) => {
          if (e.data.type === 'update') {
            const { transcript, summary } = e.data;
            document.getElementById("transcript").innerText = transcript || "Transcript not available.";
            document.getElementById("notes").innerText = summary || "Summary not available.";
          }
        };
  
        document.getElementById("start").disabled = true;
        document.getElementById("stop").disabled = false;
  
      } catch (error) {
        alert(`Error: ${error}`);
      }
    });
  
    document.getElementById("stop").addEventListener("click", () => {
      if (opusWorker) {
        opusWorker.postMessage({ command: 'stop' });
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
  
      document.getElementById("start").disabled = false;
      document.getElementById("stop").disabled = true;
    });
  });
  