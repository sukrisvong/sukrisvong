# syntax=docker/dockerfile:1

ARG RUBY_VERSION=3.4.4
FROM docker.io/library/ruby:$RUBY_VERSION-slim

WORKDIR /sandbox

COPY . .

RUN groupadd --system --gid 1000 sandbox && \
    useradd sandbox --uid 1000 --gid 1000 --no-create-home

USER 1000:1000

EXPOSE 3001

CMD ["ruby", "server.rb"]
