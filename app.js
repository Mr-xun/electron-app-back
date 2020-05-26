const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const timeout = require('connect-timeout');
const expressJwt = require('express-jwt'); //token认证
const setting = require('./token.config');
const verify = require(path.join(__dirname, 'public/token.verify'));
const routers = require('./routes/index');
const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// 自定义跨域中间件
var allowCors = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type,authorization');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
};

app.use(allowCors); //使用跨域中间件
app.use(timeout('8s'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//解析token获取用户信息
app.use((req, res, next) => {
	//获取请求头信息
	let token = req.headers[setting.token.header];
	if (token == undefined) {
		next();
	} else {
		//token验证
		verify
			.getToken(token)
			.then((data) => {
				req.data = data;
				return next();
			})
			.catch((_) => {
				return next();
			});
	}
});
app.use(
	expressJwt({
		secret: setting.token.signKey
	}).unless({
		//不验证该地址
		path: setting.token.unRoute
	})
);
//当token失效返回提示信息
app.use((err, req, res, next) => {
	if (err.status === 401) {
		return res.status(err.status).json({
			status: err.status,
			msg: 'The token is invalid',
			error: err.name + ':' + err.message
		});
	}
});
app.use('/', routers);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

// 这里的代码只能放到最后
app.use((req, res, next) => {
	console.log('超时执行');
	if (!req.timedout) next();
});
module.exports = app;
