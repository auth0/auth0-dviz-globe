var bubbles = new Bubbles();
var equalizer = new Equalizer();

var pusher = new Pusher('54da1f9bddbf14929983');
var channel = pusher.subscribe('world_map');

var loginCount = 0;
var counters = null;

d3.json("http://metrics.it.auth0.com/counters", function(err, data) {
  counters = data;
  updateCounters();
  renderData();
})

channel.bind('login', function(data) {

    if (bubbles.visible) bubbles.pushData(data);

    equalizer.pushData(data, 'login');

    var randomValue = Math.random();
    if (randomValue > 0.325) equalizer.pushData(data, 'signup');
    if (randomValue > 0.05) equalizer.pushData(data, 'resetPassword');
    if (randomValue > 0.025) equalizer.pushData(data, 'suspicious');

    loginCount++;
});

function renderData() {
  equalizer.updateData();
  updateCounters();
  setTimeout( renderData , 500 + 500 * Math.random());
}

function updateCounters(){
  d3.select('.tokens .counter').html(counters.tokens);
  d3.select('.logins .counter').html(counters.logins + loginCount);
  d3.select('.apps .counter').html(counters.apps);
}

function testScroll(ev){
  mapScroll(ev);
  if(!bubbles.visible){
    var bubblesPosition = document.getElementById('bubbles').getBoundingClientRect();
    if(window.pageYOffset >= bubblesPosition.top) {
      bubbles.show();
    }
  }
}
window.onscroll=testScroll;
