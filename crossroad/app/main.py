import os
import logging

from flask import Flask, jsonify

app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)

sample_dictionary = {}
sample_list = []

@app.route("/")
def index():
    app.logger.info("Logging test.")
    return "Index Site"

@app.route("/dict")
def dict_page():
    dictionary = {}
    dictionary["key"] = "value"
    return dictionary

@app.route("/sample")
def sample_dict_page():
    return sample_dictionary

@app.route("/sample/<key>")
def sample_key_value(key):
    return {key: sample_dictionary[key]}

@app.route("/sample/add/<key>/<value>")
def sample_add(key, value):
    sample_dictionary[key] = value
    return {key: value}

@app.route("/sample/remove/key")
def sample_remove(key):
    value = sample_dictionary[key]
    sample_dictionary.remove(key)
    return {key: value}

@app.route("/list")
def sample_list_page():
    return sample_list

@app.route("/list/add/<int:number>")
def sample_list_add(number):
    sample_list.append(number)
    return sample_list

@app.route("/json")
def json_page():
    dictionary = {}
    dictionary["key"] = "value"
    return jsonify(dictionary)

if __name__ == "__main__":
    host_ip = "127.0.0.1"
    if os.environ.get("FLASK_RUN_HOST") is not None:
        host_ip = os.environ["FLASK_RUN_HOST"]
    
    app.run(debug=True, host=host_ip)
