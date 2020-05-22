const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
router.get('/brand', (req, res) => {
	DB.find('brand', {}, (err, { data, total }) => {
		let retrunData = [];
		data.forEach((item) => {
			retrunData.push({
				brand_name: item.brand_name,
				brand_code: item.brand_code
			});
		});
		if (err) {
			return res.json({
				code: 5001,
				msg: '查询品牌失败',
				err
			});
		}
		return res.json({
			code: 0,
			list: retrunData,
			meg: '获取品牌成功'
		});
	});
});
router.get('/merchant', (req, res) => {
	DB.find('merchant', {}, (err, { data, total }) => {
		if (err) {
			return res.json({
				code: 5001,
				msg: '查询商户列表失败'
			});
		}
		let retrunData = [];
		data.forEach((item) => {
			retrunData.push({
				merchant_name: item.merchant_name,
				merchant_code: item.merchant_code
			});
		});
		return res.json({
			code: 0,
			list: retrunData,
			msg: '获取商户成功'
		});
	});
});
module.exports = router;
