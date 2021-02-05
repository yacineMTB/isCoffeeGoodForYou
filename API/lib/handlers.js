const Redis = require('ioredis');

const redisClient = new Redis();

const getPornographicRatingForHashHandler = async (req, res) => {
  const result = await redisClient.hgetall(req.params.md5);
  res.json(result);
};

const getPornographicImageCountForBoardHandler = async (req, res) => {
  const result = await redisClient.get(`${req.params.board}.count`);
  if (result) {
    return res.json({detected_image_count: parseInt(result)});
  }
  res.json({detected_image_count: 0});
};

module.exports = {
  getPornographicRatingForHashHandler,
  getPornographicImageCountForBoardHandler,
};
