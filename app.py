from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Initialize the WebDriver
driver = webdriver.Chrome()

# Navigate to the page
driver.get("http://127.0.0.1:5500/")
time.sleep(2)  # Wait for page to load

# Step 1
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "username"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {1}: {e}")
time.sleep(1)  # Pause between actions

# Step 2
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "username"))
    )
    element.clear()
    element.send_keys("admin")
except Exception as e:
    print(f"Error at step {2}: {e}")
time.sleep(1)  # Pause between actions

# Step 3
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "password"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {3}: {e}")
time.sleep(1)  # Pause between actions

# Step 4
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "password"))
    )
    element.clear()
    element.send_keys("123")
except Exception as e:
    print(f"Error at step {4}: {e}")
time.sleep(1)  # Pause between actions

# Step 5
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "email"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {5}: {e}")
time.sleep(1)  # Pause between actions

# Step 6
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "email"))
    )
    element.clear()
    element.send_keys("thisispratikkabade@gmail.com")
except Exception as e:
    print(f"Error at step {6}: {e}")
time.sleep(1)  # Pause between actions

# Step 7
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "/html/body/div/section/form/fieldset/div/div/label"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {7}: {e}")
time.sleep(1)  # Pause between actions

# Step 8
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "male"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {8}: {e}")
time.sleep(1)  # Pause between actions

# Step 9
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "male"))
    )
    element.clear()
    element.send_keys("male")
except Exception as e:
    print(f"Error at step {9}: {e}")
time.sleep(1)  # Pause between actions

# Step 10
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "/html/body/div/section/form/fieldset[2]/div/div[2]/label"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {10}: {e}")
time.sleep(1)  # Pause between actions

# Step 11
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "reading"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {11}: {e}")
time.sleep(1)  # Pause between actions

# Step 12
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "reading"))
    )
    element.clear()
    element.send_keys("reading")
except Exception as e:
    print(f"Error at step {12}: {e}")
time.sleep(1)  # Pause between actions

# Step 13
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "countries"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {13}: {e}")
time.sleep(1)  # Pause between actions

# Step 14
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "countries"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {14}: {e}")
time.sleep(1)  # Pause between actions

# Step 15
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "message"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {15}: {e}")
time.sleep(1)  # Pause between actions

# Step 16
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "message"))
    )
    element.clear()
    element.send_keys("abc")
except Exception as e:
    print(f"Error at step {16}: {e}")
time.sleep(1)  # Pause between actions

# Step 17
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "date"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {17}: {e}")
time.sleep(1)  # Pause between actions

# Step 18
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "date"))
    )
    element.clear()
    element.send_keys("2025-05-17")
except Exception as e:
    print(f"Error at step {18}: {e}")
time.sleep(1)  # Pause between actions

# Step 19
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "color"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {19}: {e}")
time.sleep(1)  # Pause between actions

# Step 20
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "color"))
    )
    element.clear()
    element.send_keys("#ff0000")
except Exception as e:
    print(f"Error at step {20}: {e}")
time.sleep(1)  # Pause between actions

# Step 21
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "/html/body"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {21}: {e}")
time.sleep(1)  # Pause between actions

# Step 22
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "rating"))
    )
    element.clear()
    element.send_keys("10")
except Exception as e:
    print(f"Error at step {22}: {e}")
time.sleep(1)  # Pause between actions

# Step 23
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "rating"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {23}: {e}")
time.sleep(1)  # Pause between actions

# Step 24
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "cancel-button"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {24}: {e}")
time.sleep(1)  # Pause between actions

# Step 25
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "/html/body/div/section/form/div[7]/button[2]"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {25}: {e}")
time.sleep(1)  # Pause between actions

# Step 26
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "/html/body/div/section[3]/div/table/tbody/tr/td[5]/button[2]"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {26}: {e}")
time.sleep(1)  # Pause between actions

# Step 27
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "/html/body/div/section[3]/div/table/tbody/tr/td[5]/button[2]"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {27}: {e}")
time.sleep(1)  # Pause between actions

# Step 28
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "show-alert"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {28}: {e}")
time.sleep(1)  # Pause between actions

# Step 29
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "load-content"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {29}: {e}")
time.sleep(1)  # Pause between actions

# Step 30
try:
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "start-countdown"))
    )
    element.click()
except Exception as e:
    print(f"Error at step {30}: {e}")
time.sleep(1)  # Pause between actions

print("Script completed successfully!")
# driver.quit()  # Uncomment to close browser when done