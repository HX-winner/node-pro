var xlsx = require('node-xlsx');
var nodeExcel = require('excel-export');

const filemd = {
	analysisdata (path) {
		return new Promise((resolve,reject) => {
			//解析Excel文件
			const obj = xlsx.parse(path);
			resolve(obj); // obj为buffer类型
		})
	},
	usersfilterdata (data) {
		let arr = [];
		data.map((item,index) => {
			if(index !== 0) {
				arr.push({
					tel: item[0],
					nickname: item[1],
					password: item[2],
					age: item[3]
				})
			}
		})
		return arr;
	},
	profilterdata (data) {
		let arr = [];
		data.map((item,index) => {
			if(index !== 0) {
				arr.push({
					img: item[0],
					brand: item[1],
					type: item[2],
					price: item[3]
				})
			}
		})
		return arr;
	},
	exportdata (_headers, rows) {
		var conf = {};
		conf.name = 'mysheet';
		conf.cols = [];
		for (var i = 0; i< _headers.length; i++){
			var col = {};
			col.caption = _headers[i].caption;
			col.type = _headers[i].type;
			conf.cols.push(col);
		}
		conf.rows = rows;
		var result = nodeExcel.execute(conf);
		return result;
	}
}

module.exports = filemd;
























