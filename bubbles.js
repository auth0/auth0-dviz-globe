var Bubbles = function(){

  var width = window.innerWidth,
      height=width / 1.85;

  var svg = d3.select(".bubbles")
        .style("width", width + "px")
        .style("height", height + "px");

  var x = d3.scale.linear().range([0, width]);
  var y = d3.scale.linear().range([0, height]);

  var bbData = [
    {name: 'facebook'   , r: 15, x: 20,  y:45},
    {name: 'googlePlus' , r: 11, x: 45,  y:20},
    {name: 'wordpress'  , r: 9,  x: 30,  y:80},
    {name: 'github'     , r: 13, x: 55,  y:55},
    {name: 'instagram'  , r: 9,  x: 55,  y:90},
    {name: 'linkedin'   , r: 10, x: 80,  y:40},
    {name: 'twitter'    , r: 10, x: 100, y:60},
    {name: 'dropbox'    , r: 10, x: 105, y:30},
    {name: 'tumblr'     , r: 6,  x: 125, y:40},
    {name: 'blogger'    , r: 10, x: 80,  y:80},
    {name: 'yahoo'      , r: 6,  x: 105, y:95},
    {name: 'soundcloud' , r: 10, x: 125, y:70}
  ];

  function loadData() {

    x.domain([0,145]);
    y.domain([0,115]);

    var nodes = svg.selectAll("div.node")
        .data(bbData)
          .enter()
        .append('div')
          .attr('class', function(d) { return 'node '+d.name;})
          .style('top', height/2 + "px")
          .style('left', width/2 + "px")
          .style("height", 0)
          .style("width", 0)
        .transition().delay(function(d,i){ return 50 * i; })
          .style("top", function(d) { return y(d.y) + "px"; })
          .style("left", function(d) { return x(d.x) + "px"; })
          .style("height", function(d) { return x(d.r) + "px"; })
          .style("width", function(d) { return x(d.r) + "px"; })
          .style("border-radius", function(d) { return (x(d.r)/2) + "px"; });

  };

  this.pushData = function(d) {

    var index = _.findIndex(bbData, function(e) {return e.name.toLowerCase() == d.strategy.toLowerCase();});

    if (index === -1) {    
      return;
    }

    svg.selectAll(".node." + d.strategy)
      .transition()
        .style('width', x(bbData[index].r * 1.2) + 'px')
        .style('height', x(bbData[index].r * 1.2) + 'px')
        .style('border-radius', x(bbData[index].r * 1.2 / 2) + 'px')
        .style('left', x(bbData[index].x - bbData[index].r * 0.1) + 'px')
        .style('top',y(bbData[index].y - bbData[index].r * 0.1) + 'px')
      .transition()
        .style('border-radius', x(bbData[index].r / 2) + 'px')
        .style('width', x(bbData[index].r) + 'px')
        .style('height', x(bbData[index].r) + 'px')
        .style('left', x(bbData[index].x) + 'px')
        .style('top',y(bbData[index].y) + 'px');

  };
  var self=this;
  this.initialized = false;
  this.init = function(){
    if (self.initialized) return;
    self.initialized = true;
    loadData();
  }

};