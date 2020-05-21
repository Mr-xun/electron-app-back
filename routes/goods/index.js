const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
const utils = require('../../public/javascripts/utils');
const moment = require('moment');
const qs = require('qs');
router.post('/list', (req, res) => {
	let { name, brand, pageSize, pageNum } = req.body;
	let query = {};
	DB.find('goods', { $or: [ query ] }, { pageNum, pageSize }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '获取商品列表失败',
				err
			});
		}
		return res.json({
			code: 0,
			list: data,
			total: total,
			currentPage: Number(pageNum) || 1,
			pageSize: Number(pageSize) || 10,
			msg: '获取商品列表成功'
		});
	});
});
router.post('/add', (req, res) => {
	let insertJson = {
		goods_name: req.body.goods_name, //名称
		goods_inventory: req.body.goods_inventory, //库存
		goods_specifica: req.body.goods_specifica, //规格
		goods_iptPrice: req.body.goods_iptPrice, //进货价
		goods_optPrice: req.body.goods_optPrice, //零售价
		goods_brandCode: req.body.goods_brandCode, //品牌编码
		// goods_tradePrices: [
		// 	//批发价列表
		// 	{
		// 		template_code: '',
		// 		template_name: '',
		// 		template_price: ''
		// 	}
		// ],
		goods_tradePrices: req.body.goods_priceTemplate, //批发价列表
		create_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
	};
	console.log(req.body, req.body.goods_priceTemplate[0].template_code, 222);
	let GOODS_COUNTER = 1; //商品数量
	DB.find('goods', { goods_name: req.body.goods_name }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '新增商品失败',
				err
			});
		}
		if (total) {
			return res.json({ code: -1, msg: '已有该商品，请重新录入' });
		} else {
			DB.findOneAndUpdate('field_counter', { role: 'admin' }, { $inc: { goods_counter: 1 } }, (data) => {
				if (data.value && data.value.goods_counter) {
					GOODS_COUNTER = data.value.goods_counter + 1;
				} else {
					DB.updateOne('field_counter', { role: 'admin' }, { goods_counter: 1 }, true, (err) => {
						if (err) {
							console.log(err);
							return res.json({
								code: -1,
								msg: '创建失败'
							});
						}
					});
				}
				let BRAND_NAME = '';
				let MERCHANT_NAME = '';
				DB.find('brand', { brand_code: insertJson.goods_brandCode }, (err, { data, total }) => {
					console.log(total, '2222222222');
					if (err) {
						return res.json({
							code: 5001,
							msg: '新增商品失败',
							err
						});
					}
					if (total) {
						BRAND_NAME = data[0].brand_name;
						DB.find(
							'merchant',
							{ merchant_code: req.body.goods_priceTemplate[0].template_code },
							(err, { data, total }) => {
								if (err) {
									return res.json({
										code: 5001,
										msg: '新增商品失败',
										err
									});
								}
								if (total) {
									let GOODS_NUM = utils.PrefixInteger(GOODS_COUNTER, 4);
									let GOODS_CODE =
										insertJson.goods_brandCode + 'GD' + utils.PrefixInteger(GOODS_COUNTER, 4); //BD001GD0001
									insertJson.goods_num = GOODS_NUM; //货号
									insertJson.goods_code = GOODS_CODE; //商品编码
									insertJson.goods_brandName = BRAND_NAME; //品牌名称
									DB.insertOne('goods', insertJson, (err) => {
										if (err) {
											return res.json(returnRes(5001, '商品添加失败', err));
										}
										return res.json({
											code: 0,
											msg: '商品添加成功'
										});
									});
								} else {
									return res.json({
										code: -1,
										msg: '添加失败，请先新建对应商户'
									});
								}
							}
						);
					} else {
						return res.json({
							code: -1,
							msg: '添加失败，请先新建对应品牌'
						});
					}
				});
			});
		}
	});
});
router.post('/del', (req, res) => {
	let { id } = req.body;
	DB.fakeDelete('goods', { _id: new DB.ObjectID(id) }, (err) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '删除商品失败',
				err
			});
		}
		return res.json({
			code: 0,
			msg: '删除商品成功'
		});
	});
});
router.post('/update', (req, res) => {
	let updateJson = {
		goods_name: req.body.goods_name, //名称
		goods_inventory: req.body.goods_inventory, //库存
		goods_specifica: req.body.goods_specifica, //规格
		goods_iptPrice: req.body.goods_iptPrice, //进货价
		goods_optPrice: req.body.goods_optPrice, //零售价
		goods_brandCode: req.body.goods_brandCode, //品牌编码
		goods_tradePrices: req.body.goods_priceTemplate //批发价列表
	};
	let BRAND_NAME = '';
	DB.find('brand', { brand_code: updateJson.goods_brandCode }, (err, { data, total }) => {
		if (err) {
			return res.json({
				code: 5001,
				msg: '新增商品失败',
				err
			});
		}
		if (total) {
			BRAND_NAME = data[0].brand_name;
			DB.find(
				'merchant',
				{ merchant_code: req.body.goods_priceTemplate[0].template_code },
				(err, { data, total }) => {
					if (err) {
						return res.json({
							code: 5001,
							msg: '新增商品失败',
							err
						});
					}
					if (total) {
						let GOODS_CODE = updateJson.goods_brandCode + 'GD' + req.body.goods_num; //BD001GD0001
						updateJson.goods_code = GOODS_CODE; //商品编码
						updateJson.goods_brandName = BRAND_NAME; //品牌名称
						DB.updateOne('goods', { _id: new DB.ObjectID(req.body.goods_id) }, updateJson, false, (err) => {
							if (err) {
								console.log(err);
								return res.json({
									code: 5001,
									msg: '商品更新失败',
									err
								});
							}
							return res.json({
								code: 0,
								msg: '商品更新成功'
							});
						});
					} else {
						return res.json({
							code: -1,
							msg: '添加失败，请先新建对应商户'
						});
					}
				}
			);
		} else {
			return res.json({
				code: -1,
				msg: '添加失败，请先新建对应品牌'
			});
		}
	});
});
router.post('/detail', (req, res) => {
	let { id } = req.body;
	DB.find('goods', { _id: new DB.ObjectID(id) }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '获取商品详情失败',
				err
			});
		}
		if (total) {
			return res.json({
				code: 0,
				data: data[0],
				msg: '获取商品详情成功'
			});
		} else {
			return res.json({
				code: -1,
				msg: '无该商品'
			});
		}
	});
});
module.exports = router;
