Extension Architecture and Setup

A Chrome extension for recording user actions will consist of a manifest, a background service worker, a content script, and a popup UI. The manifest (V3) declares permissions and scripts. For example:

{

"manifest_version": 3,

"name": "Action Recorder",

"version": "1.0",

"description": "Record user actions and export as a Selenium script.",

"permissions": ["activeTab", "scripting", "downloads", "tabs"],

"host_permissions": ["<all_urls>"],

"background": {

    "service_worker": "background.js",

    "type": "module"

},

"action": {

    "default_popup": "popup.html",

    "default_icon": "icon.png"

},

"content_scripts": [

    {

      "matches": ["<all_urls>"],

      "js": ["contentScript.js"],

      "run_at": "document_idle"

    }

]

}

The background key specifies a service worker (background.js) as the extension’s main event handler . The permissions include "activeTab" and "scripting" (for injecting or messaging scripts) and "downloads" to save the .py file . We declare a simple popup (popup.html) with “Start”/“Stop” buttons. Content scripts run in the context of web pages and can read or modify the DOM ; they will capture user events. Messaging (chrome.runtime.sendMessage/onMessage) is used to coordinate between popup, background, and content scripts .

Popup UI (Activation/Deactivation)

The popup UI (e.g. popup.html) provides buttons to Start and Stop recording. Its script (popup.js) listens for clicks and sends messages to the background script:

// popup.js

document.getElementById('startBtn').addEventListener('click', () => {

chrome.runtime.sendMessage({ action: "startRecording" });

});

document.getElementById('stopBtn').addEventListener('click', () => {

chrome.runtime.sendMessage({ action: "stopRecording" });

});

When the user clicks Start, the popup sends {action: "startRecording"} to the background; Stop sends {action: "stopRecording"}. The background will respond by instructing the content script to attach or remove event listeners. The popup can also indicate status (e.g. change the icon or text) to show recording state.

Content Script: Capturing Events

The content script (contentScript.js) runs on each page (due to <all_urls> match). It remains idle until it receives a “start” message. When activated, it attaches listeners to capture user interactions within the page (same tab) . For example:

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

Each captured event is sent to the background via chrome.runtime.sendMessage. For example, a click event sends {event: "click", selector: "button#submit"}. The function computeUniqueSelector(element) should return a CSS selector or similar reference (e.g. an ID or XPath) that uniquely identifies the element. In practice, one might use element.id if available or build a selector path. These messages are simple JSON objects (strings, numbers, etc.), as required by the Chrome messaging API .

Background Service Worker

The background script (background.js) acts as the central coordinator. It maintains an array (or list) of recorded events and handles messages from both the popup and content scripts. For example:

let recording = false;

let events = [];

let startUrl = "";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

if (msg.action === "startRecording") {

    // Start recording

    events = [];

    recording = true;

    // Record current tab URL to use in script

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {

      startUrl = tabs[0].url || "";

      // Tell content script to start

      chrome.tabs.sendMessage(tabs[0].id, { action: "startRecording" });

    });

}

