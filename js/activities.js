function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//Count how many completed tweets there are of each activity type
	var completed = tweet_array.filter(function(tweet) {
		return tweet.source === 'completed_event' && tweet.activityType !== 'unknown';
	});
	var activityCounts = {};
	completed.forEach(function(tweet) {
		activityCounts[tweet.activityType] = (activityCounts[tweet.activityType] || 0) + 1;
	});

	//Turn the counts into an array sorted from most to least frequent
	var activityData = Object.keys(activityCounts).map(function(activity) {
		return {'activity': activity, 'count': activityCounts[activity]};
	}).sort(function(a, b) { return b.count - a.count; });

	document.getElementById('numberActivities').innerText = activityData.length;
	document.getElementById('firstMost').innerText = activityData[0].activity;
	document.getElementById('secondMost').innerText = activityData[1].activity;
	document.getElementById('thirdMost').innerText = activityData[2].activity;

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityData
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {"field": "activity", "type": "nominal", "sort": "-y", "title": "Activity type"},
	    "y": {"field": "count", "type": "quantitative", "title": "Number of tweets"}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//Distances of the three most-tweeted activities, labeled by day of the week
	var topActivities = activityData.slice(0, 3).map(function(entry) { return entry.activity; });
	var distanceData = completed.filter(function(tweet) {
		return topActivities.includes(tweet.activityType);
	}).map(function(tweet) {
		return {
			'activityType': tweet.activityType,
			'distance': tweet.distance,
			'day': tweet.time.toLocaleDateString('en-US', {weekday: 'short'})
		};
	});

	var dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Distances of the three most-tweeted activities by day of the week.",
	  "data": {"values": distanceData},
	  "mark": "point",
	  "encoding": {
	    "x": {"field": "day", "type": "ordinal", "sort": dayOrder, "title": "Day of the week"},
	    "y": {"field": "distance", "type": "quantitative", "title": "Distance (mi)"},
	    "color": {"field": "activityType", "type": "nominal", "title": "Activity type"}
	  }
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

	distance_vis_aggregated_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Mean distances of the three most-tweeted activities by day of the week.",
	  "data": {"values": distanceData},
	  "mark": "point",
	  "encoding": {
	    "x": {"field": "day", "type": "ordinal", "sort": dayOrder, "title": "Day of the week"},
	    "y": {"aggregate": "mean", "field": "distance", "type": "quantitative", "title": "Mean distance (mi)"},
	    "color": {"field": "activityType", "type": "nominal", "title": "Activity type"}
	  }
	};
	vegaEmbed('#distanceVisAggregated', distance_vis_aggregated_spec, {actions:false});

	//Answers read from the aggregated graph (hard-coding is allowed here)
	document.getElementById('longestActivityType').innerText = 'bike';
	document.getElementById('shortestActivityType').innerText = 'walk';
	document.getElementById('weekdayOrWeekendLonger').innerText = 'weekends';
}

//Alternate between the all-points graph and the mean graph
function addEventHandlerForAggregate() {
	var button = document.getElementById('aggregate');
	var allVis = document.getElementById('distanceVis');
	var meanVis = document.getElementById('distanceVisAggregated');
	meanVis.style.display = 'none';

	button.addEventListener('click', function() {
		var showingMeans = allVis.style.display === 'none';
		allVis.style.display = showingMeans ? '' : 'none';
		meanVis.style.display = showingMeans ? 'none' : '';
		button.innerText = showingMeans ? 'Show means' : 'Show all activities';
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForAggregate();
	loadSavedRunkeeperTweets().then(parseTweets);
});
