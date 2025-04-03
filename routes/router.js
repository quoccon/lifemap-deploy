var express = require('express');
var router = express.Router();
var authApi = require('../api/auth.api');
var veryfyToken = require('../middleware/veryfy_token');

/* GET users listing. */
router.post('/auth/register',authApi.register);
router.post('/auth/login',authApi.login);
router.get('/auth/info-account',veryfyToken,authApi.infoAccount);

module.exports = router;
