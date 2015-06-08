var Bubbles = function(){

  var width = window.innerWidth,
      height=width / 1.85;

  var bubbleGrowOnEvent = 1.4;
  var deltaMoveOnEvent = (bubbleGrowOnEvent - 1) / 2;

  var timeout = 30 /* seconds */* 1000;

  var svg = d3.select(".bubbles")//.append("svg")
      .style("width", width+"px")
      .style("height", height+"px")
      .attr("class", "bubbles");

  var x = d3.scale.linear().range([0, width]);
  var y = d3.scale.linear().range([0, height]);

  var bbData = [
    {name: 'facebook'   , r: 30, x: 20,  y:45},
    {name: 'googlePlus' , r: 22, x: 45,  y:20},
    {name: 'wordpress'  , r: 18, x: 30,  y:80},
    {name: 'github'     , r: 26, x: 55,  y:55},
    {name: 'instagram'  , r: 18, x: 55,  y:90},
    {name: 'linkedin'   , r: 20, x: 80,  y:40},
    {name: 'twitter'    , r: 20, x: 100, y:60},
    {name: 'dropbox'    , r: 20, x: 105, y:30},
    {name: 'tumblr'     , r: 12, x: 125, y:40},
    {name: 'blogger'    , r: 20, x: 80,  y:80},
    {name: 'yahoo'      , r: 12, x: 105, y:95},
    {name: 'soundcloud' , r: 20, x: 125, y:70}
  ];
  var validStrategies = {};
  bbData.forEach(function(d){
    validStrategies[d.name] = 1;
  });

  function loadData() {

    x.domain([10,145]);
    y.domain([0,115]);

    var nodes = svg.selectAll("div.node")
        .data(bbData)
          .enter()
        .append('div')
          .attr('class', function(d) { return 'node '+d.name;});
          
  };

  this.pushData = function(d) {

    if (validStrategies[d.strategy.toLowerCase()] === undefined) return;

    svg.selectAll(".node." + d.strategy)
          .style("left", function(d) { return x(d.x - (d.r * deltaMoveOnEvent))+'px'; })
          .style("top", function(d) { return y(d.y - (d.r * deltaMoveOnEvent))+'px'; })
          .style("width", function(d) { return y(d.r * bubbleGrowOnEvent)+'px'; })
          .style("height", function(d) { return y(d.r * bubbleGrowOnEvent)+'px'; });

    setTimeout(function(){
        svg.selectAll(".node." + d.strategy)
          .style("left", function(d) { return x(d.x)+'px'; })
          .style("top", function(d) { return y(d.y)+'px'; })
          .style("width", function(d) { return y(d.r)+'px'; })
          .style("height", function(d) { return y(d.r)+'px'; });
    }, 300);


  };

  function showBubbles() {
    svg.selectAll("div.node")
          .style("left", function(d) { return x(d.x)+'px'; })
          .style("top", function(d) { return y(d.y)+'px'; })
          .style("width", function(d) { return y(d.r)+'px'; })
          .style("height", function(d) { return y(d.r)+'px'; });
  }

  var self=this;

  loadData();


  this.visible = false;
  this.show = function(){
    if (self.visible) return;
    self.visible = true;
    showBubbles();
  }

};