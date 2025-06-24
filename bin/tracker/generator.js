function escapeQuotes(str) {

    return str.replace(/"/g, '\\"');

}

function generateSeleniumScript(actions) {

    let script = `from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nimport time\n\n`;

    script += `driver = webdriver.Chrome()\ndriver.get("YOUR_URL_HERE")\n\ntime.sleep(2)\n\n`;

    actions.forEach(action => {

        if (action.type === 'click') {

            script += `driver.find_element(By.XPATH, "${action.xpath}").click()\n`;

        } else if (action.type === 'input') {

            script += `driver.find_element(By.XPATH, "${action.xpath}").send_keys("${escapeQuotes(action.value)}")\n`;

        }

        script += `time.sleep(1)\n`;

    });

    script += `\ndriver.quit()\n`;

    // Show in browser

    document.getElementById("output").textContent = script;

    // Download as file

    const blob = new Blob([script], { type: "text/x-python" });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "recorded_script.py";

    link.click();

}
