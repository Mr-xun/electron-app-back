const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
const MD5 = require('md5-node');
const verify = require('../../public/token.verify');
router.post('/login', (req, res, next) => {
	let { username, password } = req.body;
	DB.find('user', { username, password: MD5(password) }, (err, data) => {
		if (err) {
			console.log(err);
			return res.status(101).send(err);
		} else {
			if (data.length) {
				verify.setToken(username, data[0]._id).then((result) => {
					return res.json({
						token: result,
						userInfo: data[0],
						mesg: '登录成功',
						code: 0
					});
				});
			} else {
				res.json({
					mesg: '登录失败,无该用户',
					code: -1
				});
			}
		}
	});
});
router.post('/register', (req, res) => {
	let { username, password } = req.body;
	DB.insertOne('user', { username, password: MD5(password) }, (err, data) => {
		if (err) {
			console.log(err);
			return res.json({
				code: -1,
				msg: '注册失败'
			});
		}
		return res.json({
			code: 0,
			msg: '注册用户成功'
		});
	});
});
router.get('/list', (req, res) => {
	DB.find('user', {}, (err, data) => {
		if (err) {
			console.log(err);
			return;
		}
		return res.json({
			code: 0,
			list: data,
			msg: '获取用户列表成功'
		});
	});
});
module.exports = router;
