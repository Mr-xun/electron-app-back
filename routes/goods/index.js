const transliterate = require('transliteration');
const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
const utils = require('../../public/javascripts/utils');
const moment = require('moment');
router.post('/list', (req, res) => {
	let { goods_name, goods_brand, goods_num, goods_sign, pageSize, pageNum } = req.body;
	let query = {};

	if (goods_name) {
		query.goods_name = goods_name;
	}
	if (goods_brand) {
		query.goods_brandCode = goods_brand;
	}
	if (goods_num) {
		query.goods_num = goods_num;
	}
	if (goods_sign) {
		let str = '';
		goods_sign.split('').forEach((item) => {
			str += `(?=.*${item})`;
		});
		let regexp = new RegExp(str);
		query.goods_sign = regexp;
	}
	DB.find(
		'goods',
		query,
		{
			pageNum,
			pageSize
		},
		(err, { data, total }) => {
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
		}
	);
});
router.post('/add', (req, res) => {
	if (!req.body.goods_name) {
		return res.json({
			code: -1,
			msg: '请输入商品名称'
		});
	}
	if (!req.body.goods_brandCode) {
		return res.json({
			code: -1,
			msg: '请选择商品品牌'
		});
	}
	let insertJson = {
		goods_name: req.body.goods_name, //名称
		goods_inventory: req.body.goods_inventory || 0, //库存
		goods_specifica: req.body.goods_specifica || 0, //规格
		goods_iptPrice: req.body.goods_iptPrice || 0, //进货价
		goods_optPrice: req.body.goods_optPrice || 0, //零售价
		goods_pubTradePrice: req.body.goods_pubTradePrice || 0, //通用批发价
		goods_brandCode: req.body.goods_brandCode, //品牌编码
		goods_tradePriceTemps: req.body.goods_tradePriceTemps || [], //批发价模板列表
		create_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
	};
	DB.find(
		'goods',
		{
			goods_name: req.body.goods_name
		},
		(err, { data, total }) => {
			if (err) {
				console.log(err);
				return res.json({
					code: 5001,
					msg: '新增商品失败',
					err
				});
			}
			if (total) {
				return res.json({
					code: -1,
					msg: '已有该商品，请重新录入'
				});
			} else {
				let BRAND_NAME = '';
				DB.find(
					'brand',
					{
						brand_code: insertJson.goods_brandCode
					},
					(err, { data, total }) => {
						if (err) {
							return res.json({
								code: 5001,
								msg: '新增商品失败',
								err
							});
						}
						if (total) {
							BRAND_NAME = data[0].brand_name;
							let GOODS_COUNTER = 1; //商品数量
							DB.findOneAndUpdate(
								'field_counter',
								{
									role: 'admin'
								},
								{
									$inc: {
										goods_counter: 1
									}
								},
								(data) => {
									if (data.value && data.value.goods_counter) {
										GOODS_COUNTER = data.value.goods_counter + 1;
									} else {
										DB.updateOne(
											'field_counter',
											{
												role: 'admin'
											},
											{
												goods_counter: 1
											},
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
									let GOODS_NUM = utils.PrefixInteger(GOODS_COUNTER, 4);
									let GOODS_CODE = insertJson.goods_brandCode + 'GD' + GOODS_NUM; //BD001GD0001
									insertJson.goods_num = GOODS_NUM; //货号
									insertJson.goods_code = GOODS_CODE; //商品编码
									insertJson.goods_brandName = BRAND_NAME; //品牌名称
									let trStr =
										GOODS_NUM +
										transliterate.slugify(insertJson.goods_name, {
											lowercase: true
										}) +insertJson.goods_name;
									insertJson.goods_sign = trStr.replace(/-/g, '');
									DB.insertOne('goods', insertJson, (err) => {
										if (err) {
											return res.json(returnRes(5001, '商品添加失败', err));
										}
										return res.json({
											code: 0,
											msg: '商品添加成功'
										});
									});
								}
							);
						} else {
							return res.json({
								code: -1,
								msg: '添加失败，请先新建对应品牌'
							});
						}
					}
				);
			}
		}
	);
});
router.post('/del', (req, res) => {
	let { id } = req.body;
	DB.fakeDelete(
		'goods',
		{
			_id: new DB.ObjectID(id)
		},
		(err) => {
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
		}
	);
});
router.post('/update', (req, res) => {
	let updateJson = {
		goods_name: req.body.goods_name, //名称
		goods_inventory: req.body.goods_inventory, //库存
		goods_specifica: req.body.goods_specifica, //规格
		goods_iptPrice: req.body.goods_iptPrice, //进货价
		goods_optPrice: req.body.goods_optPrice, //零售价
		goods_publicPrice: req.body.goods_publicPrice,
		goods_brandCode: req.body.goods_brandCode, //品牌编码
		goods_tradePriceTemps: req.body.goods_tradePriceTemps //批发价列表
	};
	let BRAND_NAME = '';
	DB.find(
		'brand',
		{
			brand_code: updateJson.goods_brandCode
		},
		(err, { data, total }) => {
			if (err) {
				return res.json({
					code: 5001,
					msg: '新增商品失败',
					err
				});
			}
			if (total) {
				BRAND_NAME = data[0].brand_name;
				let GOODS_CODE = updateJson.goods_brandCode + 'GD' + req.body.goods_num; //BD001GD0001
				updateJson.goods_code = GOODS_CODE; //商品编码
				updateJson.goods_brandName = BRAND_NAME; //品牌名称
				DB.updateOne(
					'goods',
					{
						_id: new DB.ObjectID(req.body.goods_id)
					},
					updateJson,
					false,
					(err) => {
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
					}
				);
			} else {
				return res.json({
					code: -1,
					msg: '添加失败，请先新建对应品牌'
				});
			}
		}
	);
});
router.post('/detail', (req, res) => {
	let { id } = req.body;
	DB.find(
		'goods',
		{
			_id: new DB.ObjectID(id)
		},
		(err, { data, total }) => {
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
		}
	);
});
module.exports = router;
