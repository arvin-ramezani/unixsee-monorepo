module.exports = {
  apps: [
    {
      name: "unixsee-client-staging",
      cwd: "/var/www/client",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env_file: "/var/www/client/.env",
      watch: false,
      autorestart: true,
    },
  ],
};
