module.exports = {
  apps: [{
    name: "soul-harbor",
    script: "./dist/bin/server.js", // 执行文件
    cwd: "./", // 根目录
    args: "", // 传递给脚本的参数
    interpreter: "", // 指定的脚本解释器
    interpreter_args: "", // 传递给解释器的参数
    watch: true, // 是否监听文件变动然后重启
    ignore_watch: [ // 不用监听的文件
      "node_modules",
      "public",
      "logs",
      "dist/public",
      "dist/logs",
    ],
    max_memory_restart: "500M", // 最大内存限制数，超出自动重启
    error_file: "./dist/logs/app-err.log", // 错误日志文件
    out_file: "./dist/logs/app-out.log", // 正常日志文件
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    min_uptime: "60s", // 应用运行少于时间被认为是异常启动
    max_restarts: 30, // 最大异常重启次数，即小于min_uptime运行时间重启次数；
    autorestart: true, // 默认为true, 发生异常的情况下自动重启
    cron_restart: "", // crontab时间格式重启应用，目前只支持cluster模式;
    restart_delay: "60s", // 异常重启情况下，延时重启时间
    source_map_support: true,
  }]
};
