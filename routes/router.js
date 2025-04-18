var express = require('express');
var router = express.Router();
var authApi = require('../api/auth.api');
var veryfyToken = require('../middleware/veryfy_token');
var postApi = require('../api/post.api');
var upload = require('../utils/upload');
/* GET users listing. */
router.post('/auth/register',authApi.register);
router.post('/auth/verify-otp',authApi.verifyOTP);
router.post('/auth/login',authApi.login);
router.get('/auth/info-account',veryfyToken,authApi.infoAccount);

//Suggest
router.post('/suggets/add-suggest',authApi.addSuggets);
router.get('/suggest/list-suggest',authApi.suggestSport);
//Post
router.post('/post/new-post',veryfyToken,upload.array('media_url'),postApi.createNewPost);
router.get('/post/get-post',veryfyToken,postApi.getPosts);

module.exports = router;
