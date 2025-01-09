chrome.runtime.onInstalled.addListener(() => {
    console.log("Live Class NoteTaker Extension Installed");
  });
  
  async function sendToOpenAI(audioBlob) {
    const apiKey = "X-Cipher-Key 4 U2FsdGVkX18iX1taq3rTsEY8hH2/CUILcPr59RKxmN3hg2YW6o3UyKgK9FmMhnTSBnWpM9Yaa8ElzmZegykWjW/ScMFFaFGBKo9LP9scWKMFPhthlZpELWATtkoywlOVowmtM2NddmFbH6CPHPFjRQ==}";
    const url = "https://api.ajmalnasumudeen.in/api/v1/llm/audio"
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("model", "whisper-1");
  
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `X-Cipher-Key ${apiKey}`,
      },
      body: formData,
    });
    const data = await response.json();
    return data.text;
  }
  