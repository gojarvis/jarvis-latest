#!/bin/sh
echo "\nInstalling client\n"
cd client && npm i &&
echo "\nInstalling server\n"
cd ../server && npm i &&
echo "\nInstalling atom plugin\n"
cd ../plugins/atom && npm i && apm link &&
echo "\nBuilding chrome plugin\n"
cd ../schrome && npm i &&
echo "\nInstalling sherpa view\n"
cd ../sherpa-view && npm i && apm link
