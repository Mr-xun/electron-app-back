/**
 * 
 * @param {number} num 数字 
 * @param {number} length 补全总长度
 * @description 指定长度为数字前面补零输出
 */
let PrefixInteger = function(num, length) {
	return (Array(length).join('0') + num).slice(-length);
};
exports.PrefixInteger = PrefixInteger;
