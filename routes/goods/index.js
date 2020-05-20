const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
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
module.exports = router;
