import subprocess

import requests as requests
from flask import Flask, request, Response

version = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode('ascii').strip()


def get_version():
  return version


def get_google_tile(query_string):
  url = f'https://mt0.google.com/vt/{query_string}'
  response = requests.get(url)
  return Response(response.content, mimetype=response.headers['Content-Type'])


def create_app():
  app = Flask(__name__)
  app.route('/')(get_version)
  app.route('/mt0.google.com/vt/<query_string>')(get_google_tile)
  return app
