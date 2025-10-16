#!/bin/sh

docker build -t alexa-shopping-list-to-email .
docker run -v ./.env:/app/.env --rm -it -v "$PWD":/app alexa-shopping-list-to-email
