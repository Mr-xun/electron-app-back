const express = require('express');
const router = express.Router();
const usersRouter = require('./user/index');
const goodsRouter = require('./goods/index');
const merchantRouter = require('./merchant/index');
const fieldCounterRouter = require('./field_counter/index');
const fileRouter = require('./file/index');
const brandRouter = require('./brand/index');
const baseDataRouter = require('./base_data/index');
const templateRouter = require('./template/index');

/**
 * status:401 用户没权限
 *        5001 服务端或mongo操作失败  
 */
router.use('/user', usersRouter);
router.use('/goods', goodsRouter);
router.use('/merchant', merchantRouter);
router.use('/fieldCounter', fieldCounterRouter);
router.use('/file', fileRouter);
router.use('/brand', brandRouter);
router.use('/basedata', baseDataRouter);
router.use('/template', templateRouter);

module.exports = router;
