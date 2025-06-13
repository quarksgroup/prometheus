#!/bin/bash


GOOS=linux GOARCH=amd64 make build || exit 1
docker build -t registry.andasy.io/prometheus:latest . || exit 1
docker push registry.andasy.io/prometheus:latest
