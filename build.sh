#!/bin/bash

git checkout main
git pull

CURRENT_TIME=$(date +%Y-%m-%d_%H-%M-%S)

PROJECT_NAME=replit-hiring-hero

docker build -t $PROJECT_NAME:$CURRENT_TIME -t $PROJECT_NAME:latest .

