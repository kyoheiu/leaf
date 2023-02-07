FROM node:latest
WORKDIR /home/client
COPY . .
RUN apt-get install libnss3-dev
RUN yarn install
RUN yarn run build
EXPOSE 3000
ENTRYPOINT ["yarn", "run", "start"]
