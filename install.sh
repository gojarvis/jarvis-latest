#!/bin/sh
git checkout release/0.1 >> /var/log/Jarvis/roie.log
npm install >> /var/log/Jarvis/roie.log
echo "\nInstalling client\n" >> /var/log/Jarvis/roie.log
cd client && npm i && >> /var/log/Jarvis/roie.log
echo "\nInstalling server\n" >> /var/log/Jarvis/roie.log
cd ../server && npm i && >> /var/log/Jarvis/roie.log
echo "\nInstalling atom plugin\n" >> /var/log/Jarvis/roie.log
cd ../plugins/atom && npm i && apm link && >> /var/log/Jarvis/roie.log
echo "\nBuilding chrome plugin\n" >> /var/log/Jarvis/roie.log
cd ../schrome && npm i && >> /var/log/Jarvis/roie.log
echo "\nInstalling sherpa view\n" >> /var/log/Jarvis/roie.log
open .
cd ../sherpa-view && npm i && apm link
echo "installed" >> 'installed.flag' >> /var/log/Jarvis/roie.log
