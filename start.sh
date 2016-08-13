#!/bin/sh
echo "====================================" >> /var/log/Jarvis/roie.log
echo "====================================" >> /var/log/Jarvis/roie.log
echo "====================================" >> /var/log/Jarvis/roie.log
echo "====================================" >> /var/log/Jarvis/roie.log


# less `pwd`/node_modules/pm2/bin/pm2 >> /var/log/Jarvis/roie.log
echo `date`"TEST JARVIS" >> /var/log/Jarvis/roie.log
cd `pwd`/client/
echo `pwd` >> /var/log/Jarvis/roie.log
npm start &

cd ../server/
echo `pwd` >> /var/log/Jarvis/roie.log
npm run nodemon &
echo `date`"AFTER LAUNCHING" >> /var/log/Jarvis/roie.log
