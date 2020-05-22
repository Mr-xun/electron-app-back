const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
router.post('/add', async (req, res) => {
	let { merchant_code, merchant_name, goods_id, goods_price } = req.body;
	DB.find(
		'goods',
		{ _id: new DB.ObjectID(goods_id), 'goods_tradePriceTemps.template_code': merchant_code },
		(err, { data, total }) => {
			if (err) {
				console.log(err);
				return res.json({
					code: 5001,
					msg: '添加模板价格失败',
					err
				});
			}
			if (total) {
				return res.json({
					code: -1,
					msg: '该模板下已有该商品'
				});
			} else {
				DB.updateCustom(
					'goods',
					{
						_id: new DB.ObjectID(goods_id)
					},
					{
						$addToSet: {
							//去重复更新数组
							goods_tradePriceTemps: {
								template_code: merchant_code,
								template_name: merchant_name,
								template_price: goods_price
							}
						}
					},
					true,
					(err, data) => {
						if (err) {
							return res.json({
								code: 5001,
								msg: '添加模板价格失败',
								err
							});
						} else {
							return res.json({
								code: 0,
								msg: '添加模板价格成功'
							});
						}
					}
				);
			}
		}
	);
});
router.post('/del', (req, res) => {
	let { merchant_code } = req.body;
	DB.updateMany('goods', {}, { $pull: { goods_tradePriceTemps: { template_code: merchant_code } } }, (err, data) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '删除价格模板失败',
				err
			});
		}
		return res.json({
			code: 0,
			msg: '删除价格模板成功'
		});
	});
});
module.exports = router;
