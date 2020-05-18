const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
const utils = require('../../public/javascripts/utils');
/**
 * 商户资源接口
 */
router.post('/list', (req, res) => {
	let { name, contact, pageNum, pageSize } = req.body;
	let query = {};
	if (name) {
		query.merchant_name = name;
	}
	if (contact) {
		query.merchant_concact = contact;
	}
	DB.find('merchant', { $or: [ query ] }, { pageNum, pageSize }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,

				msg: '获取商户列表失败',
				err
			});
		}
		return res.json({
			code: 0,
			list: data,
			total: total,
			currentPage: Number(pageNum) || 1,
			pageSize: Number(pageSize) || 10,
			msg: '获取商户列表成功'
		});
	});
});
router.post('/add', (req, res) => {
	let insertJson = {
		merchant_name: req.body.name,
		merchant_concact: req.body.concact,
		merchant_concactMethod: req.body.phone,
		merchant_area: req.body.area,
		merchant_adress: req.body.adress,
		merchant_note: req.body.note,
		merchant_icon: req.body.icon || '/images/20200518163731_18641.jpg'
	};
	let MERCHANT_COUNTER = 1; //商户编码
	let { username, _id } = req.data;
	DB.findOneAndUpdate('field_counter', { _id: new DB.ObjectID(_id) }, { $inc: { merchant_counter: 1 } }, (data) => {
		if (data.value && data.value.merchant_counter) {
			MERCHANT_COUNTER = data.value.merchant_counter;
		} else {
			DB.updateOne(
				'field_counter',
				{ _id: new DB.ObjectID(_id) },
				{ merchant_counter: 1, username: username },
				true,
				(err) => {
					if (err) {
						console.log(err);
						return res.json({
							code: -1,
							msg: '创建失败'
						});
					}
				}
			);
		}
		let MERCHANT_CODE = 'MC' + utils.PrefixInteger(MERCHANT_COUNTER, 4);
		insertJson.merchant_code = MERCHANT_CODE;
		DB.insertOne('merchant', insertJson, (err) => {
			if (err) {
				console.log(err);
				return res.json({
					code: 5001,
					msg: '创建商户失败',
					err
				});
			}
			return res.json({
				code: 0,
				msg: '创建商户成功'
			});
		});
	});
});
router.post('/update', (req, res) => {
	let updateJson = {
		merchant_name: req.body.name,
		merchant_concact: req.body.concact,
		merchant_concactMethod: req.body.phone,
		merchant_area: req.body.area,
		merchant_adress: req.body.adress,
		merchant_note: req.body.note,
		merchant_icon: req.body.icon || '/images/20200518163731_18641.jpg'
	};
	DB.updateOne('merchant', { _id: new DB.ObjectID(req.body.id) }, updateJson, false, (err) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '商户更新失败',
				err
			});
		}
		return res.json({
			code: 0,
			msg: '商户更新成功'
		});
	});
});
router.post('/del', (req, res) => {
	let { id } = req.body;
	DB.fakeDelete('merchant', { _id: new DB.ObjectID(id) }, (err) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '删除商户失败',
				err
			});
		}
		return res.json({
			code: 0,
			msg: '删除商户成功'
		});
	});
});
module.exports = router;
