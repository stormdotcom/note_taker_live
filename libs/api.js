// api.js
const accessToken = localStorage.getItem("accessToken");
const headers =   {
        Authorization: `Bearer ${accessToken}`,
      };
export async function uploadAudioToAPI({ audioBlob, sessionId, timeStamp }) {
    const API_ENDPOINT = "http://localhost:8000/upload/audio";
    const formData = new FormData();
    formData.append("file", new File([audioBlob], "audio_chunk.webm", { type: "audio/webm" }));
    formData.append("sessionId", sessionId);
    formData.append("timeStamp", timeStamp);
  
    try {
      const response = await fetch(API_ENDPOINT, { method: "POST",headers, body: formData });
      const result = await response.json();
      console.log("Audio uploaded:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }
  
export async function uploadSummaryToAPI(text, sessionId) {
    const API_ENDPOINT = "http://localhost:8000/upload/summary";
  
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ summaryText: text, sessionId }),
      });
  
      const result = await response.json();
      console.log("Summary uploaded:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }
  
export async function initiateSession({ sessionId, tabInfo, browserInfo }) {
    const API_ENDPOINT = "http://localhost:8000/audio/session";
  
    try {
   await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ sessionId, tabInfo, browserInfo, timeStamp: Date.now().toString() }),
      });
  
    } catch (error) {
      console.error("Session initiation failed:", error);
    }
  }
  