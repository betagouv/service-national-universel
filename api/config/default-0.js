/*
This file is only needed to supress a node-config warning :
WARNING: NODE_APP_INSTANCE value of '0' did not match any instance config file names.

NODE_APP_INSTANCE overlaps between pm2 and node-config:
- https://pm2.io/docs/runtime/guide/load-balancing/#cluster-environment-variable
- https://github.com/node-config/node-config/wiki/Strict-Mode
- https://github.com/Unitech/pm2/issues/2045
*/

module.exports = {};
