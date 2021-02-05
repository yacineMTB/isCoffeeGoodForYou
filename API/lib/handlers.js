const Redis = require('ioredis');

const redisClient = new Redis();

const getPornographicRatingForHashHandler = async (req, res) => {
  const result = await redisClient.hgetall(req.params.md5);
  res.send(result);
};

const getPornographicImageCountForBoardHandler = async (req, res) => {
  const result = await redisClient.hgetall(req.params.board);
  res.send(result);
};

module.exports = {
  getPornographicRatingForHashHandler,
  getPornographicImageCountForBoardHandler,
};
