var express = require('express');
var router = express.Router();
var authApi = require('../api/auth.api');
/* GET users listing. */
router.post('/auth/register',authApi.register);

module.exports = router;
