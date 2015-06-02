var bubbles = new Bubbles();
var equalizer = new Equalizer();

var pusher = new Pusher('54da1f9bddbf14929983');
var channel = pusher.subscribe('world_map');

var counters = null;

$.ajax( "http://auth0-logins-processor.herokuapp.com/settings")
      .done(function(d) {

        counters = d;

        channel.bind('login', function(data) {
	
			bubbles.pushData(data);
			equalizer.pushData(data);

			counters.logins++;

			updateCounters();

		});

      })
      .fail(function() {
        alert( "error" );
      });

function updateCounters(){
	$('.tokens .counter').html(counters.tokens);
    $('.logins .counter').html(counters.logins);
    $('.apps .counter').html(counters.apps);
}