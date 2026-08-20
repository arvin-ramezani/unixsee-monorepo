module.exports = {
  apps: [
    {
      name: "unixsee-admin",
      cwd: "/var/www/panel.unixsee.com",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      env_file: "/var/www/panel.unixsee.com/.env",
      watch: false,
      autorestart: true,
    },
  ],
};
