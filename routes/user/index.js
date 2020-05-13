const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
const MD5 = require('md5-node');
const verify = require('../../public/token.verify')
const setting = require('../../token.config')


router.post('/', (req, res) => {
	console.log(req.body, req.body.name, 11);
	
	DB.find('user', { name: '荀潇' }, (err, data) => {
		if (err) {
			console.log(err);
			return false;
		} else {
			res.send({ list: data });
		}
	});
});
module.exports = router;
