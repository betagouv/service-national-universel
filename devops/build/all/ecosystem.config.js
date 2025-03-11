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
      name: 'tasks',
      script: 'api/src/index.js',
      env: {
        "PORT": 3002,
        "RUN_TASKS": "true"
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
      name: 'tasksv2',
      script: 'apiv2/mainJob.js',
      env: {
        "PORT": 3003
      }
    },
    {
      name: 'nginx',
      interpreter: 'bash',
      script: 'start-nginx.sh'
    }
  ],
};
