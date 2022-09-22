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
ENV PM2_PUBLIC_KEY=68k4b2g9xgxbyx1 PM2_SECRET_KEY=9tm93bkgcq1k6uw

WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/src/app/ecosystem.config.js ./
# COPY --from=BUILD_IMAGE /usr/src/app/.env ./

VOLUME [ "/usr/src/app/dist/logs", "/usr/src/app/dist/public" ]
EXPOSE 4001
CMD ["pm2-runtime", "ecosystem.config.js"]