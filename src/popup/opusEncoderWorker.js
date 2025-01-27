try {
  importScripts('../libs/OpusMediaRecorder.umd.js');
} catch (error) {
  console.error("Failed to load OpusMediaRecorder script:", error);
}

let apiKey = "";
let apiEndpoint = "";

self.onmessage = function (e) {
  try {
    const { command, data } = e.data || {};

    if (command === 'init') {
      apiKey = data.apiKey;
      apiEndpoint = data.apiEndpoint;
    }

    if (command === 'process') {
      const audioBlob = data;
      if (audioBlob && audioBlob.size >= 512 * 1024)  {
        sendToAPI(audioBlob);
      }
    }

    if (command === 'stop') {
      self.close();  // Stops the worker
    }

  } catch (error) {
    console.error("Error in worker message handler:", error);
  }
};

async function sendToAPI(audioBlob) {
  console.log("Uploading audio to API...");
  const formData = new FormData();
  formData.append("file", audioBlob);

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "audio/webm",
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
