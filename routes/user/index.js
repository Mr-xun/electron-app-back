const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
const MD5 = require('md5-node');
const verify = require('../../public/token.verify');
/**
 * 用户资源接口
 * 
 */

router.post('/login', (req, res, next) => {
	let { username, password } = req.body;
	DB.find('user', { username, password: MD5(password) }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json({
				mesg: '登录失败,无该用户',
				code: 5001,
				err
			});
		} else {
			if (total) {
				verify.setToken(username, data[0]._id).then((result) => {
					return res.json({
						token: result,
						userInfo: data[0],
						mesg: '登录成功',
						code: 0
					});
				});
			} else {
				return res.json({
					mesg: '登录失败,无该用户',
					code: -1
				});
			}
		}
	});
});
router.get('/currentUser', (req, res) => {
	let { username, _id } = req.data;
	DB.find('user', { username: username, _id: new DB.ObjectID(_id) }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				mesg: '获取当前用户失败',
				err
			});
		}
		if (total) {
			let user = {
				username: data[0].username,
				id: data[0]._id,
				sex: null
			};
			return res.json({
				code: 0,
				msg: '获取当前用户成功',
				userInfo: user
			});
		} else {
			return res.json({
				mesg: '获取当前用户失败',
				code: -1
			});
		}
	});
});
router.post('/register', (req, res) => {
	let { username, password } = req.body;
	DB.insertOne('user', { username, password: MD5(password) }, (err, data) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '注册失败',
				err
			});
		}
		return res.json({
			code: 0,
			msg: '注册用户成功'
		});
	});
});
router.post('/del', (req, res) => {
	let { userId } = req.body;
	DB.fakeDelete('user', { _id: new DB.ObjectID(userId) }, (err, data) => {
		if (err) {
			console.log(err);
			return res.send({
				code: 5001,
				msg: '删除用户失败',
				err
			});
		}
		return res.send({
			code: 0,
			msg: '删除用户成功'
		});
	});
});
router.post('/list', (req, res) => {
	let { username, pageNum, pageSize } = req.body;
	let query = {};
	if (username) {
		query.username = username;
	}
	DB.find('user', { $or: [ query ] }, { pageNum, pageSize }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '获取用户列表失败',
				err
			});
		}
		return res.json({
			code: 0,
			list: data,
			total: total,
			currentPage: Number(pageNum) || 1,
			pageSize: Number(pageSize) || 10,
			msg: '获取用户列表成功'
		});
	});
});
module.exports = router;
