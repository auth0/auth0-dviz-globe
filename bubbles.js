var Bubbles = function(){

  var width = window.innerWidth,
      height=width / 1.85,
      format = d3.format(",d"),
      color = d3.scale.category10();

  var timeout = 30 /* seconds */* 1000;

  var bubble = d3.layout.pack()
      .sort(null)
      .size([width, height])
      .padding(100);

  var svg = d3.select(".bubbles").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bubble");

  var x = d3.scale.linear().range([0, width]);
  var y = d3.scale.linear().range([0, height]);

  // var bbData = [];

  // function addData(d) {

  //   if (d.browser === undefined) return;

  //   var item;
  //   var index = _.findIndex(bbData, function(e) {return e.name.toLowerCase() == d.strategy.toLowerCase();});

  //   if (index == -1) {
  //     item = {
  //       name: d.strategy,
  //       stamps: []
  //     }
  //     bbData.push(item);
  //     index = bbData.length - 1;
  //   }
  //   else {
  //     item = bbData[index];
  //   }

  //   var now = Date.now();

  //   item.stamps.push(now);

  //   bbData.forEach(function(e){
  //     e.stamps = _.filter(e.stamps, function(f) {
  //       return f > Date.now() - timeout;
  //     });
  //     e.value = e.stamps.length;
  //   });

  //   bbData = _.filter(bbData, function(e) {return e.value > 0});

  // }

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

    var nodes = svg.selectAll("circle.node")
        .data(bbData)
          .enter()
        .append('circle')
          .attr('class', function(d) { return 'node '+d.name;})
          .attr("transform", "translate(" + (width/2) + "," + (height/2) + ")")
          .attr("r", 0)
        .transition().delay(function(d,i){ return 50 * i; })
          .attr("transform", function(d) {return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
          .attr("r", function(d) { return y(d.r); });

  };

  this.pushData = function(d) {

    console.log(d.strategy);

    var index = _.findIndex(bbData, function(e) {return e.name.toLowerCase() == d.strategy.toLowerCase();});

    if (index === -1) {    
      return;
    }

    svg.selectAll("circle.node." + d.strategy)
      .transition()
        .attr('r', y(bbData[index].r * 1.2))
      .transition()
        .attr('r', y(bbData[index].r));

  };
  var self=this;
  this.initialized = false;
  this.init = function(){
    if (self.initialized) return;
    self.initialized = true;
    loadData();
  }

};