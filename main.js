var bubbles = new Bubbles();
var equalizer = new Equalizer();

var pusher = new Pusher('54da1f9bddbf14929983');
var channel = pusher.subscribe('world_map');

channel.bind('login', function(data) {
	
	bubbles.pushData(data);
	equalizer.pushData(data);

});