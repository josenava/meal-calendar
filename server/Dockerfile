FROM python:3.8-alpine as pro

ENV APP_DIR /app
ENV USER meals

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "$APP_DIR" \
    "$USER"

WORKDIR $APP_DIR

COPY requirements.txt .

RUN apk add build-base bash libressl-dev libffi-dev postgresql-dev \
    && pip install -r requirements.txt

USER "$USER"

FROM pro as dev

COPY requirements-dev.txt .

USER root
RUN pip install -r requirements-dev.txt


USER "$USER"
