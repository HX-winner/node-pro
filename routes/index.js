var express = require('express');
var router = express.Router();
var sql = require('./../tool/sql');
var md5 = require('md5');

/* GET home page. */
router.get('/', function(req, res, next) {
	if (!req.cookies.isLogin || req.cookies.isLogin == 0) {
		// 表示未登录
		res.redirect('/login');  // 跳到登录页面
		return;
	}
  res.render('index', {
  	activeIndex: 1
  });
});

router.get('/login', function(req, res, next) {
	res.render('login');
});

router.post('/loginAction', (req, res, next) => {
	let { username, password } = req.body;
	password = md5(password);
	sql.find('HX-1811', 'admin', { username, password }).then(data => {
		if (data.length === 0) {
			res.cookie('isLogin', 0);
			res.redirect('/login');
		}else{
			res.cookie('isLogin', 1);
			res.redirect('/')
		}
	})
})

router.get('/logout', (req, res, next) => {
	res.clearCookie('isLogin'); // 删除cookie
	res.redirect('/login')  
})

module.exports = router;
