FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install -y python3-pip python-dev build-essential
COPY ./app ./app
COPY requirements.txt .
ENV FLASK_APP="main.py"
ENV FLASK_RUN_HOST=0.0.0.0
WORKDIR ./app
RUN pip3 install -r /requirements.txt
EXPOSE 5000
ENTRYPOINT ["python3"]
CMD ["main.py"]