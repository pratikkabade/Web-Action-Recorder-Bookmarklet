javascript: (function () {
    let r = false, steps = [], K = 'selenium_steps';
    function saveSteps() {
        localStorage.setItem(K, JSON.stringify(steps));
    }
    function loadSteps() {
        const d = localStorage.getItem(K);
        if (d) steps = JSON.parse(d);
    }
    function getSmartSelector(e) {
        if (e.id) return { by: 'id', selector: e.id };
        if (e.name) return { by: 'name', selector: e.name };
        if (e.classList && e.classList.length) {
            return { by: 'css', selector: e.tagName.toLowerCase() + '.' + Array.from(e.classList).join('.') };
        }
        function getElementXPath(el) {
            if (!el || el.nodeType !== 1) return '';
            if (el.id) return '//*[@id="' + el.id + '"]';
            if (el.tagName === 'BODY') return '/html/body';
            const sibs = Array.from(el.parentNode.childNodes).filter(n => n.nodeType === 1 && n.tagName === el.tagName), idx = sibs.indexOf(el) + 1;
            return getElementXPath(el.parentNode) + '/' + el.tagName.toLowerCase() + (sibs.length > 1 ? `[${idx}]` : '');
        } return { by: 'xpath', selector: getElementXPath(e) };
    }
    function recClick(evt) {
        const e = evt.target, sel = getSmartSelector(e);
        steps.push({ type: 'click', selectorType: sel.by, selector: sel.selector });
        saveSteps();
    }
    function recInput(evt) {
        const e = evt.target;
        if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' || e.isContentEditable) {
            const sel = getSmartSelector(e);
            steps.push({ type: 'input', selectorType: sel.by, selector: sel.selector, value: e.value });
            saveSteps();
        }
    }
    function addBtn() {
        if (document.getElementById('stopRecordingBtn')) return;
        const b = document.createElement('div');
        b.id = 'stopRecordingBtn';
        b.innerText = 'Stop Recording';
        Object.assign(b.style, { position: 'fixed', top: '10px', right: '10px', background: '#ffcc00', color: '#000', padding: '8px 12px', fontSize: '14px', fontFamily: 'sans-serif', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer', zIndex: '2147483647' });
        b.onclick = stop;
        document.body.appendChild(b);
    }
    function start() {
        if (r) return;
        r = true;
        steps = [];
        saveSteps();
        localStorage.setItem('seleniumRecording', 'on');
        addBtn();
        document.addEventListener('click', recClick, true);
        document.addEventListener('change', recInput, true);
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') alert("Switching tabs will stop recording!");
        });
        alert("Recording started");
    }
    function stop() {
        if (!r) return;
        r = false;
        document.getElementById('stopRecordingBtn').remove();
        document.removeEventListener('click', recClick, true);
        document.removeEventListener('change', recInput, true);
        localStorage.setItem('seleniumRecording', 'off');
        const u = window.location.href;
        let py = 'from selenium import webdriver\\nfrom selenium.webdriver.common.by import By\\n\\ndriver = webdriver.Chrome()\\ndriver.get("' + u + '")\\n\\n';
        for (const s of steps) {
            if (s.type === 'click') {
                let by = 'By.XPATH', sel = s.selector;
                if (s.selectorType === 'id') {
                    by = 'By.ID';
                    sel = '"' + s.selector + '"';

                } else if (s.selectorType === 'name') {
                    by = 'By.NAME';
                    //  sel = '"' + s.selector + '"';

                } else if (s.selectorType === 'css') {
                    by = 'By.CSS_SELECTOR';
                    //  sel = '"' + s.selector + '"';

                } else {
                    sel = '"' + s.selector + '"';

                } py += `driver.find_element(${by}, ${sel}).click()\\n`;
            } if (s.type === 'input') {
                let by = 'By.XPATH', sel = s.selector;
                if (s.selectorType === 'id') {
                    by = 'By.ID';
                    sel = '"' + s.selector + '"';

                } else if (s.selectorType === 'name') {
                    by = 'By.NAME';
                    sel = '"' + s.selector + '"';

                } else if (s.selectorType === 'css') {
                    by = 'By.CSS_SELECTOR';
                    sel = '"' + s.selector + '"';

                } else {
                    sel = '"' + s.selector + '"';

                } const val = s.value.replace(/"/g, '\\"');
                py += `driver.find_element(${by}, ${sel}).send_keys("${val}")\\n`;
            }
        } py += '\\ndriver.quit()\\n';
        const blob = new Blob([py], { type: 'text/plain' });
        const dl = document.createElement('a');
        dl.href = URL.createObjectURL(blob);
        dl.download = 'selenium_script.py';
        dl.click();
        URL.revokeObjectURL(dl.href);
        alert("Selenium script downloaded!");
    } if (localStorage.getItem('seleniumRecording') === 'on') {
        r = true;
        loadSteps();
        addBtn();
        document.addEventListener('click', recClick, true);
        document.addEventListener('change', recInput, true);
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') alert("Switching tabs will stop recording!");
        });
    } else {
        start();
    }
})();