var bubbles = new Bubbles();
var equalizer = new Equalizer();

var pusher = new Pusher('54da1f9bddbf14929983');
var channel = pusher.subscribe('world_map');

var counters = null;

$.ajax( "http://metrics.it.auth0.com/counters")
      .done(function(d) {

        counters = d;

        channel.bind('login', function(data) {
	
    			if (bubbles) bubbles.pushData(data);
    			equalizer.pushData(data, 'login');

          if (Math.random() > 0.4) equalizer.pushData(data, 'signup');
          if (Math.random() > 0.05) equalizer.pushData(data, 'resetPassword');
          if (Math.random() > 0.025) equalizer.pushData(data, 'suspicious');

    			counters.logins++;

    			updateCounters();

		    });

        renderEq();

      })
      .fail(function() {
        alert( "error" );
      });

function renderEq() {
  equalizer.updateData();
  setTimeout( renderEq , 500 + 500 * Math.random());
}

function updateCounters(){
	$('.tokens .counter').html(counters.tokens);
  $('.logins .counter').html(counters.logins);
  $('.apps .counter').html(counters.apps);
}
function testScroll(ev){
    if(!bubbles.initialized && window.pageYOffset>(window.innerHeight)) {
      bubbles.init();
    }
}
window.onscroll=testScroll
