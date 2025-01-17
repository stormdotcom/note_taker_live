document.addEventListener("DOMContentLoaded", () => {
  let audioStream = null;
  let mediaRecorder = null;
  let audioBuffer = [];
  const BUFFER_LIMIT = 800 * 1024;  // 1mb

  const local = true;
  const HOST = local ? "http://localhost:8000" : "https://llm-service-api-435l.onrender.com";
  const API_ENDPOINT = `${HOST}/upload/audio`;
  let sessionId=""
  document.getElementById("start").addEventListener("click", async () => {
     sessionId = await generateSessionId()
    const source = document.querySelector('input[name="audio-source"]:checked')?.value;
    startTimer();
    startRecording()
    if (!source) {
      alert("Please select an audio source.");
      return;
    }

    try {
      captureTabAudio(sessionId)

      

    } catch (error) {
      alert(`Error: ${error}`);
      console.error("Error capturing audio:", error);
    }
  });

  document.getElementById("stop").addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      stopTimer();
         sessionId=""
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
    formData.append('sessionId', sessionId);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFqbWFsIiwidXNlcl9pZCI6MSwiaWF0IjoxNzk2MjM5MDIyLCJ0eXBlIjoxfQ.sxQw-vTzENNO6xZoZp-0sD9nehwunBik49WujhXtvFA"
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

