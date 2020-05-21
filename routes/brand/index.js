const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
const utils = require('../../public/javascripts/utils');
const moment = require('moment');
function returnRes(code, msg, err) {
	return {
		code,
		msg,
		err
	};
}
router.get('/list', (req, res) => {
	DB.find('brand', {}, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json(returnRes(5001, '品牌添加失败', err));
		}
		return res.json({
			code: 0,
			data: data,
			msg: '品牌查询成功'
		});
	});
});
router.post('/add', (req, res) => {
	let insertJson = {
		brand_name: req.body.brand_name
	};
	let BRAND_COUNTER = 1;
	DB.find('brand', { brand_name: insertJson.brand_name }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json(returnRes(5001, '品牌添加失败', err));
		}
		if (total) {
			return res.json({
				code: -1,
				msg: '已有该品牌，请重新编辑'
			});
		} else {
			DB.findOneAndUpdate('field_counter', { role: 'admin' }, { $inc: { brand_counter: 1 } }, (data) => {
				if (data.value && data.value.brand_counter) {
					BRAND_COUNTER = data.value.brand_counter + 1;
				} else {
					DB.updateOne('field_counter', { role: 'admin' }, { brand_counter: 1 }, true, (err) => {
						if (err) {
							console.log(err);
							return res.json({
								code: -1,
								msg: '创建失败'
							});
						}
					});
				}
				let BRAND_CODE = 'BD' + utils.PrefixInteger(BRAND_COUNTER, 3);
				insertJson.brand_code = BRAND_CODE;
				DB.insertOne('brand', insertJson, (err) => {
					if (err) {
						return res.json(returnRes(5001, '品牌添加失败', err));
					}
					return res.json({
						code: 0,
						msg: '品牌添加成功'
					});
				});
			});
		}
	});
});
router.post('/update', (req, res) => {
	let { brand_name, id } = req.body;
	let updateJson = {
		brand_name: brand_name
	};
	DB.updateOne('brand', { _id: new DB.ObjectID(id) }, updateJson, false, (err) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '品牌更新失败',
				err
			});
		}
		return res.json({
			code: 0,
			msg: '品牌更新成功'
		});
	});
});
module.exports = router;
