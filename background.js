const clipboard = [];
let text = '';
let toggle = true;
chrome.browserAction.setBadgeText ( { text: " " } );
chrome.browserAction.setBadgeBackgroundColor({ color: "#EF3824" });
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  switch(message){
    case "start_recording":
        console.log('recoridng started')
        chrome.browserAction.setBadgeBackgroundColor({ color: "#0083CA" });
        toggle = !toggle
        break;
    case "stop_recording":
        chrome.browserAction.setBadgeBackgroundColor({ color: "#EF3824" });
        toggle = !toggle
        break;
    case "getClipboard":
        chrome.runtime.sendMessage({command: "clipboardAdd", data: clipboard})
        break;
    case "getToggle":
        chrome.runtime.sendMessage({command: "toggleButtons", data: toggle})
        break;
    case "getText":
        chrome.runtime.sendMessage({command: "textBox", data: text})
        break;
    case "clear":
        text = ''
        chrome.runtime.sendMessage({command: "textBox", data: text})
        break;
  }

  if(message.command === "paste"){
    if((clipboard.length + 1) > 4){
      clipboard.pop();
    }
    clipboard.unshift(message.data)
  } else if(message.command === "toggle"){
    toggle = !toggle
  } else if(message.command === "textBox"){
    text = message.data
    chrome.runtime.sendMessage({command: "textBox", data: message.data})

  }
  
})