var Bubbles = function(){

  var height=400,
    width = window.innerWidth,
    format = d3.format(",d"),
    color = d3.scale.category10();

  var timeout = 30 /* seconds */* 1000;

  var bubble = d3.layout.pack()
      .sort(null)
      .size([width, height])
      .padding(1.5);

  var svg = d3.select(".bubbles").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bubble");

  var bbData = [];

  function addData(d) {

    if (d.device === undefined) return;

    var item;
    var index = _.findIndex(bbData, function(e) {return e.name.toLowerCase() == d.strategy.toLowerCase();});

    if (index == -1) {
      item = {
        name: d.strategy,
        stamps: []
      }
      bbData.push(item);
      index = bbData.length - 1;
    }
    else {
      item = bbData[index];
    }

    var now = Date.now();

    item.stamps.push(now);

    bbData.forEach(function(e){
      e.stamps = _.filter(e.stamps, function(f) {
        return f > Date.now() - timeout;
      });
      e.value = e.stamps.length;
    });

    bbData = _.filter(bbData, function(e) {return e.value > 0});

  }

  function updateData() {
    if (bbData.length == 0) return;
    var newdata = _.clone(bbData);
    newdata = bubble.nodes({children:newdata}).filter(function(d) { return !d.children; });

    // var node = svg.selectAll(".node")
    //     .data(newdata)
    //   .enter().append("g")
    //     .attr("class", "node")
    //     .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; });

    // node.append("title")
    //     .text(function(d) { return d.name; });

    // node.append("circle")
    //     .attr("r", function(d) { return d.r; })
    //     .style("fill", function(d) { return color(d.name); });

    // node.append("text")
    //     .attr("dy", ".3em")
    //     .style("text-anchor", "middle")
    //     .text(function(d) { return d.name; });

    var nodes = svg.selectAll("circle.node")
        .data(newdata, function(d) { return d.name; });

    nodes.enter().append("circle")
        .classed("node", true)
        .style("fill", function(d) { return color(d.name); });

    nodes.exit().transition()
        .attr("r", 0)
        .remove();

    nodes.transition()
        .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
        .attr("r", function(d) { return d.r; });

    var textNodes = svg.selectAll("text.node")
        .data(newdata, function(d) { return d.name; });

    textNodes.enter().append("text")
        .classed("node", true)
        .text(function(d){return d.name;});

    textNodes.exit()
        .remove();

    textNodes.transition()
        .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
        .attr("dy", ".3em")
        .style("text-anchor", "middle");

  };


  d3.select(self.frameElement).style("height", height + "px");

  this.pushData = function(d) {
    addData(d);
    updateData();
  };

};