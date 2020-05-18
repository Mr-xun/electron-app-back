const MongoClient = require('mongodb').MongoClient;
const DBUrl = 'mongodb://127.0.0.1:27017';
const ObjectID = require('mongodb').ObjectID; //索引
async function __connectDB(callback) {
	MongoClient.connect(DBUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
		if (err) {
			console.log('mongo链接失败');
			return false;
		}
		let db = client.db('electronData');
		callback(db, client);
	});
}
/**
 * @param {String} collectionname 表集合
 * @param {Object} query 查询字段集合涵回调方法
 * @description 查找
 */
//db.collection('user).find({},{pageSize:10,pageNum:1})
exports.find = function(collectionname, ...query) {
	let fn = Array.prototype.pop.apply(arguments); //回调方法
	let jsonQuery = query.length ? query[0] : {};
	let pageQuery = query.length && query.length > 1 ? query[1] : {}; //翻页条件
	jsonQuery.is_delete = { $exists: false }; //过滤非is_delete数据
	__connectDB(async (db, client) => {
		let result = db.collection(collectionname).find(jsonQuery);
		//判断是否分页
		if (pageQuery.pageNum || pageQuery.pageSize) {
			let pageSize = pageQuery.pageSize ? Number(pageQuery.pageSize) : 10,
				pageNum = pageQuery.pageNum ? Number(pageQuery.pageNum) : 1;
			result = result.skip((pageNum - 1) * pageSize).limit(pageSize);
		}
		let total = await result.count();
		result.toArray((err, data) => {
			fn(err, { data, total });
			client.close();
		});
	});
};
/**
 * @param {String} collectionname 表集合
 * @param {Object} json 新增字段条件
 * @param {Function} callback 回调函数
 * @description 新增
 */
exports.insertOne = function(collectionname, json, callback) {
	__connectDB((db, client) => {
		db.collection(collectionname).insertOne(json, (err, data) => {
			callback(err, data);
			client.close();
		});
	});
};
/**
 * @param {String} collectionname 表集合
 * @param {Object} json 删除字段条件
 * @param {Function} callback 回调函数
 * @description 删除数据（清楚原数据）
 */
exports.deleteOne = function(collectionname, json, callback) {
	__connectDB((db, client) => {
		db.collection(collectionname).deleteOne(json, (err, data) => {
			callback(err, data);
			client.close();
		});
	});
};
/**
 * @param {String} collectionname 表集合
 * @param {Object} json 删除字段条件
 * @param {Function} callback 回调函数
 * @description 删除数据（保留原数据）
 */
exports.fakeDelete = function(collectionname, json, callback) {
	__connectDB((db, client) => {
		db.collection(collectionname).updateOne(json, { $set: { is_delete: false } }, (err, data) => {
			callback(err, data);
			client.close();
		});
	});
};
/**
 * @param {String} collectionname 表集合
 * @param {Object} queryJson 查询条件
 * @param {Object} updateJson 更新集合
 * @param {Object} upsert 无数据是否新增
 * @param {Function} callback 回调函数
 * @description 修改
 */
exports.updateOne = function(collectionname, queryJson, updateJson, upsert = false, callback) {
	__connectDB((db, client) => {
		db.collection(collectionname).updateOne(queryJson, { $set: updateJson }, { upsert: upsert }, (err, data) => {
			callback(err, data);
			client.close();
		});
	});
};
/**
 * @param {String} collectionname 表集合
 * @param {Object} queryJson 查询条件
 * @param {Object} upFieldJson 自增字段集合
 * @param {Function} callback 回调函数
 * @description 需自增字段集合
 */
exports.findOneAndUpdate = function(collectionname, queryJson, upFieldJson, callback) {
	__connectDB(async (db, client) => {
		let result = await db.collection(collectionname).findOneAndUpdate(queryJson, upFieldJson, { new: true });
		callback(result);
		client.close();
	});
};
exports.ObjectID = ObjectID; //暴露ObjectID
