module.exports = {
  apps : [
    {
      name: 'tasks',
      script: 'api/src/index.js',
      env: {
        "PORT": 3000,
        "RUN_TASKS": "true"
      }
    },
    {
      name: 'tasksv2',
      script: 'apiv2/mainJob.js',
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
