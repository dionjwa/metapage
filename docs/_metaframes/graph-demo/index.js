/* Set up the metaframe channel */
var metaframe = new Metaframe();

/*
 * On input pipe update, send value to the graph
 */
metaframe.onInput("graph_input", function(category) {
	var now = new Date();
	if (category != null) {
		var obj = {
			// complex data item; four attributes (type, color, opacity and size) are changing dynamically with each iteration (as an example)
			time: now,
			color: color(d % 10),
			opacity: Math.max(Math.random(), 0.3),
			category: category.value,
			// category: randomNumberFromClick,//"Category2",
			//type: shapes[Math.round(Math.random() * (shapes.length - 1))], // the module currently doesn't support dynamically changed svg types (need to add key function to data, or method to dynamically replace svg object – tbd)
			type: "circle",
			size: Math.max(Math.round(Math.random() * 12), 4),
	    };
		chart.datum(obj);
	}
});

metaframe.ready.then(function() {
	metaframe.sendDimensions();

}, function(err) {
	console.error('Error setting up the metaframe connection');
});