import os
import logging
from random import randint

from flask import Flask, jsonify, redirect, url_for, request
import redis

app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)

r = redis.Redis(host="redis", port=6379)

sample_dictionary = {}
sample_list = []

@app.route("/")
def index():
    app.logger.info("Logging test.")
    return "Index Site"

@app.route("/redis")
def redis_page():
    r.incr("visits")
    return r.get("visits")

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
    return redirect(url_for("sample_list_page"))

@app.route("/json")
def json_page():
    dictionary = {}
    dictionary["key"] = "value"
    return jsonify(dictionary)

@app.route("/random")
def random_page():
    selector = randint(1, 5)
    redirection = "index"
    if selector == 1:
        redirection = "index"
    elif selector == 2:
        redirection = "sample_dict_page"
    elif selector == 3:
        redirection = "json_page"
    elif selector == 4:
        redirection = "dict_page"
    elif selector == 5:
        redirection == "sample_list_page"
    
    return redirect(url_for(redirection))

@app.route("/login", methods = ["POST", "GET"])
def login():
    if request.method == "POST":
        if request.form.get("key1") is None or request.form.get("key2") is None:
            return "OOPS"
        else:
            return request.form["key1"] + " | " + request.form["key2"]
    else:
        return "GET"

@app.route("/receive_json", methods = ["POST"])
def receive_json():
    if request.content_type != "application/json" or request.content_length == 0:
        return "OOPS"
    return request.get_json()

if __name__ == "__main__":
    host_ip = "127.0.0.1"
    if os.environ.get("FLASK_RUN_HOST") is not None:
        host_ip = os.environ["FLASK_RUN_HOST"]
    
    app.run(debug=True, host=host_ip)
