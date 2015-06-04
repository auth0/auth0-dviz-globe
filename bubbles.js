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

  updateData();

  function updateData() {

    x.domain([0,145]);
    y.domain([0,115]);

    var nodes = svg.selectAll("circle.node")
        .data(bbData)
          .enter()
        .append('circle')
          .attr('class', function(d) { return 'node '+d.name;})
          .attr("transform", function(d) {return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
          .attr("r", function(d) { return y(d.r); });

  };

  // function updateData() {
  //   if (bbData.length == 0) return;
  //   var newdata = _.clone(bbData);
  //   newdata = bubble.nodes({children:newdata}).filter(function(d) { return !d.children; });

  //   var nodes = svg.selectAll("circle.node")
  //       .data(newdata, function(d) { return d.name; });

  //   nodes.enter().append("circle")
  //       .classed("node", true)
  //       .style("fill", function(d) { return color(d.name); });

  //   nodes.exit().transition()
  //       .attr("r", 0)
  //       .remove();

  //   nodes.transition()
  //       .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
  //       .attr("r", function(d) { return d.r; });

  //   var textNodes = svg.selectAll("text.node")
  //       .data(newdata, function(d) { return d.name; });

  //   textNodes.enter().append("text")
  //       .classed("node", true)
  //       .text(function(d){return d.name;});

  //   textNodes.exit()
  //       .remove();

  //   textNodes.transition()
  //       .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
  //       .attr("dy", ".3em")
  //       .style("text-anchor", "middle");

  // };


  d3.select(self.frameElement).style("height", height + "px");

  this.pushData = function(d) {

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

};