var express = require('express');
var router = express.Router();
var app = express();

router.get('/', function(request, res, next) {
	res.send('OK');
});

module.exports = router;