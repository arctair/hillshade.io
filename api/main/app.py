import subprocess

from flask import Flask

version = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode('ascii').strip()


def get_version():
  return version


def create_app():
    app = Flask(__name__)
    app.route('/')(get_version)
    return app

