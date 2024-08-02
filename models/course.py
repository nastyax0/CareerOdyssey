import sqlite3
import subprocess
import json
import os

# Path to the database
db_path = r'..<path to your db>\courses.db'

def connect_to_db(db_path):
    try:
        conn = sqlite3.connect(db_path)
        print("Connected to the database successfully")
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def transfer_course_ids(conn):
    cursor = conn.cursor()
    
    try:
        # Fetch course_id values from user_course_interaction
        cursor.execute("SELECT course_id FROM user_course_interaction")
        rows = cursor.fetchall()
        
        if not rows:
            print("No course_id values found in user_course_interaction.")
            return
        
        # Insert each course_id into the courses table
        for row in rows:
            course_id = row[0]
            url = f"https://www.coursera.org/learn/{course_id}"  # Construct URL from course_id
            print(f"Scraping data for course_id: {course_id}")

            # Call the scrape.py script
            result = subprocess.run(['python', 'courseraScrape.py', url], capture_output=True, text=True)
            try:
                scraped_data = json.loads(result.stdout)
            except json.JSONDecodeError as e:
                print(f"JSON decoding error: {e}")
            scraped_data = json.loads(result.stdout)

            if 'error' in scraped_data:
                print(f"Error scraping course_id {course_id}: {scraped_data['error']}")
                continue

            print(f"Inserting data for course_id: {course_id}")

            # Insert into the courses table
            cursor.execute("""
                INSERT INTO courses (id, title, rating, description, url)
                VALUES (?, ?, ?, ?, ?)
            """, (course_id, scraped_data['Title'], scraped_data['Ratings'], scraped_data['Details'], url))
        
        # Commit the transaction
        conn.commit()
        print("Data transferred successfully")
        
    except sqlite3.Error as e:
        print(f"Error during transfer: {e}")

if __name__ == '__main__':
    conn = connect_to_db(db_path)
    if conn:
        transfer_course_ids(conn)
        conn.close()
