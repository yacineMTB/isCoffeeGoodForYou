const express = require('express');
const router = express.Router();
const {getPornographicRatingForHashHandler, getPornographicImageCountForBoardHandler} = require('../lib/handlers.js');

router.get('/image/:md5', getPornographicRatingForHashHandler);
router.get('/board/:board', getPornographicImageCountForBoardHandler);

module.exports = router;
