import requests
from bs4 import BeautifulSoup
import sys
import json

def scrape_course(url):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        card = soup.find('div', {'class': 'css-1mocuok'})
        if card:
            course_detail = card.find('div', {'class':'css-19feqtt'})
            Title = card.find('h2').get_text(strip=True) if card.find('h2') else 'No title found'
            Rating = course_detail.find('div', {'class': 'css-guxf6x'}).get_text(strip=True) if course_detail.find('div', {'class': 'css-guxf6x'}) else 'No ratings found'
            Experience = course_detail.find('div', {'class':'css-fk6qfz'}).get_text(strip=True) if course_detail.find('div', {'class': 'css-fk6qfz'}) else 'No experience found'
            Details = course_detail.get_text(strip=False) if course_detail else 'No other details found.'
        else:
            Title = Rating = Experience = Details = 'Not found'

        review = soup.find('div', {'class': 'css-10jtpc0'})
        text = review.get_text(strip=True) if review else 'No reviews found.'

        scraped = {
            'Title': Title,
            'Ratings': Rating,
            'Experience': Experience,
            'Details': Details,
            'Review': text
        }
        return scraped
    else:
        return {'error': f'Failed to retrieve the page. Status code: {response.status_code}'}



if __name__ == '__main__':
    if len(sys.argv) > 1:
        course_url = sys.argv[1]
        scraped_data = scrape_course(course_url)
        print(json.dumps(scraped_data))
    else:
        print(json.dumps({'error': 'No URL provided'}))
