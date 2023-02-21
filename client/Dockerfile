FROM alpine
WORKDIR /home/client
COPY . .

# Installs latest Chromium (100) package.
RUN apk add --no-cache \
      nodejs \
      yarn

RUN yarn install
RUN yarn run build
EXPOSE 3000
ENTRYPOINT ["yarn", "run", "start"]