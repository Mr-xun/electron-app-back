const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
const utils = require('../../public/javascripts/utils');
const moment = require('moment');
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
		merchant_name: req.body.merchant_name,
		merchant_concact: req.body.merchant_concact,
		merchant_concactMethod: req.body.merchant_concactMethod,
		merchant_area: req.body.merchant_area,
		merchant_adress: req.body.merchant_adress,
		merchant_note: req.body.merchant_note,
		merchant_icon: req.body.merchant_icon || 'http://' + req.headers.host + '/images/20200518163731_18641.jpg',
		create_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
	};
	let MERCHANT_COUNTER = 1; //商户编码
	DB.find('merchant', { merchant_name: insertJson.merchant_name }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '创建失败',
				err
			});
		}
		if (total) {
			return res.json({
				code: -1,
				msg: '该商户已被注册'
			});
		} else {
			DB.findOneAndUpdate('field_counter', { role: 'admin' }, { $inc: { merchant_counter: 1 } }, (data) => {
				if (data.value && data.value.merchant_counter) {
					MERCHANT_COUNTER = data.value.merchant_counter + 1;
				} else {
					DB.updateOne('field_counter', { role: 'admin' }, { merchant_counter: 1 }, true, (err) => {
						if (err) {
							console.log(err);
							return res.json({
								code: -1,
								msg: '创建失败'
							});
						}
					});
				}
				let MERCHANT_CODE = 'MC' + utils.PrefixInteger(MERCHANT_COUNTER, 3);
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
		}
	});
});
router.post('/update', (req, res) => {
	let updateJson = {
		merchant_name: req.body.merchant_name,
		merchant_concact: req.body.merchant_concact,
		merchant_concactMethod: req.body.merchant_concactMethod,
		merchant_area: req.body.merchant_area,
		merchant_adress: req.body.merchant_adress,
		merchant_note: req.body.merchant_note,
		merchant_icon: req.body.merchant_icon || 'http://' + req.headers.host + '/images/20200518163731_18641.jpg'
	};
	DB.updateOne('merchant', { _id: new DB.ObjectID(req.body.merchant_id) }, updateJson, false, (err) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '商户更新失败',
				err
			});
		}
		DB.updateMany(
			'goods',
			{ 'goods_tradePriceTemps.template_code': req.body.merchant_code },
			{
				$set: {
					'goods_tradePriceTemps.$.template_name': updateJson.merchant_name
				}
			},
			(err) => {
				if (err) {
					console.log(error + ':' + err, '更新商品价格模板名称失败');
				} else {
					console.log('更新商品价格模板名称成功');
				}
			}
		);
		return res.json({
			code: 0,
			msg: '商户更新成功'
		});
	});
});
router.post('/del', (req, res) => {
	let { id, merchant_code } = req.body;
	DB.fakeDelete('merchant', { _id: new DB.ObjectID(id) }, (err) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '删除商户失败',
				err
			});
		}
		DB.updateMany('goods', {}, { $pull: { goods_tradePriceTemps: { template_code: merchant_code } } }, (err) => {
			if (err) {
				console.log(error + ':' + err, '删除所有存在改商户的价格模板失败');
			} else {
				console.log('删除所有存在改商户的价格模板成功');
			}
		});
		return res.json({
			code: 0,
			msg: '删除商户成功'
		});
	});
});
module.exports = router;
