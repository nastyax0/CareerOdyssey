from app.routes.userAuth import app, db  # Import the app and db objects

with app.app_context():
    db.create_all()
    print("Database and tables created.")