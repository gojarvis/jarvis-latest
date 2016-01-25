# Sherpa

1. Install and start Neo4j.
2. Install and start Redis.
3. Run npm install in the following directories: `/server`, `/client`, `/plugins/schrome`
4. Start the client by running `npm start` in `/client`
5. Change to username in `/server/util/socket-manager.js` to your preferred username.
6. Start the server by running `gulp` in `/server` 
7. Start the plugin by running `gulp` in `/plugins/schrome` 
8. Load the unpacked extension that is created in `/plugins/schrome/dev` - details here - https://developer.chrome.com/extensions/getstarted#unpacked
9. Open "inspect view - background page" found in `chrome://extenstion`.
10. You should see an error indicating a script cannot be fetched from localhost:3333. You should copy the link, paste it in a new tab, and navigate to it. Make sure to hit "proceed anyway" under "advanced" when showed Chrome's security notice, until you can see the script content on the page. 
11. Reload the chrome extension. 
12. Open the client on `localhost:8888` preferrably on a seperate screen that would be open at all times.
13. You might need to restart the server after attempting to start for the first time. 

Wit.ai Console - https://wit.ai/roieki/sherpa-demo/settings
