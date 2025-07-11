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

    function getCoordinates(event) {
        const x = event.clientX;
        const y = event.clientY;
        const absX = x + window.pageXOffset;
        const absY = y + window.pageYOffset;
        return { x: absX, y: absY };
    }

    function handleClick(event) {
        if (event.target.id === 'seleniumRecorderBtn' || event.target.id === 'seleniumRecorderDownload' || !isRecording) {
            return;
        }

        var coords = getCoordinates(event);

        var elem = event.target;
        var selector = getSelector(elem);

        steps.push({
            action: 'click',
            x: coords.x,
            y: coords.y,
            selector: selector
        });
        saveSteps();
        updateButtonText();
    }

    function getSelector(element) {
        if (element.id) {
            return { type: 'id', value: element.id };
        }

        if (element.className && typeof element.className === 'string') {
            var classes = element.className.split(' ').filter(function (c) { return c.length > 0; });
            if (classes.length > 0) {
                return { type: 'class', value: classes[0] };
            }
        }

        var tag = element.tagName.toLowerCase();
        return { type: 'tag', value: tag };
    }

    function handleInput(event) {
        if (!isRecording) return;
        var element = event.target;
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            var rect = element.getBoundingClientRect();
            var x = rect.left + rect.width / 2 + window.pageXOffset;
            var y = rect.top + rect.height / 2 + window.pageYOffset;

            var selector = getSelector(element);

            steps.push({
                action: 'input',
                x: x,
                y: y,
                value: element.value,
                selector: selector
            });
            saveSteps();
            updateButtonText();
        }
    }


    function startRecording() {
        isRecording = true;
        steps = [];
        var screenWidth = window.screen.width;
        var screenHeight = window.screen.height;
        var browserWidth = window.innerWidth;
        var browserHeight = window.innerHeight;
        steps.push({
            action: 'setup',
            screenWidth: screenWidth,
            screenHeight: screenHeight,
            browserWidth: browserWidth,
            browserHeight: browserHeight
        });
        saveSteps();
        document.addEventListener('click', handleClick, true);
        document.addEventListener('change', handleInput, true);
        createButton();
        alert('Coordinate recording started! Screen: ' + screenWidth + 'x' + screenHeight + ', Browser: ' + browserWidth + 'x' + browserHeight);
    }

    function generateScript() {
        if (steps.length === 0) {
            alert('No steps recorded!');
            return;
        }

        var screenWidth = 1920;
        var screenHeight = 1080;
        var browserWidth = 1366;
        var browserHeight = 768;

        for (var i = 0; i < steps.length; i++) {
            if (steps[i].action === 'setup') {
                screenWidth = steps[i].screenWidth;
                screenHeight = steps[i].screenHeight;
                browserWidth = steps[i].browserWidth;
                browserHeight = steps[i].browserHeight;
                break;
            }
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
            'from selenium.webdriver.common.action_chains import ActionChains',
            'import time\n',
            'class ScreenshotTaker:',
            '    def __init__(self, driver):',
            '        self.driver = driver',
            '        self.screenshot_count = 0',
            '',
            '    def save_screenshot(self, _sub_step=""):',
            '        self.screenshot_count += 1',
            '        filename = f"step_{self.screenshot_count}"',
            '        if _sub_step:',
            '            filename += f"_{_sub_step}"',
            '        filename += ".png"',
            '        self.driver.save_screenshot(filename)',
            '        print(f"Screenshot saved: {filename}")\n',
            '# Initialize the WebDriver',
            'options = webdriver.ChromeOptions()',
            '# # Set window size to match recording dimensions',
            '# options.add_argument(f"--window-size={' + browserWidth + ',' + browserHeight + '}")',
            '# # Set screen size (for headless mode if used)',
            '# options.add_argument(f"--start-maximized")',
            'driver = webdriver.Chrome(options=options)',
            'screenshot_taker = ScreenshotTaker(driver)',
            '',
            '# Explicitly set window size again to ensure accuracy',
            'driver.set_window_size(' + screenWidth + ', ' + screenHeight + ')',
            'print(f"Running on screen resolution: ' + screenWidth + 'x' + screenHeight + '")',
            'print(f"Browser window set to: ' + browserWidth + 'x' + browserHeight + '")',
            '',
            '# Navigate to the page',
            'driver.get("' + url + '")',
            'time.sleep(2)  # Wait for page to load\n',
            '# Define a function to find elements with fallbacks',
            'def find_element_with_fallback(driver, step):',
            '    """Try multiple strategies to find an element"""',
            '    try:',
            '        # First try by selector if available',
            '        if "selector" in step:',
            '            if step["selector"]["type"] == "id":',
            '                element = driver.find_element(By.ID, step["selector"]["value"])',
            '                return element',
            '            elif step["selector"]["type"] == "class":',
            '                element = driver.find_element(By.CLASS_NAME, step["selector"]["value"])',
            '                return element',
            '            elif step["selector"]["type"] == "tag":',
            '                element = driver.find_element(By.TAG_NAME, step["selector"]["value"])',
            '                return element',
            '    except Exception as e:',
            '        print(f"Could not find element by selector: {e}")',
            '        ',
            '    # Fallback to absolute position',
            '    return None\n',
            '',
            '# Reset mouse position to (0,0)',
            'ActionChains(driver).move_to_element(driver.find_element(By.TAG_NAME, "body")).perform()\n'
        ];

        for (var i = 0; i < steps.length; i++) {
            var step = steps[i];
            if (step.action === 'setup') continue;

            code.push('# Step ' + (i + 1));

            if (step.action === 'click') {
                code.push('try:');
                code.push('    # Try to find element by selector first');
                code.push('    element = find_element_with_fallback(driver, ' + JSON.stringify(step) + ')');
                code.push('    if element:');
                code.push('        # Scroll element into view');
                code.push('        driver.execute_script("arguments[0].scrollIntoView({block: \'center\'});", element)');
                code.push('        time.sleep(0.5)  # Wait for scroll');
                code.push('        # Click the element');
                code.push('        ActionChains(driver).move_to_element(element).click().perform()');
                code.push('    else:');
                code.push('        # Fallback to coordinates');
                code.push('        # First scroll to the approximate area');
                code.push('        driver.execute_script(f"window.scrollTo({step.x-100}, {step.y-100})")');
                code.push('        time.sleep(0.5)  # Wait for scroll');
                code.push('        # Calculate coordinates relative to viewport after scrolling');
                code.push('        viewport_x = ' + step.x + ' - window.pageXOffset');
                code.push('        viewport_y = ' + step.y + ' - window.pageYOffset');
                code.push('        # Move to position and click');
                code.push('        body = driver.find_element(By.TAG_NAME, "body")');
                code.push('        ActionChains(driver).move_to_element(body).move_by_offset(viewport_x, viewport_y).click().perform()');
                code.push('    time.sleep(0.5)');
                code.push('    # Move mouse back to a safe position');
                code.push('    body = driver.find_element(By.TAG_NAME, "body")');
                code.push('    ActionChains(driver).move_to_element(body).perform()');
                code.push('except Exception as e:');
                code.push('    print(f"Error clicking at step {' + (i + 1) + '}: {e}")');
                code.push('    # Try to reset the cursor position');
                code.push('    try:');
                code.push('        body = driver.find_element(By.TAG_NAME, "body")');
                code.push('        ActionChains(driver).move_to_element(body).perform()');
                code.push('    except:');
                code.push('        pass');
                code.push('time.sleep(1)  # Pause between actions\n');
            }
            else if (step.action === 'input') {
                var value = step.value.replace(/"/g, '\\"');
                code.push('try:');
                code.push('    # Try to find element by selector first');
                code.push('    element = find_element_with_fallback(driver, ' + JSON.stringify(step) + ')');
                code.push('    if element:');
                code.push('        # Scroll element into view');
                code.push('        driver.execute_script("arguments[0].scrollIntoView({block: \'center\'});", element)');
                code.push('        time.sleep(0.5)  # Wait for scroll');
                code.push('        # Click and input text');
                code.push('        element.click()');
                code.push('        element.clear()');
                code.push('        element.send_keys("' + value + '")');
                code.push('    else:');
                code.push('        # Fallback to coordinates');
                code.push('        # First scroll to the approximate area');
                code.push('        driver.execute_script(f"window.scrollTo({step.x-100}, {step.y-100})")');
                code.push('        time.sleep(0.5)  # Wait for scroll');
                code.push('        # Calculate coordinates relative to viewport after scrolling');
                code.push('        viewport_x = ' + step.x + ' - window.pageXOffset');
                code.push('        viewport_y = ' + step.y + ' - window.pageYOffset');
                code.push('        # Move to position, click, and type');
                code.push('        body = driver.find_element(By.TAG_NAME, "body")');
                code.push('        ActionChains(driver).move_to_element(body).move_by_offset(viewport_x, viewport_y).click().perform()');
                code.push('        # Get active element and input text');
                code.push('        active_element = driver.switch_to.active_element');
                code.push('        active_element.clear()');
                code.push('        active_element.send_keys("' + value + '")');
                code.push('    time.sleep(0.5)');
                code.push('    # Move mouse back to a safe position');
                code.push('    body = driver.find_element(By.TAG_NAME, "body")');
                code.push('    ActionChains(driver).move_to_element(body).perform()');
                code.push('except Exception as e:');
                code.push('    print(f"Error inputting at step {' + (i + 1) + '}: {e}")');
                code.push('    # Try to reset the cursor position');
                code.push('    try:');
                code.push('        body = driver.find_element(By.TAG_NAME, "body")');
                code.push('        ActionChains(driver).move_to_element(body).perform()');
                code.push('    except:');
                code.push('        pass');
                code.push('time.sleep(1)  # Pause between actions\n');
            }
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