# isCoffeeGoodForYou

A pet project of mine. Started out as an honors project. A collection of tools to analyze how much pornography gets posted on 4chan. More specifically, a script that streams 4chan image posts to a image classifier, and an API to serve up that information.

## What is 4chan?
A terrible website where terrible people congregate. It's an anonymous forum, which has gained some notoriety over time. In very rare moments, there can be insightful discussion on its hobby boards. Maybe if we find out a way to filter out 98% of the posts some good can come out of it. 

I chose 4chan because it had an easy enough to use API, and lots of traffic.


## Components

### Worker
To understand the worker, you must first understand 4chan's structure.
There are hobby boards, which are a collection of threads. Hobby boards focus on certain topics - /g/ is a technology board where people talk about programming. /sci/ is a science and mathematics board where people talk about science and mathematics. Any user can anonymously create a thread about a particular topic relating to the board, in which people can have discusssions. 

The worker is a process that does the following:
1. Loads the boards defined in the constants, and generates a hash map representation of the board by transforming a JSON representation of the top level threads provided by 4chan's API. A board's hash map is a map of thread IDs, which then point to a hash map of post IDs.
2. Collects all the images seen in the threads, and passes them to a batch processor which uses an AI model provided by https://nsfwjs.com/ to classify the images.
3. Saves the ratings of the images to a redis instance
4. Periodically updates the hash map representation of the board, compares the image counts in each thread and uses that to decide whether to reload the thread and process any new images.
5. Continously saves the ratings of any images that get posted on those respective boards.


- The worker avoid doing unecessary work by looking up the hash of the image in the DB before classifying it
- The worker's classification package does the calculation on the CPU. It can be a little intensive so some care was taken to not classify too much too quickly 


### API
This is a really simple API built on express which sits in front of the redis instance. It provides two endpoints - one which reports the total count of detected pornographic images & one which reports the rating of a particular image hash. It is meant to serve the dashboard & the extension.


### Extension
This extension hides images that are deemed pornograhpic while browsing. I'm not too proud of this code, if you end up using this for your own personal use consider rewriting.

### Dashboard
This is a simple web user interface written in react. It pretty much just reports the total counts of detected pornographic images.

## Running this on your machine
I spent little time making this portable. Maybe I'll do it some other time. However, if you want to run this on your system:

- Install redis and run it. On my machine I was running redis through systemd.
- `npm i` in the respective directories
- Start up the worker (`node ./index.js`) (tested on arch linux with an AMD64 cpu)
- Start up the API (`npm run start`)
- Start the dashboard (no point really tbh) (`npm run start`)
- To use the chrome extension; check out this link https://developer.chrome.com/docs/extensions/mv2/getstarted/ 
