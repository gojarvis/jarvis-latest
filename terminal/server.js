var term = require('term.js');
var express = require('express');
var app = express();

app.use(term.middleware());

app.listen(8080);
