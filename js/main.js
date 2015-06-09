var bubbles = new Bubbles();
var equalizer = new Equalizer();

var pusher = new Pusher('54da1f9bddbf14929983');
var channel = pusher.subscribe('world_map');

var loginCount = 0;
var counters = null;
var renderEq = false;
var renderBubbles = false;

var numberFormat = d3.format(",");

d3.json("http://metrics.it.auth0.com/counters", function(err, data) {
  counters = data;
  updateCounters();
  renderData();
})

channel.bind('login', function(data) {

    addCharacter(data.geo.lat,data.geo.lng);

    if (bubbles.visible && renderBubbles) bubbles.pushData(data);

    equalizer.pushData(data, 'login');

    var randomValue = Math.random();
    if (randomValue > 0.325) equalizer.pushData(data, 'signup');
    if (randomValue > 0.05) equalizer.pushData(data, 'resetPassword');
    if (randomValue > 0.025) equalizer.pushData(data, 'suspicious');

    loginCount++;
});

function renderData() {
  if (renderEq) equalizer.updateData();
  updateCounters();
  setTimeout( renderData , 500 + 500 * Math.random());
}

function updateCounters(){
  d3.select('.tokens .counter').html(numberFormat(counters.tokens));
  d3.select('.logins .counter').html(numberFormat(counters.logins + loginCount));
  d3.select('.apps .counter').html(numberFormat(counters.apps));
}

function bubblesScroll(ev) {
  var top = window.innerHeight + 300 + 420;
  var viewportBottom = getViewportBottom();

  if(!bubbles.visible && viewportBottom >= top) {
      bubbles.show();
  }
  else
  {
    renderBubbles = viewportBottom >= SCREEN_HEIGHT;
  }
}
function eqScroll(ev) {
  var top = window.innerHeight + 300;
  renderEq = (getViewportBottom() >= top);
}
function getViewportBottom() {
  return window.pageYOffset + window.innerHeight;
}
function testScroll(ev){
  mapScroll(ev);
  bubblesScroll(ev);
  eqScroll(ev);
}
window.onscroll=testScroll;
