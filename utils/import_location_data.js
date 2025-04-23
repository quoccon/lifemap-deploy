var db = require('../configs/connect_db');
var fs = require('fs');
var path = require('path');
const Province = require('../models/province.model');
const District = require('../models/districts.model');
const Ward = require('../models/ward.model');

const province = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tinh_tp.json')));
const districts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/quan_huyen.json')));
const wards = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/xa_phuong.json')));

const importLocationData = async () => {
    try {
        await Province.deleteMany();
        await District.deleteMany();
        await Ward.deleteMany();

    
    } catch (error) {
        
    }
};