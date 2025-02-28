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
        "PORT": 3005,
        "RUN_TASKS": "true"
      }
    },
    {
      name: 'apiv2',
      script: 'apiv2/main.js',
      env: {
        "PORT": 3006
      }
    },
    {
      name: 'tasksv2',
      script: 'apiv2/mainJob.js',
    },
    {
      name: 'nginx',
      interpreter: 'nginx',
      interpreter_args: '-c',
      script: 'nginx.conf',
    }
  ],
};
