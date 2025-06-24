javascript: (function () {
    let r = false, steps = [], K = 'selenium_steps';
    function saveSteps() {
        localStorage.setItem(K, JSON.stringify(steps));

    } function loadSteps() {
        try {
            const d = localStorage.getItem(K);
            if (d) steps = JSON.parse(d);

        } catch (e) {
            console.error('Error loading steps:', e);
            steps = [];

        }
    } function getSmartSelector(e) {
        if (e.id) return { by: 'id', selector: e.id };
        if (e.name) return { by: 'name', selector: e.name };
        if (e.classList && e.classList.length) return { by: 'css', selector: e.tagName.toLowerCase() + '.' + Array.from(e.classList).join('.') };
        function getXPath(el) {
            if (!el || el.nodeType !== 1) return '';
            if (el.id) return '//*[@id="' + el.id + '"]';
            if (el.tagName === 'BODY') return '/html/body';
            const sibs = Array.from(el.parentNode.childNodes).filter(n => n.nodeType === 1 && n.tagName === el.tagName), idx = sibs.indexOf(el) + 1;
            return getXPath(el.parentNode) + '/' + el.tagName.toLowerCase() + (sibs.length > 1 ? '[' + idx + ']' : '');

        } return { by: 'xpath', selector: getXPath(e) };
    } function recClick(evt) {
        if (!r) return;
        const e = evt.target;
        if (e && e.id === 'seleniumRecordingBtn') return;
        const sel = getSmartSelector(e);
        steps.push({ type: 'click', selectorType: sel.by, selector: sel.selector });
        saveSteps();
    } function recInput(evt) {
        if (!r) return;
        const e = evt.target;
        if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' || e.isContentEditable) {
            const sel = getSmartSelector(e);
            steps.push({ type: 'input', selectorType: sel.by, selector: sel.selector, value: e.value });
            saveSteps();
        }
    } function addBtn() {
        const oldBtn = document.getElementById('seleniumRecordingBtn');
        if (oldBtn) oldBtn.remove();
        const b = document.createElement('div');
        b.id = 'seleniumRecordingBtn';
        b.innerText = r ? 'Stop Recording' : 'Start Recording';
        Object.assign(b.style, { position: 'fixed', top: '10px', right: '10px', background: r ? '#ff6666' : '#66cc66', color: '#fff', padding: '8px 12px', fontSize: '14px', fontWeight: 'bold', fontFamily: 'Arial,sans-serif', border: 'none', borderRadius: '4px', cursor: 'pointer', zIndex: '2147483647', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' });
        b.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggle();

        };
        document.body.appendChild(b);
    } function start() {
        r = true;
        steps = [];
        saveSteps();
        localStorage.setItem('seleniumRecording', 'on');
        document.addEventListener('click', recClick, true);
        document.addEventListener('change', recInput, true);
        addBtn();
        alert("Recording started");

    } function stop() {
        if (!r) return;
        r = false;
        localStorage.setItem('seleniumRecording', 'off');
        document.removeEventListener('click', recClick, true);
        document.removeEventListener('change', recInput, true);
        genScript();
        addBtn();

    } function toggle() {
        r ? stop() : start();

    } function genScript() {
        const u = window.location.href;
        let py = `from selenium import webdriver

from selenium.webdriver.common.by import By

from selenium.webdriver.common.keys import Keys

from selenium.webdriver.support.ui import WebDriverWait

from selenium.webdriver.support import expected_conditions as EC

import time

# Initialize the WebDriver

driver = webdriver.Chrome()

# Open the website

driver.get("${u}")

# Wait for page to load

time.sleep(2)

`;
        for (const s of steps) {
            let by, sel;
            switch (s.selectorType) {
                case 'id': by = 'By.ID';
                    sel = `"${s.selector}"`;
                    break;
                case 'name': by = 'By.NAME';
                    sel = `"${s.selector}"`;
                    break;
                case 'css': by = 'By.CSS_SELECTOR';
                    sel = `"${s.selector}"`;
                    break;
                default: by = 'By.XPATH';
                    sel = `"${s.selector}"`;
                    break;
            }py += `# Wait for element to be clickable\nelement = WebDriverWait(driver, 10).until(\n    EC.element_to_be_clickable((${by}, ${sel}))\n)\n`;
            if (s.type === 'click') {
                py += `element.click()\n`;

            } else if (s.type === 'input') {
                const val = s.value.replace(/"/g, '\\"');
                py += `element.clear()\nelement.send_keys("${val}")\n`;
            } py += `time.sleep(1)  # Brief pause between actions\n\n`;
        } py += `# Complete the task\nprint("Script completed successfully!")\n\n# Uncomment to close the browser when done\n# driver.quit()\n`;
        const blob = new Blob([py], { type: 'text/plain' });
        const dl = document.createElement('a');
        dl.href = URL.createObjectURL(blob);
        dl.download = 'selenium_script.py';
        dl.style.display = 'none';
        document.body.appendChild(dl);
        dl.click();
        setTimeout(() => {
            URL.revokeObjectURL(dl.href);
            document.body.removeChild(dl);

        }, 100);
        alert("Selenium script downloaded!");
    } function init() {
        const state = localStorage.getItem('seleniumRecording');
        if (state === 'on') {
            r = true;
            loadSteps();
            document.addEventListener('click', recClick, true);
            document.addEventListener('change', recInput, true);

        } addBtn();
    } init();
})();