else if (msg.action === "stopRecording") {

    // Stop recording

    recording = false;

    // Tell content script to stop

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {

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

Here the background listens for {action: "startRecording"} and {action: "stopRecording"} from the popup, and for event messages (e.g. {event: "click", ...}) from the content script. It uses chrome.tabs.sendMessage to forward commands to the content script . When Stop is clicked, it calls generateScript(events, startUrl).

Event Logging Details

Captured events should include enough information to reproduce the action:

    •	Clicks: Store the element’s selector (e.g. CSS path or ID).

    •	Input (typing): Capture on 'input' events, recording the final text (target.value). Optionally call target.focus() before typing.

    •	Checkbox/Radio (change): On 'change' events, record checked state and value.

One approach is to find the most stable locator. For example, if an element has an id, use that (e.g. By.ID). Otherwise build a CSS selector or XPath. The content script might send both the selector string and any ID/name attributes. In code generation we’ll prefer By.ID or By.NAME; if those aren’t available, use By.CSS_SELECTOR with the provided selector.

Optionally, the content script can also record timestamps or other metadata if needed. For now, we store events simply as objects like {event: "click", selector: "...", value: "...", checked: ...}. Because content scripts run in an isolated world , they need to serialize any data to send it. The background accumulates these objects in order.

Generating the Selenium Python Script

When recording stops, the extension uses the stored events to build a Python script. The script typically looks like:

from selenium import webdriver

from selenium.webdriver.common.by import By

driver = webdriver.Chrome()

driver.get("<startUrl>")

# [Actions...]

element = driver.find_element(By.ID, "some_id")

element.click()

...

driver.quit()

In generateScript(events, startUrl), begin by adding imports and driver.get(startUrl). For each recorded event:

    •	Click:

element = driver.find_element(By.ID, "<id>") # or By.NAME, By.CSS_SELECTOR, etc.

element.click()

(Use By.ID if msg.selector came from an id; otherwise By.CSS_SELECTOR with the selector string.)

Example: driver.find_element(By.ID, "submit-button").click() .

    •	Input:

element = driver.find_element(By.NAME, "<name>")

element.clear()

element.send_keys("typed text")

(Use clear() to reset the field, then send_keys for the input text .)

Example: driver.find_element(By.CSS_SELECTOR, '[name="q"]').send_keys("search term") .

    •	Change (checkbox/radio):

element = driver.find_element(By.CSS_SELECTOR, "<selector>")

if not element.is_selected():

    element.click()

For checkboxes, you may add logic (like above) to ensure the final checked state matches. For simplicity, you can just call element.click() for each toggle.

When finding elements, you may prefer By.ID or By.NAME as they are more robust. For example, Selenium docs show driver.find_element(By.ID, "fruits") to locate an element by its ID . If no easy attribute exists, fallback to a CSS selector from computeUniqueSelector.

After processing all events, add a clean-up call driver.quit(). Each step becomes one or two lines in the Python script.

Example snippet combining these steps (with placeholders):

from selenium import webdriver

from selenium.webdriver.common.by import By

driver = webdriver.Chrome()

driver.get("https://example.com")

# 1. Click login button

driver.find_element(By.ID, "login").click()

# 2. Enter username

username = driver.find_element(By.NAME, "username")

username.clear()

username.send_keys("user123")

# 3. Toggle checkbox

checkbox = driver.find_element(By.CSS_SELECTOR, "#remember-me")

checkbox.click()

driver.quit()

Notice how find_element is used with different By strategies (By.ID, By.NAME, By.CSS_SELECTOR) depending on the element. These are standard Selenium methods .

Viewing and Downloading the Script

Once the Python code string is assembled, the extension should let the user view or save it. One approach is to use the Chrome Downloads API: create a Blob and call chrome.downloads.download(). For example:

const blob = new Blob([pythonCode], { type: 'text/x-python' });

const url = URL.createObjectURL(blob);

chrome.downloads.download({

url: url,

filename: 'recorded_script.py',

saveAs: true

});

This will prompt the user with a Save dialog (pre-filled with recorded_script.py) . The downloads.download function takes an object with url, filename, and saveAs: true to trigger the “Save As” dialog.

If desired, the extension could also open a new tab or a UI panel showing the generated code (for review). One could, for example, create an HTML page (code.html) inside the extension that loads pythonCode from chrome.storage.local or via a data URI. The background script can then use chrome.tabs.create({ url: chrome.runtime.getURL("code.html") }) and the page’s script reads and displays the code. Regardless of the method, the key is that the user can inspect the script and invoke a download.

Maintainable, Modular Structure

To keep the code maintainable:

    •	Separate responsibilities: The content script handles only event capturing and should be simple. The background handles state and code generation. The popup handles UI. This modularity prevents tangled logic.

    •	Event objects: Use a well-defined structure (e.g. {event: "click", selector: "...", value: "...", checked: true}) so adding new event types is easy.

    •	Code templates: Abstract code generation (e.g. a function generateClickCode(event)) so adding new Selenium commands (like navigation, screenshots) is easier in the future.

    •	Documentation and comments: As with all projects, include comments and possibly refer to official docs. For instance, refer to the [Chrome Extensions Content Scripts guide]  when handling DOM events, and the [Selenium Python docs]   for correct find_element usage.

By building in a modular way, it becomes straightforward to extend. For example, to add assertions later, one could insert lines like assert "Welcome" in driver.page_source between actions. Or to take screenshots, call driver.save_screenshot("screen.png") at desired points. The architecture here lays the groundwork for those enhancements.

References

    •	Chrome Extensions content scripts and messaging (e.g. chrome.runtime.sendMessage)  .

    •	Manifest V3 background/service worker configuration .

    •	Selenium Python documentation for element location and actions (find_element, send_keys)  .

    •	Chrome Extensions Downloads API for saving files .




