var express = require('express');
var router = express.Router();
var sql = require('./../tool/sql');
var filemd = require('./../tool/file.js');

router.get('/', function(req, res, next) {
	let { pageCode, pageNumber } = req.query;
	pageCode = pageCode*1 || 1; //默认第一页
	pageNumber = pageNumber*1 || 10; //默认每页显示10条数据
	
  sql.find('HX-1811','pro',{}).then(data => {
  	const totalNumber = Math.ceil(data.length / pageNumber);
  	data = data.splice((pageCode - 1)*pageNumber, pageNumber);
  	sql.distinct('HX-1811', 'pro', 'price').then(priceArr => {
  		res.render('product', {
  			activeIndex: 3,
  			totalNumber,
  			pageNumber,
  			pageCode,
  			data,
  			priceArr
  		});  		
  	})
  }).catch(err => {
  	console.log(err)
  })
});

router.get('/add',function(req,res,next) {
	res.render('product_add', {
		activeIndex: 3
	});
});

router.post('/addAction',function(req,res,next) {
	let { img,brand,type, price } = req.body;
	
	sql.find('HX-1811', 'pro', { type: type })
	.then(data => {
		if (data.length == 0){
			
			sql.insert('HX-1811', 'pro', { img,brand,type, price}).then(() =>{
				res.redirect('/product');
			}).catch((err) => {
				res.redirect('/product');
			})
		}else{
			//该用户已存在
			res.redirect('/product');
		}
	}).catch(err => {
		console.log(err);
		res.redirect('/product');
	})	
})

router.get('/remove', function(req, res, next) {
	let { type } = req.query;

	sql.remove('HX-1811', 'pro', { type }).then(() => {
		res.redirect('/product');
	}).catch(err => {
		res.redirect('/product');
	});
});

router.post('/updateAction', function(req,res,next){
	let { img, brand, type, price } = req.body;
	

	sql.update('HX-1811', 'pro', 'updateMany', { type },
	{$set: {img, brand, price}}).then(() => {
		res.redirect('/product');	
	}).catch((err) => {	
		res.redirect('/product');
	});
});

//导入产品
const phonexlsx = 'C:/Users/qianfeng/Desktop/node/day05/myapp/phone.xlsx';

router.get('/importPro', (req, res, next) => {
	filemd.analysisdata(phonexlsx).then(obj => {
		console.log(obj);
		const data = obj[0].data;
		const result = filemd.profilterdata(data);
		sql.insert('HX-1811', 'pro', result).then(() => {
			res.redirect('/product');
		})		
	})
})

//导出数据
router.get('/exportPro', (req, res, next) => {
	const _headers = [
		{caption: 'img', type: 'string'},
		{caption: 'brand', type: 'string'},
		{caption: 'type', type: 'string'},
		{caption: 'price', type: 'string'}
	];
	sql.find('HX-1811', 'pro', {}).then(data => {
		let alldata = new Array();
		data.map((item,index) => {
			let arr = [];
			arr.push(item.img);
			arr.push(item.brand);
			arr.push(item.type);
			arr.push(item.price);
			alldata.push(arr);
		})
		const result = filemd.exportdata(_headers, alldata);
		res.setHeader('Content-Type', 'application/vnd.openxmlformats');
		res.setHeader('Content-Disposition', 'attachment; filename=' + 'test.xlsx');
		res.end(result,'binary');
	})
})

router.get('/search', (req, res, next) => {
	const { brand } = req.query;
	sql.find('HX-1811', 'pro', { brand:eval('/'+brand+'/') }).then(data => {
		sql.distinct('HX-1811', 'pro', 'price').then(priceArr => {			
		res.render('product', {
			activeIndex: 3,
			totalNumber: 1,
			pageCode: 1,
			data,
			pageNumber: data.length,
			priceArr
			})
		})
	})
})

router.get('/sort', (req, res, next) => {
	let { type, num } = req.query;
	let sortData = {};
	sortData[type] = num*1;
	let { pageCode, pageNumber } = req.query;
	pageCode = pageCode*1 || 1; //默认第一页
	pageNumber = pageNumber*1 || 10; //默认每页显示8条数据
	sql.sort('HX-1811', 'pro', sortData).then(data => {
		const totalNumber = Math.ceil(data.length / pageNumber);
		data = data.splice((pageCode -  1) * pageNumber, pageNumber)
		sql.distinct('HX1811', 'pro', 'price').then(priceArr => {
			res.render('product', {
				activeIndex: 3,
				totalNumber,
				pageCode,
				data,
				pageNumber,
				priceArr
			})
		})
	})
})

module.exports = router;
