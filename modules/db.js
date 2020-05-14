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
//db.collection('user).find({})
exports.find = function(collectionname, json, callback) {
	__connectDB((db, client) => {
		let result = db.collection(collectionname).find(json);
		result.toArray((err, data) => {
			callback(err, data);
			client.close();
		});
	});
};
//新增一条
exports.insertOne = function(collectionname, json, callback) {
	console.log(json);
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

exports.ObjectID = ObjectID;
