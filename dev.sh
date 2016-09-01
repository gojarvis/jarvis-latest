#!/bin/sh
echo "===================================="
echo "==========  JARVIS - DEV =========="
echo "===================================="
echo "===================================="


# less `pwd`/node_modules/pm2/bin/pm2
echo `date`"TEST JARVIS"
# npm install --save express
`pwd`/node_modules/pm2/bin/pm2 status
`pwd`/node_modules/pm2/bin/pm2 update
`pwd`/node_modules/pm2/bin/pm2 start `pwd`/jarvis-dev.json

echo `date`"AFTER LAUNCHING"
