module.exports = {
  apps: [
    {
      name: "unixsee-monitor-agent",
      cwd: "/var/www/monitor-agent",
      script: "dist/index.js",
      interpreter: "node",
      interpreter_args: ["--env-file=/var/www/monitor-agent/.env"],
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

// module.exports = {
//   apps: [
//     {
//       name: "unixsee-monitor-agent",
//       cwd: "/var/www/monitor-agent",
//       script: "dist/index.js",
//       interpreter: "node",
//       node_args: "--env-file=.env",
//       instances: 1,
//       exec_mode: "fork",
//       autorestart: true,
//       watch: false,
//       max_restarts: 10,
//       restart_delay: 3000,
//       max_memory_restart: "256M",
//     },
//   ],
// };
