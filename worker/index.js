const cron = require('node-cron');
const Redis = require('ioredis');
const {loadBoard, updateThreadMapAndGetNewImagePosts} = require('./lib/boardFunctional');
const classify = require('./lib/classify');
const {batchPromises} = require('./lib/util');

const redisClient = new Redis();

const BOARDS = ['fit', 'g', 'sci', 's'];

/**
 * Takes an array of images, classifies them, and saves the result to redis.
 * @param {Object[]} images a representation of a 4chan post with an image
 * @param {Number} boardName the board name to increment pornographic image counts with
 * @param {Number} batchTarget degree of parallelization of classification
 */
const batchProcessImages = async (images, boardName, batchTarget = 8) => {
  const imagesToClassify = [];

  // We don't want to waste cpu cycles of images we've already seen. We only want to classify images
  // if our redis instance doesn't have results for the particular image hash.
  for (const imagePost of images) {
    const cachedResult = await redisClient.hgetall(imagePost.md5);
    if (Object.keys(cachedResult).length === 0) {
      imagesToClassify.push(imagePost);
    } else {
      console.log(`already seen: ${JSON.stringify(imagePost.md5)}`);
    }
  }

  // If I give my particular CPU (ryzen 5900x) too much images to classify it'll start hanging.
  // No idea why but batching them resolves it.
  const imageClassificationOperation = async (imagePost) => {
    const classifiedPost = await classify(imagePost);
    const fields = classifiedPost ? {
      sexy: classifiedPost.Sexy,
      neutral: classifiedPost.Neutral,
      porn: classifiedPost.Porn,
      drawing: classifiedPost.Drawing,
      hentai: classifiedPost.Hentai,
      time_processed: Date.now(),
    } : {
      error: 'could not classify',
    };
    await redisClient.hset(imagePost.md5, fields);
    console.log(`processed ${imagePost.md5}`);
    return fields;
  };

  const imagesToClassifyAsFunctionArguments = imagesToClassify.map((imagePost) => [imagePost]);
  const result = await batchPromises(imagesToClassifyAsFunctionArguments, imageClassificationOperation, batchTarget);
  const countOfPornographicImagesDetected = result.reduce((accumulator, classifiedPost) => {
    // Using an arbitrary threshold
    if (classifiedPost.porn > 0.5 || classifiedPost.hentai > 0.5 || classifiedPost.sexy > 0.5) {
      return accumulator + 1;
    }
    return accumulator;
  }, 0);
  console.log(`Detected ${countOfPornographicImagesDetected} pornograhpic images`);
  await redisClient.incrby(`${boardName}.count`, countOfPornographicImagesDetected);
};

(async () => {
  for (const boardName of BOARDS) {
    const {images, threadMap} = await loadBoard(boardName);
    await batchProcessImages(images);

    cron.schedule('*/10 * * * * *', async () => {
      console.log(`checking /${boardName}/ for new images..`);
      const {newImagePosts} = await updateThreadMapAndGetNewImagePosts(threadMap, boardName);
      if (newImagePosts.length > 0) {
        console.log(`Detected update for /${boardName}/ with ${newImagePosts.length}`);
        await batchProcessImages(newImagePosts, boardName);
      }
    });
  }
})();
