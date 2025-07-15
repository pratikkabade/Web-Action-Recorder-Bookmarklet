# SCRIPT_NAME: Web Form Automation
# TEST_STEPS: Automates filling out a web form with various input types.

from selenium import webdriver
from selenium.webdriver.common.by import By
from Script_Runner import Script_Runner

# --- Test Steps ---

def run_script():
    script_num=1
    app = Script_Runner("Dev", script_num, gui=True, width=1920, height=1080)

    def step_1():
        app.navigate_to_url("file:///C:/Users/2125094/OneDrive%20-%20Cognizant/.archived-workspace/chrome-tracker/index.html")
        app.find_and_perform_action(By.ID,"username",action="click",step_num=2)
        app.find_and_perform_action(By.ID,"username",action="clear_and_send_keys",value="admin",step_num=3)
        app.find_and_perform_action(By.ID,"password",action="click",step_num=4)
        app.find_and_perform_action(By.ID,"password",action="clear_and_send_keys",value="123",step_num=5)

    def step_2():
        app.save_screenshot()
        app.find_and_perform_action(By.ID,"email",action="click",step_num=8)
        app.find_and_perform_action(By.ID,"email",action="clear_and_send_keys",value="pratik.kabade@cognizant.com",step_num=9)
        app.save_screenshot()

    val = app.run_sripts(step_1, step_2)
    print(val)

if __name__ == "__main__":
    run_script()
