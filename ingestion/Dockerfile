FROM node:20

WORKDIR /app

COPY package.json /app

RUN npm install

ENV IN_DOCKER=true
ENV PORT=4000
ENV TERM=xterm-256color

COPY . /app

EXPOSE 4000

CMD ["npm", "run", "start"]
