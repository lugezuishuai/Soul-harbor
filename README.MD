# soul-harbor

<font size = 6>**介绍**</font>

./Back-end：后端相关文件

./Front-end: 前端相关文件

Windows 用户请移步到windows分支（做了一些Windows系统的兼容）

<font size = 6>**使用**</font>

<font size = 4>**后端**</font>

安装依赖：`cd ./Back-end && npm install`

构建后端dist文件夹：`npm run build`

使用pm2开启后端服务：`npm run start`

使用pm2停止后端服务：`npm run stop`

使用pm2重启后端服务：`npm run restart`

使用pm2杀掉后端服务进程：`npm run delete`

开启后端本地监听：`npm run watch`

后端本地服务热更新：`npm run watchDev`

<font size = 4>**前端**</font>

安装依赖：`cd ./Front-end && npm install`

开启本地前端服务：`npm run start`

构建前端dist文件夹：`npm run build`