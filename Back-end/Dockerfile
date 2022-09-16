######## step 1 ########
FROM node:14.16.1-alpine as BUILD_IMAGE

# 指定工作目录
WORKDIR /usr/src/app

# 拷贝package.json文件和package-lock.json文件
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# remove development dependencies
RUN npm prune --production

######## step 2 ########
FROM node:14.16.1-alpine

# 全局安装pm2
RUN npm install pm2 -g
ENV PM2_PUBLIC_KEY cm74cntl45f9upd
ENV PM2_SECRET_KEY ufe8bp8ppfd8u8z

WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/src/app/ecosystem.config.js ./

EXPOSE 4001
CMD ["pm2-runtime", "ecosystem.config.js"]