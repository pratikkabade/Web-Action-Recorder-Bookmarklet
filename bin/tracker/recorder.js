window.actions = [];

function getXPath(element) {

    if (element.id) return `//*[@id="${element.id}"]`;

    const path = [];

    while (element && element.nodeType === Node.ELEMENT_NODE) {

        let index = 1;

        let sibling = element.previousSibling;

        while (sibling) {

            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) index++;

            sibling = sibling.previousSibling;

        }

        path.unshift(`${element.nodeName.toLowerCase()}[${index}]`);

        element = element.parentNode;

    }

    return '/' + path.join('/');

}

function recordClick(e) {

    const xpath = getXPath(e.target);

    window.actions.push({ type: 'click', xpath });

}

function recordInput(e) {

    const xpath = getXPath(e.target);

    window.actions.push({ type: 'input', xpath, value: e.target.value });

}

function startRecording() {

    document.addEventListener('click', recordClick, true);

    document.addEventListener('input', recordInput, true);

    window.actions = [];

    alert("Recording started.");

}

function stopRecording() {

    document.removeEventListener('click', recordClick, true);

    document.removeEventListener('input', recordInput, true);

    generateSeleniumScript(window.actions);

}
