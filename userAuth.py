from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_session import Session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import google.generativeai as genai
from config_session import ApplicationConfig
from flask_cors import CORS , cross_origin
from transformers import BartTokenizer, TFBartForConditionalGeneration, pipeline
import spacy, os, json,subprocess
import os
from datetime import datetime

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
server_session=Session(app)
engine = create_engine('sqlite:///../CareerOdyssey/instance/courses.db')
Session = sessionmaker(bind=engine)
summarizer = pipeline("summarization")
nlp = spacy.load("en_core_web_sm")
tokenizer = BartTokenizer.from_pretrained("facebook/bart-large")
open_model = TFBartForConditionalGeneration.from_pretrained("facebook/bart-large")
gen_ai_key = os.getenv('gen_ai_key')
genai.configure(api_key=gen_ai_key)

@app.route("/@me")
def get_current_user():
    user_id= session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"})
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "name": user.name
    })
    

@app.route('/check_user', methods=['GET'])
def check_user():
    user_id = session.get("user_id")
    if user_id:
        db_session = Session()
        user = db_session.get(User, user_id)
        if user:
            return jsonify({
                'user': {
                    'id': user.id,
                    'name': user.name
                }
            })
    return jsonify({'user': None}), 401



# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    password = db.Column(db.String(200))  # Add password field

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120))
    rating = db.Column(db.String(120))
    description = db.Column(db.String(200))
    url = db.Column(db.String(200))

class UserCourseInteraction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    course_id = db.Column(db.String, db.ForeignKey('course.id'))
    liked = db.Column(db.Boolean)
    disliked = db.Column(db.Boolean)

