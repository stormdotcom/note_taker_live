let timer;
let seconds = 0;

function startTimer() {
  timer = setInterval(() => {
    seconds++;
    document.getElementById("timer").innerText = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startRecording() {
  // Change status text
  const statusText = document.getElementById("recording-status");
  statusText.innerText = "Recording...";
  statusText.style.color = "#28a745"; // Green color

  // Animate progress bar
  const progressBar = document.getElementById("progress");
  progressBar.style.width = "0%";
  progressBar.style.backgroundColor = "#28a745"; // Green color

  let progress = 0;
  let speed = 1000 * 60 * 60 / 100;

  const interval = setInterval(() => {
    if (progress >= 100) {
      clearInterval(interval);
    } else {
      progress += 1;
      progressBar.style.width = `${progress}%`;
    }
   
    
  }, speed); 

}


function stopRecording() {
  const statusText = document.getElementById("recording-status");
  statusText.innerText = "Not Recording";
  statusText.style.color = "#FF5733"; // Red color

  const progressBar = document.getElementById("progress");
  progressBar.classList.remove("wave"); // Remove wave effect
  progressBar.style.width = "0%"; // Reset progress bar
}