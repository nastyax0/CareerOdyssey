from dotenv import load_dotenv
import os
import redis

load_dotenv()

class ApplicationConfig:
    SECRET_KEY = os.environ["SECRET_KEY"]

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///courses.db'
    SESSION_TYPE = 'redis'
    SESSION_REDIS = redis.StrictRedis(host='localhost', port=6379, db=0)
    SESSION_PERMENANT = False
    SESSION_USE_SIGNER=True