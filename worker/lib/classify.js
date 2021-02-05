const got = require('got');
const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');

let model;

const classify = async (post) => {
  try {
    const {body: picArrayBuffer} = await got(post.img_url, {
      responseType: 'buffer',
    });

    if (!model) {
      model = await nsfw.load();
    }
    const image = await tf.node.decodeImage(picArrayBuffer, 3);
    const predictions = await model.classify(image);
    image.dispose();
    return {...predictions.reduce((acc, curr) => ({...acc, [curr.className]: curr.probability}), {}), ...post};
  } catch (error) {
    console.log(`error classifying: ${post.img_url}`);
  }
  return null;
};

module.exports = classify;
