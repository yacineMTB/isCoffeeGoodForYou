const {getAllThreads, getThreadByID, turnPostsIntoMap} = require('./4chan-api');

class Board {
  constructor(name) {
    this.name = name;
  }

  getImageUrl(post) {
    return `https://i.4cdn.org/${this.name}/${post.tim}${post.ext}`;
  }

  async loadBoard() {
    const threads = await getAllThreads(this.name);
    this.threads = turnPostsIntoMap(threads);

    for (const [threadID, thread] of this.threads) {
      const lambda = async () => {
        try {
          const loadedThread = await getThreadByID(this.name, threadID);
          this.threads.set(threadID, {...thread, posts: turnPostsIntoMap(loadedThread.posts)});
          console.log(`loading thread ${threadID}`);
        } catch (err) {
          if (err.response && err.response.statusCode === 404) {
            console.log(`${threadID} 404ed`);
            this.threads.delete(threadID);
          } else {
            console.log(err);
            throw err;
          }
        }
      };
      await lambda();
    }

    const imagePosts = [...this.threads].reduce((acc, [key, {posts}]) => {
      if (posts) {
        return [...acc, ...[...posts].filter(([key, post]) => post.filename).map(([key, post]) => post)];
      }
      return acc;
    }, []);
    return imagePosts.map((post) => ({...post, img_url: this.getImageUrl(post)}));
  }

  async update() {
    let stream = [];
    const currentThreads = await getAllThreads(this.name);
    const currentThreadsMap = turnPostsIntoMap(currentThreads);

    const threadsThatShouldUpdate = currentThreads
        .filter((thread) => {
          if (!this.threads.get(thread.no)) {
            console.log(`New thread detected: ${thread.no}`);
            return true;
          }
          return this.threads.get(thread.no).images < thread.images;
        });

    for (const threadThatShouldUpdate of threadsThatShouldUpdate) {
      let newThread;
      try {
        newThread = await getThreadByID(this.name, threadThatShouldUpdate.no);
        const newPosts = newThread.posts.filter((post) => {
          const threadInMemory = this.threads.get(threadThatShouldUpdate.no);
          if (!threadInMemory || !threadInMemory.posts) {
            return true;
          }
          return !threadInMemory.posts.has(post.no);
        });

        this.threads.set(
            threadThatShouldUpdate.no,
            {...currentThreadsMap.get(threadThatShouldUpdate.no), posts: turnPostsIntoMap(newThread.posts)},
        );
        console.log(`new post count ${newPosts.length} for thread ${threadThatShouldUpdate.no}`);

        stream = [...stream, ...newPosts];
      } catch (err) {
        if (err.response && err.response.statusCode === 404) {
          console.log(`${threadThatShouldUpdate.no} 404ed`);
          this.threads.delete(threadThatShouldUpdate.no);
        } else {
          throw err;
        }
      }
      break;
    }

    for (const thread of currentThreads) {
      this.threads.set(thread.no, {...this.threads.get(thread.no), images: thread.images});
    }

    return stream.filter((post) => post.filename).map((post) => ({...post, img_url: this.getImageUrl(post)}));
  }
}

module.exports = Board;
