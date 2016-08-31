#!/bin/sh
echo "===================================="
echo "============  JARVIS   ============="
echo "===================================="
echo "===================================="

# less `pwd`/node_modules/pm2/bin/pm2
echo `date`"STARTING JARVIS"
# npm install --save express
`pwd`/node_modules/pm2/bin/pm2 status
`pwd`/node_modules/pm2/bin/pm2 update
`pwd`/node_modules/pm2/bin/pm2 start `pwd`/jarvis.json

echo `date`"AFTER LAUNCHING"
