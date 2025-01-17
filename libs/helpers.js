let timer;
let seconds = 0;

function startTimer() {
  timer = setInterval(() => {
    seconds++;
    document.getElementById("timer").innerText = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startRecording() {
  // Change status text
  const statusText = document.getElementById("recording-status");
  statusText.innerText = "Recording...";
  statusText.style.color = "#28a745"; // Green color

  // Animate progress bar
  const progressBar = document.getElementById("progress");
  progressBar.style.width = "0%";
  progressBar.style.backgroundColor = "#28a745"; // Green color

  let progress = 0;
  let speed = 1000 * 60 * 60 / 100;

  const interval = setInterval(() => {
    if (progress >= 100) {
      clearInterval(interval);
    } else {
      progress += 1;
      progressBar.style.width = `${progress}%`;
    }
   
    
  }, speed); 
      document.getElementById("start").disabled = true;
      document.getElementById("stop").disabled = false;
}


function stopRecording() {
  const statusText = document.getElementById("recording-status");
  statusText.innerText = "Not Recording";
  statusText.style.color = "#FF5733"; // Red color

  const progressBar = document.getElementById("progress");
  progressBar.classList.remove("wave"); // Remove wave effect
  progressBar.style.width = "0%"; // Reset progress bar
}


const generateSessionId = async () => {
  try {

    const userId = await new Promise((resolve) => {
      chrome.storage.local.get(["userId"], (result) => {
        resolve(result.userId || "guest");
      });
    });

    // Get current timestamp
    const timestamp = Date.now();

    // Generate a simple machine code using the user agent (browser fingerprint)
    const machineCode = btoa(navigator.userAgent).substring(0, 8);

    // Combine all parts to form the session ID
    const sessionId = `${userId}-${timestamp}-${machineCode}`;

    console.log("Generated Session ID:", sessionId);

    return sessionId;
  } catch (error) {
    console.error("Failed to generate session ID:", error);
    return null;
  }
};

async function uploadAudioToAPI(audioBlob, sessionId) {
  const API_ENDPOINT = "http://localhost:8000/upload/audio";
  const formData = new FormData();
  formData.append('file', new File([audioBlob], "audio_chunk.webm", { type: 'audio/webm' }));
  formData.append('sessionId', sessionId);
  try {
      const response = await fetch(API_ENDPOINT, {
          method: "POST",
          body: formData,
      });

      const result = await response.json();
      console.log("Audio uploaded:", result);
  } catch (error) {
      console.error("Upload failed:", error);
  }
}

function captureTabAudio(sessionId) {
  chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      if (chrome.runtime.lastError) {
          console.error("Error capturing tab audio:", chrome.runtime.lastError.message);
          return;
      }

      // Preserve system audio playback
      const context = new AudioContext();
      const newStream = context.createMediaStreamSource(stream);
      newStream.connect(context.destination);

      // Set up MediaRecorder
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      let audioChunks = [];

      recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
              audioChunks.push(e.data);
          }
      };

      recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          uploadAudioToAPI(audioBlob, sessionId);
          audioChunks = [];
      };

      recorder.start();

      // Stop and upload every 2 minutes (120000 ms)
      setInterval(() => {
          if (recorder.state === "recording") {
              recorder.stop();
              recorder.start();
          }
      }, 120000); // 2 minutes
  });
}