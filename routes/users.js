var express = require('express');
var router = express.Router();
var sql = require('./../tool/sql');
var md5 = require('md5');
var filemd = require('./../tool/file.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
	let { pageCode, pageNumber } = req.query;
	pageCode = pageCode*1 || 1; //默认第一页
	pageNumber = pageNumber*1 || 8; //默认每页显示8条数据
	
  sql.find('HX-1811','users',{}).then(data => {
  	const totalNumber = Math.ceil(data.length / pageNumber);
  	data = data.splice((pageCode - 1)*pageNumber, pageNumber);
  	sql.distinct('HX-1811', 'users', 'age').then(ageArr => {
  		res.render('users', {
  			activeIndex: 2,
  			totalNumber,
  			pageNumber,
  			pageCode,
  			data,
  			ageArr
  		});  		
  	})
  }).catch(err => {
  	console.log(err)
  })
});

router.get('/add',function(req,res,next) {
	res.render('users_add', {
		activeIndex: 2
	});
});

//添加数据到数据库并在user页面渲染数据
router.post('/addAction',function(req,res,next) {
	let { tel,nickname,password, age } = req.body;
	tel *= 1;
 	age *= 1;
	sql.find('HX-1811', 'users', { tel: tel })
	.then(data => {
		if (data.length == 0){
			password = md5(password);
			sql.insert('HX-1811', 'users', { tel, nickname, password, age}).then(() =>{
				res.redirect('/users');
			}).catch((err) => {
				res.redirect('/users');
			})
		}else{
			//该用户已存在
			res.redirect('/users');
		}
	}).catch(err => {
		console.log(err);
		res.redirect('/users');
	})	
})

//删除数据和页面渲染的数据
router.get('/remove', function(req, res, next) {
	let { tel } = req.query;
	tel= tel*1
	sql.remove('HX-1811', 'users', { tel }).then(() => {
		res.redirect('/users');
	}).catch(err => {
		res.redirect('/users');
	});
});

//更新修改昵称
router.post('/updateAction', function(req,res,next){
	let { tel,nickname } = req.body;
	tel= tel*1
	sql.update('HX-1811', 'users', 'updateOne', { tel }, {$set: { nickname }}).then(() => {
		res.redirect('/users');
	}).catch((err) => {
		res.redirect('/users');
	});
});

//导入数据
const usersxlsx = 'C:/Users/qianfeng/Desktop/node/day05/myapp/stu.xlsx';

router.get('/importUsers', (req, res, next) => {
	filemd.analysisdata(usersxlsx).then(obj => {
		console.log(obj);
		const data = obj[0].data;
		const result = filemd.usersfilterdata(data);
		sql.insert('HX-1811', 'users', result).then(() => {
			res.redirect('/users');
		})		
	})
})

//导出数据
router.get('/exportUsers', (req, res, next) => {
	const _headers = [
		{caption: 'tel', type: 'string'},
		{caption: 'nickname', type: 'string'},
		{caption: 'password', type: 'string'}
	];
	sql.find('HX-1811', 'users', {}).then(data => {
		let alldata = new Array();
		data.map((item,index) => {
			let arr = [];
			arr.push(item.tel);
			arr.push(item.nickname);
			arr.push(item.password);
			alldata.push(arr);
		})
		const result = filemd.exportdata(_headers, alldata);
		res.setHeader('Content-Type', 'application/vnd.openxmlformats');
		res.setHeader('Content-Disposition', 'attachment; filename=' + 'test.xlsx');
		res.end(result,'binary');
	})
})



//搜索框  按nickname搜索
router.get('/search', (req, res, next) => {
	const { nickname } = req.query;
	sql.find('HX-1811', 'users', { nickname:eval('/'+nickname+'/') }).then(data => {
		sql.distinct('HX-1811', 'users', 'age').then(ageArr => {			
		res.render('users', {
			activeIndex: 2,
			totalNumber: 1,
			pageCode: 1,
			data,
			pageNumber: data.length,
			ageArr
			})
		})
	})
})

router.get('/ageSearch', (req, res, next) => {
	let { age } = req.query;
	age*=1;
	sql.find('HX-1811', 'users', { age }).then(data =>{
		sql.distinct('HX-1811', 'users', 'age').then(ageArr => {
			res.render('users', {
				activeIndex: 2,
				totalNumber: 1,
				pageCode: 1,
				data,
				pageNumber: data.length,
				ageArr
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
	pageNumber = pageNumber*1 || 8; //默认每页显示8条数据
	sql.sort('HX-1811', 'users', sortData).then(data => {
		const totalNumber = Math.ceil(data.length / pageNumber);
		data = data.splice((pageCode -  1) * pageNumber, pageNumber)
		sql.distinct('HX1811', 'users', 'age').then(ageArr => {
			res.render('users', {
				activeIndex: 2,
				totalNumber,
				pageCode,
				data,
				pageNumber,
				ageArr
			})
		})
	})
})



module.exports = router;










