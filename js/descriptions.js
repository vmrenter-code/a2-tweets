var written_tweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	written_tweets = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	}).filter(function(tweet) {
		return tweet.written;
	});
}

function addEventHandlerForSearch() {
	var searchBox = document.getElementById('textFilter');
	var searchCount = document.getElementById('searchCount');
	var searchText = document.getElementById('searchText');
	var table = document.getElementById('tweetTable');

	searchCount.innerText = 0;
	searchText.innerText = '';

	searchBox.addEventListener('input', function() {
		var query = searchBox.value;
		searchText.innerText = query;

		if (query === '') {
			searchCount.innerText = 0;
			table.innerHTML = '';
			return;
		}

		var lowerQuery = query.toLowerCase();
		var matches = written_tweets.filter(function(tweet) {
			return tweet.writtenText.toLowerCase().includes(lowerQuery);
		});

		searchCount.innerText = matches.length;
		table.innerHTML = matches.map(function(tweet, index) {
			return tweet.getHTMLTableRow(index + 1);
		}).join('');
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});
