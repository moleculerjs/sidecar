FROM python:3.9-alpine

#RUN apk --update add bash nano

WORKDIR /app
COPY ./requirements.txt .

RUN pip install -r requirements.txt

COPY . .

ENV FLASK_APP=server.py
EXPOSE 5000

CMD ["python", "server.py"]
