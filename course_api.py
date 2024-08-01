from flask import Flask, request, jsonify
import requests
import subprocess
from flask_cors import CORS
import json
import logging

app = Flask(__name__)
CORS(app,supports_credentials=True)

YOUTUBE_API_KEY = 'AIzaSyBEcQ-dbIdsDLFTA6l2RSe8CzHM-Z5P3nA'
COURSERA_API_KEY = 'q4qQ0seJDIRAguAhhUw1sgSaTvwJK9GjnjaHYQv4Yp5YDjQD'
access_token = 'C9Q95imXGUPaAc6VnZ4SaaTU7BGA'
# Configure logging
logging.basicConfig(level=logging.DEBUG)



@app.route('/search_courses', methods=['GET'])
def search_courses():
    query = request.args.get('query')
    youtube_results = search_youtube(query)
    coursera_results = search_coursera(query)
    return jsonify({
        'youtube': youtube_results,
        'coursera': coursera_results,
    })

def search_youtube(query):
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&key={YOUTUBE_API_KEY}"
    response = requests.get(url)
    return response.json()

def search_coursera(query):
    url = f"https://api.coursera.org/api/courses.v1?q=search&query={query}&fields=courseId,name,description,courseUrl"
    headers = {'Authorization': f'Bearer {access_token}'}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        app.logger.error(f"An error occurred: {e}")
        return []

@app.route('/scrape_course', methods=['POST'])
def scrape_course():
    data = request.get_json()
    course_url = data.get('url')
    print(course_url)
    if course_url:
        try:
            result = subprocess.run(['python', './app/routes/courseraScrape.py', course_url], capture_output=True, text=True)
            app.logger.debug(f"Subprocess output: {result.stdout}")
            if result.returncode != 0:
                app.logger.error(f"Subprocess error: {result.stderr}")
                return jsonify({'error': 'Error scraping course data'}), 500
            scraped_data = json.loads(result.stdout)
            return jsonify({'status': 'Scrape complete', 'data': scraped_data}), 200
        except json.JSONDecodeError as json_err:
            app.logger.error(f"JSON decode error: {json_err}")
            app.logger.error(f"Subprocess output: {result.stdout}")
            return jsonify({'error': 'Invalid JSON output from scrapper.py'}), 500
        except Exception as e:
            app.logger.error(f"Exception during scraping: {e}")
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid URL'}), 400

if __name__ == '__main__':
    app.run(debug=True)
