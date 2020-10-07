const startButton = document.getElementsByClassName('activation-button')[0];
const stopButton = document.getElementsByClassName('deactivation-button')[0];
const clearButton = document.getElementsByClassName('clear-button')[0];
const errorMessage = document.getElementsByClassName('error-message')[0];
const copyTextBox = document.getElementsByClassName('copy-button')[0];

function clipboardAction (event){
  navigator.clipboard.writeText(event.target.innerText)
}

window.onload = ()=>{
  console.log('onLoad')
  chrome.runtime.sendMessage('getClipboard')
  chrome.runtime.sendMessage('getToggle')
  chrome.runtime.sendMessage('getText')
}

startButton.addEventListener('click', function () {
  console.log('Starting')
  chrome.runtime.sendMessage("start_recording")
  chrome.runtime.sendMessage("getToggle")
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log('inside tabs')
    chrome.tabs.sendMessage(tabs[0].id, {data: "start"}, function(response) {});
  });
});

stopButton.addEventListener('click', function () {
  chrome.runtime.sendMessage("stop_recording")
  chrome.runtime.sendMessage("getToggle")
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {data: "stop"}, function(response) {});
  });
});

clearButton.addEventListener('click', function () {
  chrome.runtime.sendMessage("clear")
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {data: "clear"}, function(response) {});
  });
});

copyTextBox.addEventListener('click', function () {
  navigator.clipboard.writeText(document.getElementById('VoiceTextBox').value)
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.error){
    errorMessage.textContent = request.error
    chrome.runtime.sendMessage("stop_recording")
  }

  if(request.command === 'clipboardAdd'){
    request.data.forEach((text, i) =>{
      let tempDiv = document.createElement("div")
      tempDiv.classList.add("clip")
      tempDiv.id = `temp${i}`
      tempDiv.addEventListener("click", clipboardAction);
      document.getElementById('clips').appendChild(tempDiv)
      document.getElementById(`temp${i}`).innerHTML = text;
    })
  }else if (request.command === 'toggleButtons'){
    if(request.data){
      document.getElementById("start").disabled = false
      document.getElementById("stop").disabled = true
    } else{
      document.getElementById("start").disabled = true
      document.getElementById("stop").disabled = false
    }
  }else if (request.command === 'textBox'){
    document.getElementById('VoiceTextBox').focus()
    document.getElementById('VoiceTextBox').value = request.data;
  }

});

