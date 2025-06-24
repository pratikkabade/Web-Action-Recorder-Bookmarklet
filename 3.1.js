javascript: (function () {
    var isRecording = false;
    var steps = [];
    var storageKey = 'selenium_steps';

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
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = '9999999';
        button.style.padding = '10px 20px';
        button.style.background = isRecording ? '#B91C1C' : '#15803D';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '0.5rem';
        button.style.cursor = 'pointer';
        button.style.marginRight = '0.5rem';
        button.style.marginBottom = '0.5rem';
        button.style.fontWeight = '500';
        button.style.fontSize = '0.875rem';
        button.style.outline = 'none';
        button.onclick = toggleRecording;
        document.body.appendChild(button);
    }

    function updateButtonText() {
        var button = document.getElementById('seleniumRecorderBtn');
        if (button) {
            button.innerHTML = isRecording ? 'Stop Recording (' + steps.length + ' steps)' : 'Start Recording';
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
            if (successful) {
                alert('Selenium script copied to clipboard!');
            } else {
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
        downloadLink.innerHTML = 'Download Selenium Script';
        downloadLink.style.position = 'fixed';
        downloadLink.style.top = '60px';
        downloadLink.style.right = '10px';
        downloadLink.style.zIndex = '9999999';
        downloadLink.style.padding = '10px 20px';
        downloadLink.style.background = '#1D4ED8';
        downloadLink.style.color = 'white';
        downloadLink.style.border = 'none';
        downloadLink.style.borderRadius = '0.5rem';
        downloadLink.style.cursor = 'pointer';
        downloadLink.style.marginRight = '0.5rem';
        downloadLink.style.marginBottom = '0.5rem';
        downloadLink.style.fontWeight = '500';
        downloadLink.style.fontSize = '0.875rem';
        downloadLink.style.outline = 'none';
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
            var pathIndex = (index > 1) ? '[' + index + ']' : ''; path = '/' + tagName + pathIndex + path;
            if (current.parentNode && current.parentNode.nodeType === 1) {
                current = current.parentNode;
            } else { break; }
        } return path;
    }

    function handleClick(event) {
        if (event.target.id === 'seleniumRecorderBtn' || event.target.id === 'seleniumRecorderDownload' || !isRecording) {
            return;
        }

        var selector = getSelector(event.target);

        steps.push({
            action: 'click', selectorType: selector.type, selector: selector.value
        });
        saveSteps();
        updateButtonText();
    }

    function handleInput(event) {
        if (!isRecording) return;
        var element = event.target;
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            var selector = getSelector(element);
            steps.push({
                action: 'input', selectorType: selector.type, selector: selector.value, value: element.value
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
        alert('Classic Tag recording started!');
    }


    function generateScript() {
        if (steps.length === 0) {
            alert('No steps recorded!');
            return;
        }

        var url = window.location.href;
        var code = [
            '# SCRIPT_NAME',
            '# TEST_STEPS',
            '',
            '',
            'from selenium import webdriver',
            'from selenium.webdriver.common.by import By',
            'from selenium.webdriver.common.keys import Keys',
            'from selenium.webdriver.support.ui import WebDriverWait',
            'from selenium.webdriver.support import expected_conditions as EC',
            'import time',
            '',
            '# Initialize the WebDriver',
            'driver = webdriver.Chrome()',
            '',
            '# Navigate to the page',
            'driver.get("' + url + '")',
            'time.sleep(2)  # Wait for page to load',
            '',
        ];
        for (var i = 0; i < steps.length; i++) {
            var step = steps[i];
            var byType, selector;
            switch (step.selectorType) {
                case 'id': byType = 'By.ID';
                    selector = '"' + step.selector + '"';
                    break;
                case 'name': byType = 'By.NAME';
                    selector = '"' + step.selector + '"';
                    break;
                default: byType = 'By.XPATH';
                    selector = '"' + step.selector + '"';
            }
            code.push('# Step ' + (i + 1));
            code.push('try:');
            code.push('    element = WebDriverWait(driver, 10).until(');
            code.push('        EC.element_to_be_clickable((' + byType + ', ' + selector + '))');
            code.push('    )');
            if (step.action === 'click') {
                code.push('    element.click()');
                code.push('except Exception as e:');
                code.push('    print(f"Error at step {' + (i + 1) + '}: {e}")');
            } else if (step.action === 'input') {
                var value = step.value.replace(/"/g, '\\"');
                code.push('    element.clear()');
                code.push('    element.send_keys("' + value + '")');
                code.push('except Exception as e:');
                code.push('    print(f"Error at step {' + (i + 1) + '}: {e}")');
            }
            code.push('time.sleep(1)  # Pause between actions\n');
        }
        code.push('print("Script completed successfully!")');
        code.push('# driver.quit()  # Uncomment to close browser when done');
        var pythonCode = code.join('\n');
        copyToClipboard(pythonCode);
        createDownloadLink(pythonCode);
    }

    loadSteps();
    createButton();
})();
