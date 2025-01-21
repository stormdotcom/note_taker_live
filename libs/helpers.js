// helpers.js

import { uploadAudioToAPI } from "./api.js";

export function generateSessionId(callback) {
  chrome.storage.local.get(["user"], (result) => {
    const user = result.user || {}; // Ensure `user` is an object
    const userId = user.userId || "guest"; // Extract `userId`
    const firstName = user.firstName || "guest"; // Extract `firstName`
    const timestamp = Date.now(); // Current timestamp
    const sessionId = `${userId}-${firstName}-${timestamp}`; // Construct sessionId
    
    callback(sessionId); // Pass the sessionId to the callback
  });
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