class TODO(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=True)
    course_id = db.Column(db.String, nullable=False)
    course_title = db.Column(db.String, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    deadline = db.Column(db.Date, nullable=True)

# Routes
@app.route('/like_course', methods=['POST'])
def like_course():
    user_id = request.json['user_id']
    course_id = request.json['course_id']
    liked = request.json['liked']

    interaction = UserCourseInteraction.query.filter_by(user_id=user_id, course_id=course_id).first()
    if interaction:
        interaction.liked = liked
    else:
        new_interaction = UserCourseInteraction(user_id=user_id, course_id=course_id, liked=liked)
        db.session.add(new_interaction)
    
    db.session.commit()
    return jsonify({'message': 'Course interaction saved successfully'})

@app.route('/get_liked_courses', methods=['GET'])
def get_liked_courses():
    user_id = request.args.get('user_id')
    interactions = UserCourseInteraction.query.filter_by(user_id=user_id, liked=True).all()
    liked_courses = []
    
    for interaction in interactions:
        course = Course.query.get(interaction.course_id)
        liked_courses.append({
            'title': course.title,
            'description': course.description,
            'url': course.url
        })
    return jsonify({'liked_courses': liked_courses})

@app.route('/dislike_course', methods=['POST'])
def dislike_course():
    user_id = request.json['user_id']
    course_id = request.json['course_id']
    disliked = request.json['disliked']

    course = Course.query.filter_by(course_id=course_id).first()
    if not course:
        course = Course(course_id=course_id)
        db.session.add(course)
    
    interaction = UserCourseInteraction.query.filter_by(user_id=user_id, course_id=course_id).first()
    if interaction:
        interaction.disliked = disliked
    else:
        new_interaction = UserCourseInteraction(user_id=user_id, course_id=course_id, disliked=disliked)
        new_course_interaction = Course(course_id = course_id)
        db.session.add(new_interaction)
    
    db.session.commit()
    return jsonify({'message': 'Course interaction saved successfully'})

@app.route('/get_disliked_courses', methods=['GET'])
def get_disliked_courses():
    user_id = request.args.get('user_id')
    interactions = UserCourseInteraction.query.filter_by(user_id=user_id, disliked=True).all()
    disliked_courses = []
    for interaction in interactions:
        course = Course.query.get(interaction.course_id)
        disliked_courses.append({
            'title': course.title,
            'description': course.description,
            'url': course.url
        })
    return jsonify({'disliked_courses': disliked_courses})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(name=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify(message='User registered successfully!'), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(name=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        session['user_id'] = user.id
        return jsonify(message='Logged in successfully!'), 200
    else:
        return jsonify(message='Invalid credentials'), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify(message='Logged out successfully!'), 200

@app.route('/summarize', methods=['GET'])
def summarize():
    user_likes = UserCourseInteraction.query.all()
    if not user_likes:
        return jsonify({'error': 'No liked courses found for user'}), 404

    course_titles = [like.course_id for like in user_likes]
    prompt = ". ".join(course_titles) + "."
    #prompt = f"Summarize the following course titles: {', '.join(course_titles)}"
    doc = nlp(prompt)
    clean_text = " ".join([token.text for token in doc if not token.is_stop and not token.is_punct])
    inputs = tokenizer.encode("summarize: " + clean_text, return_tensors="pt", max_length=1024, truncation=True)
    try:
        summary_ids = open_model.generate(inputs, max_length=200, min_length=50, length_penalty=2.0, num_beams=4, early_stopping=True)
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")
        summarized = model.generate_content(f"{summary} You have been given a list of topics that I like, what would you recommend?")
        return jsonify({'summary': summarized.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/todo', methods=['POST'])
def create_todo():
    try:
        data = request.json
        course_id = data.get('course_id')
        course_title = data.get('course_title')
        user_id = data.get('user_id')
        deadline = data.get('deadline')

        if not user_id:
            return jsonify({'error': 'User was not found'})
        if not course_id:
            return jsonify({'error': 'Course is not selected'}), 400

        if not deadline:
             return jsonify({'error': 'Deadline is not set'})
        

        if deadline:
            deadline = datetime.fromisoformat(deadline)
        new_todo = TODO(user_id=user_id, course_id=course_id, course_title=course_title, deadline=deadline)
        db.session.add(new_todo)
        db.session.commit()

        return jsonify({'message': 'TODO item created successfully', 'todo': new_todo.id}), 201
    except Exception as e:
        db.session.rollback()  # Rollback in case of an error
        return jsonify({'error': str(e)}), 500


@app.route('/update_todo', methods=['POST'])
def update_todo():
    data = request.json
    todo_id = data.get('id')
    completed = data.get('completed')
    # Debug logging
    print(f"Received data: id={todo_id}, completed={completed}")

    todo = TODO.query.get(todo_id)
    if not todo:
        return jsonify({'error': 'Todo not found'}), 404
    completed = completed in [True, 'true', 1, '1']
    db.session.commit()
    return jsonify({'message': 'Todo updated successfully'}), 200
    
@app.route('/report')
def get_report():
    user_id = request.json['user_id']
    user = User.query.get(user_id)
    username = user.name if user else 'Unknown User'
    
    
    today_date = datetime.now().strftime('%Y-%m-%d')

    
    total_courses_browsed = UserCourseInteraction.query.count()
    courses_marked_as_interested = UserCourseInteraction.query.filter_by(liked=True).count()
    courses_marked_as_disinterested = UserCourseInteraction.query.filter_by(disliked=False).count()
    interested_courses = UserCourseInteraction.query.filter_by(liked=True)
    interested_courses_details = []

    for course in interested_courses:
        url = f'https://www.coursera.org/learn/{course.id}'
        result = subprocess.run(['python', './courseraScrape.py', url], capture_output=True, text=True)
        try:
            scraped_data = json.loads(result.stdout)
            interested_courses_details.append({
                "title": course.course_id,
                "rating": scraped_data['Title'],
                "Details": scraped_data['Details'],
            })
        except json.JSONDecodeError:
            interested_courses_details.append({
                "title": course.course_id,
                "rating": 'Failed to fetch',
                "Details": 'Failed to fetch',
            })

    disinterested_courses = UserCourseInteraction.query.filter_by(disliked=True)
    disinterested_courses_details=[]
    for course in disinterested_courses:
        url = f'https://www.coursera.org/learn/{course.id}'
        result = subprocess.run(['python', './courseraScrape.py', url], capture_output=True, text=True)
        try:
            scraped_data = json.loads(result.stdout)
            disinterested_courses_details.append({
                "title": course.course_id,
                "rating": scraped_data['Title'],
                "Details": scraped_data['Details'],
            })
        except json.JSONDecodeError:
            disinterested_courses_details.append({
                "title": course.course_id,
                "rating": 'Failed to fetch',
                "Details": 'Failed to fetch',
            })


    report = {
        "userName": username,
        "date": today_date,
        "totalCoursesBrowsed": total_courses_browsed,
        "coursesMarkedAsInterested": courses_marked_as_interested,
        "coursesMarkedAsDisinterested": courses_marked_as_disinterested,
        "interestedCourses": interested_courses_details,
        "disinterestedCourses": disinterested_courses_details
    }

    return jsonify(report)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        app.run(port=3001, debug=True)
