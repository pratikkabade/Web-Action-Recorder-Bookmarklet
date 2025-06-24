// popup.js
document.getElementById('startBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "startRecording" });
});
document.getElementById('stopBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "stopRecording" });
});
