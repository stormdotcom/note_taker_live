// helpers.js

import { BUFFER_LIMIT } from "../config/constant.js";
import { uploadAudioToAPI } from "./api.js";

export function generateSessionId() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["user"], (result) => {
        const user = result.user || {};
        const userId = user.userId || "guest";
        const uuid = generateUUID();
        resolve(`${userId}-${uuid}`);
      });
    });
  }
function generateUUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  };

  export function captureTabAudio({ sessionId }) {
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
        if (chrome.runtime.lastError) {
            console.error("Error capturing tab audio:", chrome.runtime.lastError.message);
            return;
        }

        const context = new AudioContext();
        const newStream = context.createMediaStreamSource(stream);
        newStream.connect(context.destination);

        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        let audioChunks = [];
        let currentSize = 0; 

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunks.push(e.data);
                currentSize += e.data.size;

                // If the size exceeds ~1 MB (1,000,000 bytes), stop and upload
                if (currentSize >= BUFFER_LIMIT) {
                    recorder.stop();
                }
            }
        };

        recorder.onstop = () => {
            if (audioChunks.length > 0) {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                uploadAudioToAPI({ audioBlob, sessionId, timeStamp: Date.now().toString() });
                audioChunks = [];
                currentSize = 0;
                recorder.start();
            }
        };

        recorder.start();
    });
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