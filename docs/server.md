# Server

## `main.js`

### Dependencies
1. `controllers/graph.js`
1. `utils/socket-manager`

historymanager.js
* saves events into rethinkdb, emits 'system-event'

deep.js

contextManager.js
* handles relating neo4j nodes to each other
* saves context

atom.js
chrome.js
* handlers for respective clients

metdataManager.js
* gets stuff from alchemy

proactive.js

graph.js
*
