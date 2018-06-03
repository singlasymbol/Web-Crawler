var fs = require('fs')
var cheerio = require('cheerio')
var request = require('request')
var linksToVisit = []
var visitedLinks = []
var baseUrl = "https://medium.com"
var currentConnections = 0
var poolInitiated = false;
var throttleSize = 5

function crawlAndCollectLinks(url) {

	console.log("currentConnections :" , currentConnections)
	
	if(poolInitiated ){
		console.log("poolInitiated")

		if(linksToVisit.length > 0)
			checkIfFree()
		else
			writeUrlsToCsv()
	}
	
	return new Promise((resolve, reject) =>{
		collectLinks(url)
		.then( next => 
		{
			currentConnections--
			if(linksToVisit.length > 0)
				checkIfFree()
			else
				resolve()

			checkIfFree()
		})
		.catch(err => {console.log("error occured", error)})
	})

}

function collectLinks(url){
	visitedLinks.push(url)
	console.log("requesting the page", url)
	return new Promise((resolve, reject) => {

		request(url, function(err, response, body) {
			if(err) {
				console.log("some error occured while requesting")
				reject(err)
			}

			if(response && response.statusCode == 200) {
				console.log("got a response")
				var htmlContent = cheerio.load(body);
				var relativeLinks = htmlContent("a[href^='/']");
				var absoluteLinks = htmlContent("a[href^='" + baseUrl + "']")


				relativeLinks.each(function(){
					var completeLink = baseUrl + htmlContent(this).attr('href')
					addLinksToVisit(completeLink)
				})

				absoluteLinks.each(function(){
					var completeLink = htmlContent(this).attr('href')
					addLinksToVisit(completeLink)
				})
				poolInitiated = true
				resolve()
			}
		})

	})

}


function writeUrlsToCsv(links) {

	return new Promise((resolve, reject) =>{
		continueCrawling = false
		var file = fs.createWriteStream('visitedLinks.csv');
		file.on('error', function(error){
			console.log("Error while writing Csv")
		})

		file.write("Serial No., Url\n");

		for(var i =0 ; i < links.length;i++){
			console.log("writing : ", links[i])
			file.write(i + 1 + " , " +links[i]  +'\n' );
		}

		file.on('finish', () => {  
			console.log('wrote all data to file');
			resolve()
		});
		file.end()
	})
}

process.on('SIGINT', function() {
	console.log("ENDING ENDING ENDING ENDING ENDING ENDING",visitedLinks.length)
	writeUrlsToCsv(visitedLinks)
	.then(() =>{
		process.exit()
	})
});

function addLinksToVisit(url) {
	if(linksToVisit.indexOf(url) == -1 && visitedLinks.indexOf(url) == -1) {
		poolInitiated = true;
		linksToVisit.push(url)
	}
}


function checkIfFree() {
	if(currentConnections < throttleSize) {
		if(linksToVisit.length > 0){
			var nextUrl = linksToVisit.shift();
			console.log("next url ", nextUrl)
			currentConnections++
			crawlAndCollectLinks(nextUrl)	
		}
	}
}


function startCrawling() {

	return new Promise((resolve, reject) => {
		if(linksToVisit.length > 0){
			var nextUrl = linksToVisit.shift();
			console.log("next url ", nextUrl)
			currentConnections++
			crawlAndCollectLinks(nextUrl)
			.then(write => resolve())
		}	
	})
}

function main() {
	startCrawling()
	.then(urls => writeUrlsToCsv(urls))
	.then(function() {
		console.log("Written files to Csv")
		process.exit()
	})
	.catch(err =>{
		console.log("some error occured");
	})
}


linksToVisit.push(baseUrl + '/');
var startTime = new Date();
console.log("links to visit" , linksToVisit)
main()