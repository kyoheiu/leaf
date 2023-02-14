FROM gcr.io/zenika-hub/alpine-chrome:with-node
WORKDIR /home/client
COPY . .
RUN yarn install
RUN yarn run build
EXPOSE 3000
ENTRYPOINT ["yarn", "run", "start"]
