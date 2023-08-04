FROM node:18-slim

EXPOSE 3000

RUN apt-get update && \
    apt-get install -y npm python3 git make bash && \
    npm install --location=global npm@9.6.4
