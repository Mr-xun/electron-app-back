const express = require('express');
const router = express.Router();
const usersRouter = require('./user/index');
const merchatRouter = require('./merchant/index');
const fieldCounterRouter = require('./field_counter/index');
const fileRouter = require('./file/index');
/**
 * status:401 用户没权限
 *        5001 服务端或mongo操作失败  
 */
router.use('/user', usersRouter);
router.use('/merchant', merchatRouter);
router.use('/fieldCounter', fieldCounterRouter);
router.use('/file', fileRouter);

module.exports = router;
