javascript: (function () {
    var isRecording = false;
    var steps = [];
    var storageKey = 'selenium_steps';

    function loadTailwindCSS() {
        if (!document.getElementById('tailwind-cdn')) {
            var link = document.createElement('link');
            link.id = 'tailwind-cdn';
            link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }

    function saveSteps() {
        localStorage.setItem(storageKey, JSON.stringify(steps));
    }

    function loadSteps() {
        var data = localStorage.getItem(storageKey);
        if (data) {
            try {
                steps = JSON.parse(data);
            } catch (e) {
                steps = [];
            }
        }
    }

    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    function createButton() {
        var oldButton = document.getElementById('seleniumRecorderBtn');
        if (oldButton) oldButton.remove();
        var button = document.createElement('button');
        button.id = 'seleniumRecorderBtn';
        button.innerHTML = isRecording ? 'Stop Recording (' + steps.length + ' steps)' : 'Start Recording';
        button.className = 'fixed top-4 right-4 z-[9999999] px-4 py-2 text-white font-medium text-sm rounded-lg cursor-pointer mr-2 mb-2 focus:outline-none ' + (isRecording ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800');
        button.onclick = toggleRecording;
        document.body.appendChild(button);
    }

    function updateButtonText() {
        var button = document.getElementById('seleniumRecorderBtn');
        if (button) {
            button.innerHTML = isRecording ? 'Stop Recording (' + steps.length + ' steps)' : 'Start Recording';
            button.className = 'fixed top-4 right-4 z-[9999999] px-4 py-2 text-white font-medium text-sm rounded-lg cursor-pointer mr-2 mb-2 focus:outline-none ' + (isRecording ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800');
        }
    }

    function stopRecording() {
        isRecording = false;
        document.removeEventListener('click', handleClick, true);
        document.removeEventListener('change', handleInput, true);
        createButton();
        generateScript();
    }

    function copyToClipboard(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            var successful = document.execCommand('copy');
            if (successful) { } else {
                alert('Unable to copy to clipboard. Script is available for download.');
            }
        } catch (err) {
            alert('Unable to copy to clipboard. Script is available for download.');
        }
        document.body.removeChild(textarea);
    }

    function createDownloadLink(text) {
        var oldLink = document.getElementById('seleniumRecorderDownload');
        if (oldLink) oldLink.remove();
        var downloadLink = document.createElement('a');
        downloadLink.id = 'seleniumRecorderDownload';
        downloadLink.innerHTML = 'Download Script';
        downloadLink.className = 'fixed top-[60px] right-4 z-[9999999] px-4 py-2 text-white font-medium text-sm rounded-lg cursor-pointer mr-2 mb-2 focus:outline-none bg-blue-700 hover:bg-blue-800';
        var blob = new Blob([text], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'selenium_script.py';
        downloadLink.onclick = function () {
            setTimeout(function () {
                URL.revokeObjectURL(url);
            }, 100);
        };
        document.body.appendChild(downloadLink);
    }

    function getSelector(element) {
        if (element.id) {
            return { type: 'id', value: element.id };
        }
        if (element.name) {
            return { type: 'name', value: element.name };
        }
        return { type: 'xpath', value: getXPath(element) };
    }

    function getXPath(element) {
        if (!element) return '';
        if (element.id) return '//*[@id="' + element.id + '"]';
        if (element.tagName === 'BODY') return '/html/body';

        var path = '';
        var current = element;

        while (current && current.nodeType === 1) {
            var index = 1;
            var sibling = current.previousSibling;
            while (sibling) {
                if (sibling.nodeType === 1 && sibling.tagName === current.tagName) {
                    index++;
                }
                sibling = sibling.previousSibling;
            }
            var tagName = current.tagName.toLowerCase();
            var pathIndex = (index > 1) ? '[' + index + ']' : '';
            path = '/' + tagName + pathIndex + path;
            if (current.parentNode && current.parentNode.nodeType === 1) {
                current = current.parentNode;
            } else {
                break;
            }
        }
        return path;
    }

    function handleClick(event) {
        if (event.target.id === 'seleniumRecorderBtn' || event.target.id === 'seleniumRecorderDownload' || !isRecording) {
            return;
        }

        var selector = getSelector(event.target);

        if (event.target.tagName === 'SELECT') {
            steps.push({
                action: 'select_by_visible_text',
                selectorType: selector.type,
                selector: selector.value,
                value: event.target.options[event.target.selectedIndex].text
            });
        } else if (event.target.tagName === 'INPUT' && (event.target.type === 'radio' || event.target.type === 'checkbox')) {
            steps.push({
                action: 'click',
                selectorType: selector.type,
                selector: selector.value
            });
        } else {
            steps.push({
                action: 'click',
                selectorType: selector.type,
                selector: selector.value
            });
        }
        saveSteps();
        updateButtonText();
    }

    function handleInput(event) {
        if (!isRecording) return;
        var element = event.target;
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            var selector = getSelector(element);
            steps.push({
                action: 'input',
                selectorType: selector.type,
                selector: selector.value,
                value: element.value
            });
            saveSteps();
            updateButtonText();
        }
    }

    function startRecording() {
        isRecording = true;
        steps = [];
        saveSteps();
        document.addEventListener('click', handleClick, true);
        document.addEventListener('change', handleInput, true);
        createButton();
    }


    function generateScript() {
        if (steps.length === 0) {
            alert('No steps recorded!');
            return;
        }

        var url = window.location.href;
        var code = [
            '# SCRIPT_NAME: Web Form Automation',
            '# TEST_STEPS: Automates filling out a web form with various input types.',
            '',
            'from selenium import webdriver',
            'from selenium.webdriver.common.by import By',
            'from Script_Runner import navigate_to_url, find_and_perform_action, select_dropdown_by_visible_text',
            'import time',
            '',
            '# Initialize the WebDriver',
            'driver = webdriver.Chrome()',
            '',
            '# --- Test Steps ---',
            ''
        ];

        code.push('navigate_to_url(driver, "' + url + '")');

        for (var i = 0; i < steps.length; i++) {
            var step = steps[i];
            var byType, selector;
            switch (step.selectorType) {
                case 'id':
                    byType = 'By.ID';
                    selector = '"' + step.selector + '"';
                    break;
                case 'name':
                    byType = 'By.NAME';
                    selector = '"' + step.selector + '"';
                    break;
                default:
                    byType = 'By.XPATH';
                    selector = '"' + step.selector + '"';
            }

            var stepNumber = i + 1;

            if (step.action === 'click') {
                code.push(`find_and_perform_action(driver, ${byType}, ${selector}, action="click", step_num=${stepNumber})`);
            } else if (step.action === 'input') {
                var value = step.value.replace(/"/g, '\\"');
                code.push(`find_and_perform_action(driver, ${byType}, ${selector}, action="clear_and_send_keys", value="${value}", step_num=${stepNumber})`);
            } else if (step.action === 'select_by_visible_text') {
                var value = step.value.replace(/"/g, '\\"');
                code.push(`select_dropdown_by_visible_text(driver, ${byType}, ${selector}, "${value}", step_num=${stepNumber})`);
            }
        }
        code.push('');
        code.push('print("Script completed successfully!")');
        code.push('driver.quit() # Uncomment to close browser when done');
        var pythonCode = code.join('\n');
        copyToClipboard(pythonCode);
        createDownloadLink(pythonCode);
    }

    loadTailwindCSS();
    loadSteps();
    createButton();
})();