from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from datetime import datetime
import time
import os
import psutil
import json
import paramiko

class Script_Runner:                            
    # A framework for automating web interactions using Selenium.

    def __init__(self, app, script_num, sleep_time=3, gui=False, debug_mode=False, time_stamp=True, show_progress=False, width=1920, height=1080):
        self.app = app
        self.script_num = script_num
        self.debug_mode = debug_mode
        self.time_stamp = time_stamp
        self.sleep_time = sleep_time
        self.gui = gui
        self.show_progress = show_progress
        self.logs = ''
        self.cpu_before = ''
        self.cpu_after = ''
        self.time_arr = {}
        self.time_logs = ''
        self.base_path = ''
        self.log_manager('init_framework')
        
        options = Options()
        if not self.gui:
            options.add_argument("--headless=new")  # No UI
            # options.add_argument("--disable-gpu")   # Disables GPU hardware acceleration
            # options.add_argument("--no-sandbox")    # Bypass OS security model
            # options.add_argument("--disable-dev-shm-usage")  # Overcome limited resource problems


        # # FOR CHROME
        self.driver = webdriver.Chrome(options=options)

        # # FOR EDGE
        # service = Service(EdgeChromiumDriverManager().install())
        # self.driver = webdriver.Edge(service=service)

        self.driver.set_window_size(width, height)
        self.log_manager('init_framework_done')
        self._start_timer('Entire Script')
        self.step_num = 1

    def log_manager(self, fn, *args):
        log_messages = {
            "init_framework": '> Initializing Framework..',
            "init_framework_done": f'=> Framework Initialized: \napp:{self.app}\nscript_num:{self.script_num}\n',
            "cpu_usage": f'>> {args[0]}'  if args else 'no arg for cpu-usage',
            "timer": f' Timer "{args[0]}" started..'  if args else ' Timer started..',
            "timer_done": f' Timer "{args[0]}" stopped at "{args[1]}" / "{args[2]}" ' if len(args) >= 3 else ' Timer stopped',
            "screenshot": ' [] Screenshot Captured!',
            "navigate": f' @ Navigated to: "{args[0]}"'  if args else ' > Navigated.',
            "run": f'> Run "{args[0]}" started..'  if args else '\n> Run started..',
            "run_done": f' > Run "{args[0]}" completed\n'  if args else ' > Run completed..\n',
            "iframe": ' > Switched iFrame',
            "getting_path": ' > Getting path..',
            # "moving_mouse": f' > Moving mouse x:"{args[0]}", y:"{args[1]}", keys:"{args[2]}", slowing_time:"{args[3]}", sub_step:"{args[4]}" ' if len(args) >= 3 else ' Mouse Moved',
            "moving_mouse": f' > Moving mouse x:"{args[0]}", y:"{args[1]}", keys:"{args[2]}" ' if len(args) >= 3 else ' Mouse Moved',
            "slow_down": f' > Slowing down by "{args[0]}" sec..' if args else ' > Slowing down..',
            "slow_down_done": ' >> Continuing..',
            "find_element": f' > Finding element - "{args[0]}"' if args else ' > Finding element',
            "close": '=> Framework stopped\n',
        }

        if fn == "init_framework":
            self.cpu_before = self._get_cpu_usage()

        if fn == "timer_done":
            arg = args[0] if len(args) >= 2 else ''
            sec = args[1] if len(args) >= 2 else ''
            # min = args[2] if len(args) >= 2 else ''
            time_str = f'{str(arg)}:{sec}'
            self.time_logs += time_str + ' , '

        log = log_messages.get(fn, fn)
        
        if self.time_stamp:
            current_time=self._get_time()
            self.logs += f'{current_time}  {log}\n'
        else:
            self.logs += log + '\n'

        if fn == "run":
            self._start_timer(self.step_num)
            
        if fn == "run_done":
            self._stop_timer(self.step_num)
            
        if fn == "close":
            self.cpu_after = self._get_cpu_usage()
            _path = self._get_path()
            _base_path = _path.split('00 - ')[0]
            _time_path = _path.split(' - ')[1].replace('.png', '')
            log_file = _base_path + 'logs - ' + _time_path + '.txt'            
            log_file = os.path.join(self.base_path, f"logs - {_time_path}.txt")
            with open(log_file, 'w') as file:
                file.write(self.logs)

        if fn == 'run' or fn == 'run_done':
            _path = self._get_path()
            time_log_file = f'{self.base_path}/time_logs.txt'
            with open(time_log_file, 'w') as file:
                file.write(self.time_logs)


    def _get_time(self):
        now = datetime.now()
        current_time = now.strftime('%d-%m-%Y %H-%M-%S')
        return current_time

    def _start_timer(self, info):
        curr_time = time.time()
        item = {info:curr_time}
        self.time_arr.update(item)
        self.log_manager('timer', info)

    def _stop_timer(self, info):
        item_time = self.time_arr[info]
        elapsed_time = time.time() - item_time
        sec = f"{elapsed_time:.2f}"
        min = f"{elapsed_time / 60:.2f}"
        self.log_manager('timer_done', info, sec, min)
        return elapsed_time

    def _get_path(self, step_number=0, sub_step=''):
        self.log_manager('getting_path')
        script_name = self.script_num
        path = f"output/{self.app}/{script_name}"
        
        if not os.path.exists(path):
            os.makedirs(path)
        
        total_folders = len(os.listdir(path)) + 1
        if self.base_path == '':
            _base_path = path + '/'
            if total_folders < 10:
                _base_path += '0'
            self.base_path = _base_path + str(total_folders)
            if not os.path.exists(self.base_path):
                os.makedirs(self.base_path)

        _sub_step = ''
        if sub_step!='':
            sub_steps_folder = os.path.join(self.base_path, 'sub_steps')
            os.makedirs(sub_steps_folder, exist_ok=True)
            number_of_sub_steps = str(len(os.listdir(sub_steps_folder)))
            _sub_step = f"sub_steps/({number_of_sub_steps}={sub_step}) "

        step_number = f"{step_number:02d}"
        current_time = f"[{step_number}] - {datetime.now().strftime('%H_%M_%S')}"
        screenshot_path = os.path.join(self.base_path, f"{_sub_step} {self.app}_{script_name} {current_time}.png")
        screenshot_path = os.path.normpath(screenshot_path)
        return screenshot_path
    
    def _get_cpu_usage(self):
        get_cpu_usage = psutil.cpu_percent(interval=1)
        get_memory_usage = psutil.virtual_memory().percent
        get_disk_usage = psutil.disk_usage('/').percent

        usage_text = f'CPU Usage- "{get_cpu_usage}%"; Memory Usage- "{get_memory_usage}%"; Disk Usage- "{get_disk_usage}%"'
        self.log_manager('cpu_usage',usage_text)
        usage_response = f'{get_cpu_usage}; {get_memory_usage};{get_disk_usage}'
        return usage_response
    
    def switch_iframe(self):
        self.log_manager('iframe')
        iframe = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.XPATH, "//iframe")))
        self.driver.switch_to.frame(iframe)

    def slow_down(self, duration=None):
        duration = duration if duration else self.sleep_time
        self.log_manager('slow_down', duration)
        time.sleep(duration)
        self.log_manager('slow_down_done')
    
    def find__element(self, value, by="ID"):
        self.log_manager('find_element', value)
        locator = (getattr(By, by.upper()), value)
        return WebDriverWait(self.driver, 10).until(EC.element_to_be_clickable((locator)))

    def find__element_class(self, value, by="CLASS_NAME"):
        self.log_manager('find_element', value)
        locator = (getattr(By, by.upper()), value)
        return WebDriverWait(self.driver, 10).until(EC.element_to_be_clickable((locator)))

    def mouse_click_with_keys(self, x_coordinate, y_coordinate, keys='NA', slowing_time=3, sub_step=''):
        self.log_manager('moving_mouse', x_coordinate, y_coordinate, keys)
        # slowing_time, sub_step
        actions = ActionChains(self.driver)
        actions.move_by_offset(x_coordinate, y_coordinate).click().perform()
        active_element = self.driver.switch_to.active_element
        if keys!='NA':
            active_element.send_keys(keys)
        if sub_step != '':
            self.save_screenshot(_sub_step=sub_step)
        actions.move_by_offset(-1*x_coordinate, -1 * y_coordinate).click().perform()
        self.slow_down(slowing_time)
        return active_element

    def write_content(self, content, key='NA'):
        file_path = self.base_path + '/content.json'

        # Check if the file exists
        if not os.path.exists(file_path):
            # Create the file and write an empty dictionary to it
            with open(file_path, 'w') as file:
                json.dump({}, file)

        with open(file_path, 'r') as file:
            existing_content = json.load(file)

        if key == 'NA':
            length_of_existing_content = len(existing_content) + 1
            existing_content.update({length_of_existing_content: content})
        else:
            existing_content.update({key: content})

        with open(file_path, 'w') as file:
            json.dump(existing_content, file, indent=4)

    # def read_content(self):
    #     with open(file_path, 'r') as file:
    #         content = file.read()
    #     self.log_manager(f'content ==>     {content}')
    #     return content

    def read_dynamic_content(self, item_id=0):
        _FILE_TO_READ = f'output/_bin/{self.app}{self.script_num}.json'
        item_id = str(item_id)

        with open(_FILE_TO_READ, 'r') as file:
            content = file.read()
            json_content = json.loads(content)
        self.log_manager(f' >| Dynamic Content ==> {json_content}')
        self.write_content(json_content[item_id], f'Dynamic-Content #{item_id}')
        if json_content[item_id]:
            return json_content[item_id]
        else:
            return json_content

    def save_screenshot(self, _sub_step=''):
        self.log_manager('screenshot')
        self.driver.save_screenshot(self._get_path(step_number=self.step_num, sub_step=_sub_step))

    def __to_dict(self, result):
        # BUG : Depriciated because of problems with React 
        # Converts string to Dictionary for easy fetch on frontend
        arr = result.split('\n')
        dict = {i.split(':')[0]:i.split(':')[1] for i in arr[:-1]}
        return dict

    def run_sripts(self, *args):
        if self.show_progress: print('Running scripts now!')
        for fn in args:
            try:
                self.log_manager('run',self.step_num)
                fn()
                self.log_manager('run_done',self.step_num)
            except Exception as e:
                ErrorLineMessage = f'Error at step {self.step_num}'
                self.logs += f"{ErrorLineMessage}: {e}\n\n"
                small_err = str(e).replace('\n','')[0:100] + '..'
                self.write_content(small_err, ErrorLineMessage)
                if self.debug_mode: print(f"{ErrorLineMessage}:\n{small_err}\n\n")
                # self.close()
                break
            if self.show_progress: print(f'Step "{self.step_num}" completed!')
            self.step_num += 1
        self.step_num -= 1
        self.close()
        result = str(f'Result:{self.step_num==len(args)} , Outcome:{str(self.step_num)}/{len(args)} , Before:{self.cpu_before} , After:{self.cpu_after} , {self.time_logs}')
        # dict = self._to_dict(result)
        return result

    def write_results(self, result):
        with open(self.base_path + '/Results.txt', 'w') as file:
            file.write(str(result))

    def run_remote_commands(self, hostname, username, password, commands, output_file):
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        output_content = []  # List to store the output lines

        try:
            ssh.connect(hostname, username=username, password=password)
            stdin, stdout, stderr = ssh.exec_command(' '.join(commands))
            # Open the file for writing
            with open(output_file, 'w') as file:
                for line in stdout.readlines():
                    line_cleaned = line.strip()
                    output_content.append(line_cleaned)  # Store in the list
                    file.write(line_cleaned + '\n')  # Write to file
        except Exception as e:
            print(f"Error: {str(e)}")
        finally:
            ssh.close()

        return "\n".join(output_content)  # Return the content as a single formatted string

    def close(self):
        self.driver.quit()
        self._stop_timer('Entire Script')
        self.log_manager('close')




















    def navigate_to_url(self, url, wait_time=2):
        try:
            self.driver.get(url)
            self.log_manager('navigate', url)
        except Exception as e:
            self.log_manager(f">< Error navigating to {url}: {e}\n")
            self.driver.quit()
            exit()

    def find_and_perform_action(self, by_type, locator, action="click", value=None, step_num=None, wait_time=10):
        try:
            if locator == 'screenshotBtn':
                self.log_manager(f" - ActualStep {step_num}: Skipped!")
                return True
            else:
                element = WebDriverWait(self.driver, wait_time).until(
                    EC.element_to_be_clickable((by_type, locator))
                )
                if action == "click":
                    element.click()
                elif action == "send_keys" and value:
                    element.send_keys(value)
                elif action == "clear":
                    element.clear()
                elif action == "clear_and_send_keys" and value:
                    element.clear()
                    element.send_keys(value)
                self.log_manager(f" - ActualStep {step_num}: Successful!")
                return element
        except Exception as e:
            self.log_manager(f" >< Error at step {step_num}: \nCould not perform '{action}' on element located by {by_type}='{locator}': {e}\n")
            return None

    def select_dropdown_by_visible_text(self, by_type, locator, text, step_num, wait_time=10):
        try:
            select_element = WebDriverWait(self.driver, wait_time).until(
                EC.presence_of_element_located((by_type, locator))
            )
            select = Select(select_element)
            select.select_by_visible_text(text)
            self.log_manager(f" - ActualStep {step_num}: Successful!")
            return True
        except Exception as e:
            self.log_manager(f" >< Error at step {step_num}: Could not select '{text}' from dropdown located by {by_type}='{locator}': {e}\n")
            return False


# app = Script_Runner('Cramer', 4, gui=False)
# app.driver.get('http://localhost:5173/tester')
# app.slow_down()
# app.save_screenshot()
