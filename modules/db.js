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
//查找
//db.collection('user).find({},{pageSize:10,pageNum:1})
exports.find = function(collectionname, ...query) {
	let fn = Array.prototype.pop.apply(arguments); //回调方法
	let jsonQuery = query.length ? query[0] : {};
	let pageQuery = query.length && query.length > 1 ? query[1] : {}; //翻页条件
	__connectDB(async (db, client) => {
		let result = db.collection(collectionname).find(jsonQuery);
		//判断是否分页
		if (pageQuery.pageNum || pageQuery.pageSize) {
			let pageSize = pageQuery.pageSize ? Number(pageQuery.pageSize) : 1,
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
//新增一条
exports.insertOne = function(collectionname, json, callback) {
	__connectDB((db, client) => {
		db.collection(collectionname).insertOne(json, (err, data) => {
			callback(err, data);
			client.close();
		});
	});
};
//删除一条
exports.deleteOne = function(collectionname, json, callback) {
	__connectDB((db, client) => {
		db.collection(collectionname).deleteOne(json, (err, data) => {
			callback(err, data);
			client.close();
		});
	});
};
//修改一条
exports.updateOne = function(collectionname, json1, json2, callback) {
	__connectDB((db, client) => {
		db.collection(collectionname).updateOne(json1, { $set: json2 }, (err, data) => {
			callback(err, data);
			client.close();
		});
	});
};

exports.ObjectID = ObjectID; //暴露ObjectID
