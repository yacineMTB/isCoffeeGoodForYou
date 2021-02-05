const {getAllThreads, getThreadByID} = require('./4chan-api');
const {batchPromises} = require('./util');

const turnPostsIntoMap = (posts) => posts
    .reduce((acc, curr) => acc.set(curr.no, curr), new Map());

const getImageUrl = (post, boardName) => {
  return `https://i.4cdn.org/${boardName}/${post.tim}${post.ext}`;
};

const getImagePosts = (posts, boardName) => {
  const imagePosts = posts
      .filter((post) => post.filename)
      .map((post) => ({...post, img_url: getImageUrl(post, boardName)}));
  return imagePosts;
};

const loadBoard = async (boardName) => {
  const threads = await getAllThreads(boardName);
  const threadMap = turnPostsIntoMap(threads);

  const loadThreadAndPutOnThreadMap = async (boardName, threadID, thread, threadMap) => {
    try {
      console.log(`loading thread ${threadID}`);
      const loadedThread = await getThreadByID(boardName, threadID);
      threadMap.set(threadID, {...thread, posts: turnPostsIntoMap(loadedThread.posts)});
    } catch (err) {
      if (err.response && err.response.statusCode === 404) {
        console.log(err);
        console.log(`${threadID} 404ed`);
        threadMap.delete(threadID);
      } else {
        console.error(err);
      }
    }
  };
  const functionArgumentsToBatch = [];
  for (const [threadID, thread] of threadMap) {
    functionArgumentsToBatch.push([boardName, threadID, thread, threadMap]);
  }
  // The reason I'm batching these outbound requests is because hiroyuki likes to rate limit me when I'm running thiS
  await batchPromises(functionArgumentsToBatch, loadThreadAndPutOnThreadMap, 8);

  // Reduce the thread map to a list of posts
  const allPosts = [...threadMap].reduce((accumulator, [key, {posts}]) => {
    if (posts) {
      return [
        ...accumulator,
        ...[...posts].map(([key, post]) => post)];
    }
    return accumulator;
  }, []);

  const imagePosts = getImagePosts(allPosts, boardName);

  return {
    images: imagePosts.map((post) => ({...post, img_url: getImageUrl(post, boardName)})),
    threadMap,
  };
};

/**
 * Takes a map of threads, and a most recent list of threads, and returns
 * threads with new posts with images
 * @param {Map<string, Map>} threadMap
 * @param {Object[]} currentThreads
 * @return {Object[]} threads with new images
 */
const getThreadsWithNewImages = (threadMap, currentThreads) => {
  const threadsWithNewImages = currentThreads
      .filter((thread) => {
        if (!threadMap.get(thread.no)) {
          console.log(`New thread detected: ${thread.no}`);
          return true;
        }
        return threadMap.get(thread.no).images < thread.images;
      });
  return threadsWithNewImages;
};

const get404edThreads = (threadMap, mostRecentThreadMap) => {
  const threadsThatHave404ed = [];
  for (const [threadID] of threadMap) {
    if (!mostRecentThreadMap.has(threadID)) {
      threadsThatHave404ed.push(threadID);
    }
  }
  return threadsThatHave404ed;
};


/**
 * Gets the differential in posts from map representation of an old thread & an updated thread
 * @param {Map<string, Map>} updatedThread
 * @param {Object[]} oldThread
 * @return {Object[]} threads with new images
 */
const getNewPosts = (updatedThread, oldThread) => {
  const newPosts = updatedThread.posts.filter((post) => {
    if (!oldThread|| !oldThread.posts) {
      return true;
    }
    return !oldThread.posts.has(post.no);
  });
  return newPosts;
};

const updateThreadMapAndGetNewImagePosts = async (threadMap, boardName) => {
  let newPostsToCheck = [];

  const allCurrentThreads = await getAllThreads(boardName);
  const mostRecentThreadMap = turnPostsIntoMap(allCurrentThreads);

  threadsThatHave404ed = get404edThreads(threadMap, mostRecentThreadMap);
  for (const threadID of threadsThatHave404ed) {
    threadMap.delete(threadID);
  }

  // For every thread with new images, we want to update the version we have in the hash map
  // and we want to keep track of the new image posts for later processing
  threadsWithNewImages = getThreadsWithNewImages(threadMap, allCurrentThreads);
  for (const threadWithNewImages of threadsWithNewImages) {
    const updatedThread = await getThreadByID(boardName, threadWithNewImages.no);
    const oldThread = threadMap.get(threadWithNewImages.no);
    const newPosts = getNewPosts(updatedThread, oldThread);

    // Update the thread in memory to the most recently seen state
    threadMap.set(
        threadWithNewImages.no,
        {...mostRecentThreadMap.get(threadWithNewImages.no), posts: turnPostsIntoMap(updatedThread.posts)},
    );
    console.log(`new post count ${newPosts.length} for thread ${threadWithNewImages.no}`);

    newPostsToCheck = [...newPostsToCheck, ...newPosts];
  }

  for (const thread of allCurrentThreads) {
    threadMap.set(thread.no, {...threadMap.get(thread.no), images: thread.images});
  }
  const newImagePosts = getImagePosts(newPostsToCheck, boardName);
  return {newImagePosts};
};

module.exports = {
  loadBoard,
  updateThreadMapAndGetNewImagePosts,
};
