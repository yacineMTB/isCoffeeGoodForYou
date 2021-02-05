const got = require('got');

const BASE_API_URL = 'https://a.4cdn.org/';

const getBoardCatalog = async (board) => {
  const {body} = await got(`${BASE_API_URL}/${board}/catalog.json`);
  return JSON.parse(body);
};

const getAllThreads = async (board) => {
  const pages = await getBoardCatalog(board);
  const threads = pages.reduce((acc, curr) => [...acc, ...curr.threads], []);
  return threads;
};

const getThreadByID = async (board, threadID) => {
  const {body} = await got(`${BASE_API_URL}/${board}/thread/${threadID}.json`);
  return JSON.parse(body);
};


module.exports = {
  getAllThreads,
  getBoardCatalog,
  getThreadByID,
};
