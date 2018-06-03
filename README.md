# Web crawler
This NodeJS project intends to Crawl through a given Web URL within its domain

# Prerequisites
1. Npm
2. NodeJs

# How to run
1. Clone the Project and go to the source directory
2. Npm install
3. node index.js (without promises)
4. node app_promises.js (with promises library)

# About the Project
1. The script goes to a url and collects all the links from the page, and then, proceeds to visit and collect the urls from the previously collected urls.
2. We control the number of urls the script is visiting at a time, using a throttle limit.
3. Also, we maintain two arrays here to control the web urls to visit and already visited urls.
4. Once, the program has visited all the links in the domain or, is stopped by the User(ctrl + c), the visited links are written to 'visitedLinks.csv'.

