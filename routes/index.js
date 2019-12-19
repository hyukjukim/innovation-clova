const express = require('express');
const clova = require('../clova');
const router = express.Router();

router.post(`/clova`, clova);

router.get('/', function(req, res) {
    res.end('hello, Innovation-clova');
});
module.exports = router;
