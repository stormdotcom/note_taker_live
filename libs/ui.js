// ui.js

export function updateTimerDisplay(seconds) {
    document.getElementById("timer").innerText = formatTime(seconds);
  }
  
  export function updateRecordingStatus(isRecording) {
    const statusText = document.getElementById("recording-status");
    const progressBar = document.getElementById("progress");
  
    if (isRecording) {
      statusText.innerText = "Recording...";
      statusText.style.color = "#28a745";
      progressBar.style.backgroundColor = "#28a745";
      progressBar.style.width = "0%";
      document.getElementById("start").disabled = true;
      document.getElementById("stop").disabled = false;
    } else {
      statusText.innerText = "Not Recording";
      statusText.style.color = "#FF5733";
      progressBar.style.width = "0%";
    }
  }
  
  function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  

  export function stopRecording({ mediaRecorder, audioStream, sessionId, resetTimer = true }) {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
  
    // Reset related states
    if (resetTimer) stopTimer();
    sessionId = "";
    audioBuffer = []; // Clear the buffer
  
    // Update UI buttons
    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
  }