#!/bin/sh
echo "===================================="
echo "============  JARVIS   ============="
echo "===================================="
echo "===================================="

# npm install --save express
`pwd`/node_modules/pm2/bin/pm2 status
`pwd`/node_modules/pm2/bin/pm2 update
`pwd`/node_modules/pm2/bin/pm2 start `pwd`/sherpa.json

echo `date`"AFTER LAUNCHING"
