import os
import logging

from flask import Flask

app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)

@app.route("/")
def index():
    app.logger.info("Logging test.")
    return "Index Site"

if __name__ == "__main__":
    app.run(debug=True, host=os.environ["FLASK_RUN_HOST"])
