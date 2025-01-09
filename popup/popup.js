let mediaRecorder;
let audioChunks = [];
const apiKey = "4 U2FsdGVkX18iX1taq3rTsEY8hH2/CUILcPr59RKxmN3hg2YW6o3UyKgK9FmMhnTSBnWpM9Yaa8ElzmZegykWjW/ScMFFaFGBKo9LP9scWKMFPhthlZpELWATtkoywlOVowmtM2NddmFbH6CPHPFjRQ==";
const url = "https://api.ajmalnasumudeen.in/api/v1/llm/audio";

document.getElementById("start-recording").addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

    // Convert the audio Blob to a Base64 string
    const audioBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(audioBlob);
    });

    // Send the audio to the server
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `X-Cipher-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioBlob: audioBase64,
        }),
      });

      const { transcript, summary } = await response.json();

      // Update the UI with the results
      document.getElementById("transcript").innerText = transcript || "Transcript not available.";
      document.getElementById("notes").innerText = summary || "Summary not available.";
    } catch (error) {
      console.error("Error sending audio:", error);
      document.getElementById("transcript").innerText = "An error occurred.";
      document.getElementById("notes").innerText = "An error occurred.";
    }
  };

  mediaRecorder.start();
  document.getElementById("start-recording").disabled = true;
  document.getElementById("stop-recording").disabled = false;
});

document.getElementById("stop-recording").addEventListener("click", () => {
  mediaRecorder.stop();
  document.getElementById("start-recording").disabled = false;
  document.getElementById("stop-recording").disabled = true;
});
