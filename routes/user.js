var express = require('express');
var router = express.Router();
const user = require('./user/index.js');
/* GET users listing. */
router.use('/', user);
module.exports = router;
