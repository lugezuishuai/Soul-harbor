module.exports = {
  apps: [
    {
      name: 'soul-harbor', // app名称
      script: './dist/bin/server.js', // 执行文件
      cwd: './', // 根目录
      args: '', // 传递给脚本的参数
      interpreter: '', // 指定的脚本解释器
      interpreter_args: '', // 传递给解释器的参数
      watch: ['./dist'], // 是否监听文件变动然后重启
      ignore_watch: [
        // 不用监听的文件
        './dist/public',
        './dist/logs',
      ],
      watch_options: {
        followSymlinks: false,
      },
      exec_mode: 'cluster', // 应用启动模式，支持fork和cluster模式(fork | cluster)，默认是fork
      max_memory_restart: '500M', // 最大内存限制数，超出自动重启
      error_file: './dist/logs/soul-harbor-err.log', // 错误日志文件
      out_file: './dist/logs/soul-harbor-out.log', // 正常日志文件
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      min_uptime: '60s', // 应用运行少于时间被认为是异常启动
      max_restarts: 30, // 最大异常重启次数，即小于min_uptime运行时间重启次数；
      autorestart: true, // 默认为true, 发生异常的情况下自动重启
      cron_restart: '', // crontab时间格式重启应用，目前只支持cluster模式;
      restart_delay: 60000, // 异常重启情况下，延时重启时间，设置为60s
      source_map_support: true, // 开启sourceMap支持
      env: {
        // 默认
        NODE_ENV: 'production',
      },
      env_dev: {
        // 需要在命令行中指定 --env dev
        NODE_ENV: 'development',
      },
      env_test: {
        // 需要在命令行中指定 --env test
        NODE_ENV: 'test',
      },
    },
  ],
  deploy: {
    production: {
      user: 'jackson',
      host: '47.106.132.36',
      ref: 'origin/master', // 要拉取的git分支
      repo: 'https://github.com/lugezuishuai/Soul-harbor.git', // 远程仓库地址
      path: '/home/jackson/Soul-harbor', // 拉取到服务器某个目录下
      'post-deploy': 'cd ./Back-end && npm i && npm start', // 部署后执行
    },
  },
};
