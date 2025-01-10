importScripts('https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OpusMediaRecorder.umd.js');

let encoder;
let apiKey = "";
let apiEndpoint = "";

self.onmessage = function (e) {
  const { command, data } = e.data;

  if (command === 'init') {
    apiKey = data.apiKey;
    apiEndpoint = data.apiEndpoint;

    encoder = new OpusMediaRecorder(data.stream, { mimeType: 'audio/ogg; codecs=opus' });

    encoder.addEventListener('dataavailable', async (event) => {
      const audioBlob = event.data;
      if (audioBlob.size >= 16 * 1024) {  // 16 KB chunk size
        await sendToAPI(audioBlob);
      }
    });

    encoder.start(1000); // Capture every second
  }

  if (command === 'stop') {
    encoder.stop();
  }
};

async function sendToAPI(audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob);

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: apiKey,
      },
      body: formData
    });

    const result = await response.json();
    self.postMessage({ type: 'update', data: result.data });
  } catch (error) {
    console.error("Error uploading audio:", error);
  }
}
