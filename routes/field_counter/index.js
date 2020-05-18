const express = require('express');
const router = new express.Router();
const DB = require('../../modules/db');
router.get('/', (req, res) => {
	let { _id } = req.data;
	DB.find('field_counter', { _id: new DB.ObjectID(_id) }, (err, { data, total }) => {
		if (err) {
			console.log(err);
			return res.json({
				code: 5001,
				msg: '获取字段计数表失败',
				err
			});
		}
		if (total) {
			return res.json({
				code: 0,
				data: data[0],
				msg: '获取字段计数表成功'
			});
		} else {
			return res.json({
				code: -1,
				data: data[0],
				msg: '该角色暂无字段计数表'
			});
		}
	});
});
module.exports = router;
