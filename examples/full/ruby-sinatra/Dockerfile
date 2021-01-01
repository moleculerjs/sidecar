FROM ruby:2.7-alpine

RUN apk add build-base

WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN bundle install

COPY . .

EXPOSE 5006

CMD ruby server.rb
