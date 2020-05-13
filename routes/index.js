var express = require('express');
var router = express.Router();
const verify = require('../public/token.verify')
const setting = require('../token.config')
/* GET home page. */
router.get('/', function (req, res, next) {
  // 生成token
  res.render('index', { title: 'Express' });
});

module.exports = router;
