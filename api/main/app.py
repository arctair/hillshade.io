from flask import Flask


def get():
  return 'hello world'


def create_app():
    app = Flask(__name__)
    app.route('/')(get)
    return app

