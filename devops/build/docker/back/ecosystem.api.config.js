module.exports = {
  apps : [
    {
      name: 'api',
      script: 'api/src/index.js',
      env: {
        "PORT": 3000
      }
    },
    {
      name: 'apiv2',
      script: 'apiv2/main.js',
      env: {
        "PORT": 3001
      }
    },
    {
      name: 'nginx',
      interpreter: 'sh',
      script: 'start-nginx.sh'
    }
  ],
};
