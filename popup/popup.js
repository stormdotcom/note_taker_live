document.addEventListener("DOMContentLoaded", () => {
  let audioStream = null;
  let mediaRecorder = null;
  let audioBuffer = [];
  const BUFFER_LIMIT = 2000 * 1024;  // 2mb

  const local = true;
  const HOST = local ? "http://localhost:8000" : "https://llm-service-api-435l.onrender.com";
  const API_ENDPOINT = `${HOST}/upload/audio`;

  document.getElementById("start").addEventListener("click", async () => {
    const source = document.querySelector('input[name="audio-source"]:checked')?.value;

    if (!source) {
      alert("Please select an audio source.");
      return;
    }

    try {
      audioStream = source === "mic"
        ? await navigator.mediaDevices.getUserMedia({ audio: true })
        : await new Promise((resolve, reject) => {
            chrome.tabCapture.capture({
              audio: true,
              video: false
            }, (stream) => {
              if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
              }
              stream ? resolve(stream) : reject("Failed to capture tab audio.");
            });
          });

      // Initialize MediaRecorder with correct MIME type
      mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioBuffer.push(event.data);

          // Check if the buffer size limit is reached
          const totalSize = audioBuffer.reduce((acc, chunk) => acc + chunk.size, 0);

          if (totalSize >= BUFFER_LIMIT) {
            const combinedBlob = new Blob(audioBuffer, { type: 'audio/webm' });

            // Upload to backend
            sendAudioToAPI(combinedBlob);
            audioBuffer = [];  // Clear buffer after sending
          }
        }
      };

      mediaRecorder.start(1000);  // Record every second

      document.getElementById("start").disabled = true;
      document.getElementById("stop").disabled = false;

    } catch (error) {
      alert(`Error: ${error}`);
      console.error("Error capturing audio:", error);
    }
  });

  document.getElementById("stop").addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      audioStream = null;
    }

    audioBuffer = [];  // Clear buffer

    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
  });

  // Upload audio Blob to backend as a properly formatted file
  async function sendAudioToAPI(audioBlob) {
    const formData = new FormData();
    formData.append('file', new File([audioBlob],"audio.webm", { type: 'audio/webm' }));

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: "Bearer YOUR"
        },
        body: formData
      });

      const result = await response.json();
      console.log("Server response:", result);

      if (result.summary) {
        document.getElementById("notes").innerText = result.summary;
      } else {
        document.getElementById("notes").innerText = "Summary not available.";
      }

    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  }

  // Optional: Download the recorded audio locally for testing
  function downloadAudioLocally(audioBlob) {
    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sample-audio-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
});
