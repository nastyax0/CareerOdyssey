from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import urllib.parse
from time import sleep

def scrape_udemy(search_query):
    query = urllib.parse.quote(search_query)
    url = f"https://www.udemy.com/courses/search/?q={query}"

    service = ChromeService(executable_path='C:\\Program Files\\chromedriver-win64\\chromedriver.exe')
    driver = webdriver.Chrome(service=service)
    driver.get(url)
    
    try:
        # Wait until the course list container is present
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'body.udemy.ud-main-content-ready')))
        sleep(3)  # Additional wait to ensure page is fully loaded
        
        # Parse the page source with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        data = []

        # Find course elements
        course_cards = soup.find_all('div', {'class': 'ud-text-sm clp-lead'})

        for course in course_cards:
            title = course.find('h1', {'class': 'ud-heading-xl clp-lead__title clp-lead__title--small'}).get_text(strip=True) if course.find('h1', {'class': 'ud-heading-xl clp-lead__title clp-lead__title--small'}) else 'N/A'
            description = course.find('div', {'data-purpose': 'lead-headline'}).get_text(strip=True) if course.find('div', {'data-purpose': 'lead-headline'}) else 'N/A'
            
            data.append({
                'title': title,
                'description': description
            })
            
        return data
    
    finally:
        driver.quit()

search_query = input("Enter the course search query: ")
courses = scrape_udemy(search_query)

for course in courses:
    print(f"Title: {course['title']}")
    print(f"Description: {course['description']}")
    print("-------------")
