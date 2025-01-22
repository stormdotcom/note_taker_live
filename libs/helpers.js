// helpers.js

import { uploadAudioToAPI } from "./api.js";

export function generateSessionId() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["user"], (result) => {
        const user = result.user || {}; // Ensure `user` exists
        const userId = user.userId || "guest"; // Extract `userId` or use "guest"
        const uuid = generateUUID(); // Generate the UUID
        resolve(`${userId}-${uuid}`); // Resolve the generated session ID
      });
    });
  }
function generateUUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }
export function captureTabAudio({sessionId}) {
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
          uploadAudioToAPI({audioBlob, sessionId, timeStamp: Date.now().toString()});
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