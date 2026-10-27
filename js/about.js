function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//Search for the tag w/ numTweets ID
	document.getElementById('numberTweets').innerText = tweet_array.length;

	var dateOptions = {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'};
	var times = tweet_array.map(function(tweet) { return tweet.time.getTime(); });
	document.getElementById('firstDate').innerText = new Date(Math.min(...times)).toLocaleDateString('en-US', dateOptions);
	document.getElementById('lastDate').innerText = new Date(Math.max(...times)).toLocaleDateString('en-US', dateOptions);

	var categories = {
		'completed_event': 'completedEvents',
		'live_event': 'liveEvents',
		'achievement': 'achievements',
		'miscellaneous': 'miscellaneous'
	};
	for (var source in categories) {
		var count = tweet_array.filter(function(tweet) { return tweet.source === source; }).length;
		setClassText(categories[source], count);
		setClassText(categories[source] + 'Pct', formatPercent(count / tweet_array.length));
	}

	//Count tweets
	var completed = tweet_array.filter(function(tweet) { return tweet.source === 'completed_event'; });
	var writtenCount = completed.filter(function(tweet) { return tweet.written; }).length;
	setClassText('written', writtenCount);
	setClassText('writtenPct', formatPercent(writtenCount / completed.length));
}

function setClassText(className, text) {
	document.querySelectorAll('.' + className).forEach(function(element) {
		element.innerText = text;
	});
}

function formatPercent(fraction) {
	return math.format(fraction * 100, {notation: 'fixed', precision: 2}) + '%';
}

//Load Dom
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});