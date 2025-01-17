
document.addEventListener("DOMContentLoaded", () => {
    let audioStream = null;
    let opusWorker = null;
    let audioBuffer = [];  // Buffer to store audio chunks
    const BUFFER_LIMIT = 512  * 1024;  // 512 KB
    console.log("here")
    const local = true;
    const HOST = local ? "http://localhost:8000" : "https://llm-service-api-435l.onrender.com";
    const API_ENDPOINT = `${HOST}/upload/audio`;
    const API_KEY = "X-Cipher-Key 4 U2FsdGVkX18iX1taq3rTsEY8hH2/CUILcPr59RKxmN3hg2YW6o3UyKgK9FmMhnTSBnWpM9Yaa8ElzmZegykWjW/ScMFFaFGBKo9LP9scWKMFPhthlZpELWATtkoywlOVowmtM2NddmFbH6CPHPFjRQ==";
  
    document.getElementById("start").addEventListener("click", async () => {
      const source = document.querySelector('input[name="audio-source"]:checked')?.value;
  
      if (!source) {
        alert("Please select an audio source.");
        return;
      }
  
      try {
        console.log(source ,"source")
        audioStream = source === "mic"
        ? await navigator.mediaDevices.getUserMedia({ audio: true })
        : await new Promise((resolve, reject) => {
            chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
              } else {
                resolve(stream);
  
                // ✅ Preserve system audio
                const audioContext = new AudioContext();
                const sourceNode = audioContext.createMediaStreamSource(stream);
                sourceNode.connect(audioContext.destination); 
              }
            });
          });
  
        // Initialize Opus Encoder Worker
        opusWorker = new Worker('opusEncoderWorker.js');
        opusWorker.postMessage({
          command: 'init',
          data: {
            apiKey: API_KEY,
            apiEndpoint: API_ENDPOINT
          }
        });
  
        const mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
  
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioBuffer.push(event.data);
  
            // Check if the buffer size limit is reached
            const totalSize = audioBuffer.reduce((acc, chunk) => acc + chunk.size, 0);
  
            if (totalSize >= BUFFER_LIMIT) {
              const combinedBlob = new Blob(audioBuffer, { type: 'audio/webm' });
              opusWorker.postMessage({
                command: 'process',
                data: combinedBlob
              });
  
              audioBuffer = [];  
            }
          }
        };
  
        mediaRecorder.start(500);  
  
        opusWorker.onmessage = (e) => {
          if (e.data.type === 'update') {
            const { summary } = e.data;
            document.getElementById("notes").innerText = summary || "Summary not available.";
          }
        };
  
        document.getElementById("start").disabled = true;
        document.getElementById("stop").disabled = false;
  
      } catch (error) {
        alert(`Error: ${error}`);
        console.error("Error capturing audio:", error);
      }
    });
  
    document.getElementById("stop").addEventListener("click", () => {
      if (opusWorker) {
        opusWorker.postMessage({ command: 'stop' });
        opusWorker.terminate();
        opusWorker = null;
      }
  
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
      }
  
      audioBuffer = [];  // Clear any remaining audio data
  
      document.getElementById("start").disabled = false;
      document.getElementById("stop").disabled = true;
    });
  });
  