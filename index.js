var fs = require('fs')
var cheerio = require('cheerio')
var request = require('request')

//Objectives
//1. request url
//2. collect links
//3. keep doing
//4. Connections
//5. write them to csv

var baseUrl = "https://medium.com"
var throttleSize = 5 // to control the maximum connections
var linksToVisit = []
var linksVisited = []
var currentConnections = 0
var continueCrawling = true

function crawl() {
	if(linksToVisit.length > 0) {
		if(continueCrawling){
			var nextUrl = linksToVisit.shift()
			visitUrl(nextUrl)
		}else {
			return;
		}
	} else{
		if(currentConnections == 0){
			writeToCsv(linksVisited);
		}
		console.log("No link to visit")
	}

	return;
}

function visitUrl(url) {
	console.log("Visiting url : ", url)
	currentConnections++
	console.log("current Connections : ", currentConnections)
	request(url, function(error, response, body){
		console.log("error ", error)
		// console.log("response ", response)

		if(response && response.statusCode == 200) {
			// console.log("successFul : ", body)
			var parsedBody = cheerio.load(body)
			collectLinks(parsedBody, url)
			crawl()
		}
		linksVisited.push(url);

		checkifFree()
		currentConnections--
	})

	checkifFree()
}

function checkifFree() {
	if(currentConnections < throttleSize) {
		crawl()
	}
}

function collectLinks(parsedBody, url) {
	var relativeLinks = parsedBody("a[href^='/']");
	var absoluteLinks = parsedBody("a[href^='" + baseUrl + "']")

	console.log("relativeLinks on page " + url +" " + relativeLinks.length)
	console.log("absoluteLinks on page " +  url + " "+ absoluteLinks.length)

	relativeLinks.each(function(){
		var completeLink = baseUrl + parsedBody(this).attr('href')
		addLinksToVisit(completeLink)
	})

	absoluteLinks.each(function(){
		var completeLink = parsedBody(this).attr('href')
		addLinksToVisit(completeLink)
	})

	console.log("links to Visit ", linksToVisit.length)
	console.log("links visited ", linksVisited.length)
}

function addLinksToVisit(link){
	if(linksVisited.indexOf(link) == -1 && linksToVisit.indexOf(link) == -1 ) {
		linksToVisit.push(link)
	}
}

function writeToCsv(links) {
	continueCrawling = false
	calculateTimeTaken()
	var file = fs.createWriteStream('visitedLinks.csv');
	file.on('error', function(error){
		console.log("Error while writing Csv")
	})

	file.write("Serial No., Url\n");

	for(var i =0 ; i < links.length;i++){
		file.write(i + 1 + " , " +links[i]  +'\n' );
	}
	file.end();
}

process.on('SIGINT', function() {
	writeToCsv(linksVisited, true)
  });

function calculateTimeTaken() {
	var endTime = new Date()

	console.log("Time Taken : " + (endTime - startTime) + " ms")
}


linksToVisit.push(baseUrl + '/');
var startTime = new Date();
crawl()