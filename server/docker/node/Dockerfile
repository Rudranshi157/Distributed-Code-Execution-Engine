FROM node:24-slim

RUN userdel -r node && \
    useradd -m -u 1000 -U runner

USER runner

WORKDIR /app
