var recognition, isStopButtonClicked = false;
let interimTranscript = ''
let finalTranscript = ''

function concatTranscripts(...transcriptParts) {
  return transcriptParts.map(t => t.trim()).join(' ').trim()
}
function resetTranscripts (){
  interimTranscript = '';
  finalTranscript = '';
}

function updateTranscript(event) {
  interimTranscript = ''
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      finalTranscript = this.concatTranscripts(
        finalTranscript,
        event.results[i][0].transcript
      )
    } else {
      interimTranscript = this.concatTranscripts(
        interimTranscript,
        event.results[i][0].transcript
      )
    }
  }
  let activeElement = document.activeElement

  if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
    activeElement.value = concatTranscripts(finalTranscript, interimTranscript);
  } else if(document.activeElement.classList.contains('allowTextSelection') || document.activeElement.classList.contains('ql-editor')){
      activeElement.innerHTML = concatTranscripts(finalTranscript, interimTranscript);
  } else{
    chrome.runtime.sendMessage({command: "textBox", data: concatTranscripts(finalTranscript, interimTranscript)})
  }
}

function onCopy(event){
  navigator.clipboard.readText().then((text) => {
    chrome.runtime.sendMessage({command: "paste", data: text})
  })
}

const init = () => {

  document.addEventListener("copy", onCopy, true)

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = event => updateTranscript(event)

  recognition.onerror = event => {
    console.log(event)
    if (event.error === 'not-allowed') {
      const errorMessage = "AudioCapture permission has been blocked because of a Feature Policy applied to the current document. See https://goo.gl/EuHzyv for more details.";
      isStopButtonClicked = true;
      recognition.stop();
    }
  }

  recognition.onspeechstart = event => console.log(`I'm listening`)
  recognition.onend = function (event) {
    if (isStopButtonClicked) {
      resetTranscripts();
      stopTracking()
    } else {
      startTracking()
    }
  }
}

const startTracking = function(event){
  console.log('please start')
  console.log(recognition)
  recognition.start();}

const stopTracking = () => {
  recognition.stop();
}

init();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.data === "start") {
    isStopButtonClicked = false
    console.log('tracking started')
    startTracking();
  } else if (request.data === "stop") {
    isStopButtonClicked = true
    stopTracking();
  } else if (request.data === "clear"){
    resetTranscripts();
  }
});