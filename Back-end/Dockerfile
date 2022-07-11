FROM node:14.16.1

# Create app directory
WORKDIR /usr/src/soul-harbor/back-end

# Bundle app source
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4001
CMD npm run watchDev