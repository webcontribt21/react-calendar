FROM node:12.2.0-alpine as build

ARG STAGE=staging

RUN mkdir -p /app
RUN chown node /app
RUN chmod -R 700 /app
USER node

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY ./package.json /app/.
COPY ./yarn.lock /app/.

USER node

RUN yarn install --pure-lockfile

COPY . /app

USER root 
RUN yarn build:$STAGE

EXPOSE 8080

CMD [ "yarn", "start" ]
