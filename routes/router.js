var express = require('express');
var router = express.Router();
var authApi = require('../api/auth.api');
var veryfyToken = require('../middleware/veryfy_token');
var postApi = require('../api/post.api');
var challengeApi = require('../api/challenge.api');
var deviceApi = require('../api/device_api');
var upload = require('../utils/upload');
/* GET users listing. */
router.post('/auth/register', authApi.register);
router.post('/auth/verify-otp', authApi.verifyOTP);
router.post('/auth/login', authApi.login);
router.get('/auth/info-account', veryfyToken, authApi.infoAccount);
router.put('/auth/update-info', upload.single('avatar'), veryfyToken, authApi.updateUser);

///device info
router.post('/device/save-token-fb',veryfyToken,deviceApi.addDeviceToken);

//Suggest
router.post('/suggets/add-suggest', authApi.addSuggets);
router.get('/suggest/list-suggest', authApi.suggestSport);
//Post
router.post('/post/new-post', veryfyToken, upload.array('media_url'), postApi.createNewPost);
router.get('/post/get-post', veryfyToken, postApi.getPosts);
router.put('/post/comment', postApi.addComment);


//location
router.get('/provinces', authApi.getProvinces);
router.get('/destricts', authApi.getDistricts);
router.get('/wards', authApi.getWards);

//challenge
router.post('/challenge/add-challenge', upload.single('image_challenge'), veryfyToken, challengeApi.addChallenge);
router.get('/challenge/detail-challenge', challengeApi.getChallengeDetail);
router.get('/challenge/get-challenge-participants', challengeApi.getChallengeParticipants);
router.get('/get-challenge-by-me', veryfyToken, challengeApi.getChallengeByMe);
router.post('/challenge/join-challenge',veryfyToken, challengeApi.joinChallenge);
module.exports = router;
