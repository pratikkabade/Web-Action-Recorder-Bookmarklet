let recording = false;

function handleClick(e) {

    const target = e.target;

    const selector = computeUniqueSelector(target);

    chrome.runtime.sendMessage({

        event: "click",

        selector: selector

    });

}

// Similarly for inputs and changes...

function handleInput(e) {

    const target = e.target;

    const selector = computeUniqueSelector(target);

    chrome.runtime.sendMessage({

        event: "input",

        selector: selector,

        value: target.value

    });

}

function handleChange(e) {

    const target = e.target;

    const selector = computeUniqueSelector(target);

    chrome.runtime.sendMessage({

        event: "change",

        selector: selector,

        value: target.value,

        checked: target.checked

    });

}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.action === "startRecording") {

        if (!recording) {

            document.addEventListener('click', handleClick, true);

            document.addEventListener('input', handleInput, true);

            document.addEventListener('change', handleChange, true);

            recording = true;

        }

    } else if (msg.action === "stopRecording") {

        if (recording) {

            document.removeEventListener('click', handleClick, true);

            document.removeEventListener('input', handleInput, true);

            document.removeEventListener('change', handleChange, true);

            recording = false;

        }

    }

});



// --------
let recording = false;

let events = [];

let startUrl = "";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.action === "startRecording") {

        // Start recording

        events = [];

        recording = true;

        // Record current tab URL to use in script

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {

            startUrl = tabs[0].url || "";

            // Tell content script to start

            chrome.tabs.sendMessage(tabs[0].id, { action: "startRecording" });

        });

    }

    else if (msg.action === "stopRecording") {

        // Stop recording

        recording = false;

        // Tell content script to stop

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {

            chrome.tabs.sendMessage(tabs[0].id, { action: "stopRecording" });

        });

        // Generate and show code

        generateScript(events, startUrl);

    }

    else if (msg.event) {

        // User event from content script

        if (recording) {

            events.push(msg);

        }

    }

});
