const exprss = require('express');
const router = new exprss.Router();
const utils = require('../../public/javascripts/utils');
const moment = require('moment');
const DB = require('../../modules/db');
router.get('/orderNum', (req, res) => {
	DB.find(
		'field_counter',
		{
			role: 'admin'
		},
		(err, { data, total }) => {
			if (err) {
				console.log(err);
				return res.json({
					code: 5001,
					msg: '查询订单号失败',
					err
				});
			}
			let orderNum = 'S000' + moment().format('YYMMDD');
			if (total && data[0].wholesaleOrder_counter) {
				orderNum += utils.PrefixInteger(data[0].wholesaleOrder_counter + 1, 4);
			} else {
				orderNum += utils.PrefixInteger(1, 4);
			}
			return res.json({
				code: 0,
				msg: '查询订单号成功',
				orderNum: orderNum
			});
		}
	);
});
router.post('/createOrder', (req, res) => {
	let insertJson = {
		order_num: req.body.order_num,
		create_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
		order_content: req.body.order_content,
		create_user: req.body.create_user,
		merchant_code: req.body.merchant_code
	};

	DB.find(
		'wholesale',
		{
			order_num: insertJson.order_num
		},
		(err, { data, total }) => {
			if (err) {
				console.log(err);
				return res.json({
					code: 5001,
					msg: '创建订单记录',
					err
				});
			}
			if (total) {
				return res.json({
					code: -1,
					msg: '该订单号已被注册'
				});
			} else {
				DB.find(
					'merchant',
					{
						merchant_code: insertJson.merchant_code
					},
					(err, { data, total }) => {
						if (err) {
							console.log(err);
							return res.json({
								code: 5001,
								msg: '创建订单记录',
								err
							});
						}
						if (total) {
							insertJson.merchant_name = data[0].merchant_name;
						} else {
							insertJson.merchant_name = '未知';
						}
						console.log(insertJson, 'test');
						DB.findOneAndUpdate(
							'field_counter',
							{
								role: 'admin'
							},
							{
								$inc: {
									wholesaleOrder_counter: 1
								}
							},
							(data) => {
								if (!data.value) {
									DB.updateOne(
										'field_counter',
										{
											role: 'admin'
										},
										{
											wholesaleOrder_counter: 1
										},
										true,
										(err) => {
											if (err) {
												console.log(err);
												return res.json({
													code: -1,
													msg: '创建订单计数失败'
												});
											}
										}
									);
								}
								DB.insertOne('wholesale', insertJson, (err) => {
									if (err) {
										console.log(err);
										return res.json({
											code: 5001,
											msg: '创建批发订单记录失败',
											err
										});
									}
									return res.json({
										code: 0,
										msg: '创建批发订单记录成功'
									});
								});
							}
						);
					}
				);
			}
		}
	);
});
router.post('/list', (req, res) => {
	let { order_num, startTime, endTime, merchant_code, pageSize, pageNum } = req.body;
	let query = {};
	if (order_num) {
		query.order_num = order_num;
	}
	if (merchant_code) {
		query.merchant_code = merchant_code;
	}

	if (startTime && endTime) {
		query.create_time = {
			$gt: startTime,
			$lt: endTime
		};
	}
	DB.find(
		'wholesale',
		query,
		{
			pageSize,
			pageNum
		},
		(err, { data, total }) => {
			if (err) {
				console.log(err);
				return res.json({
					code: 5001,
					msg: '查询订单记录失败',
					err
				});
			}
			return res.json({
				code: 0,
				list: data,
				total: total,
				currentPage: Number(pageNum) || 1,
				pageSize: Number(pageSize) || 10,
				msg: '获取订单记录成功'
			});
		}
	);
});
module.exports = router;
