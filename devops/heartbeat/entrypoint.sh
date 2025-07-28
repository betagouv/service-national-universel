  #!/bin/sh
  envsubst < /etc/heartbeat/heartbeat.yml.template > /etc/heartbeat/heartbeat.yml
  exec heartbeat "$@"