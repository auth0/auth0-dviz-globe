var Equalizer = function(){
	
	var timeout = 30 /* seconds */* 1000;
	var size = {
		height:400,
		width: window.innerWidth,
		padding:20,
		axisWidth:40
	}
	var eqData = [];
	var height = size.height - size.padding * 2 - size.axisWidth;
	var width = size.width - size.padding * 2 - size.axisWidth;

	var eq = d3.select('.equalizer').append('svg')
		.attr("width", size.width)
	    .attr("height", size.height);

	var texturesArr = [];

	var bars = eq.append('g').attr("transform", "translate(" + [ size.padding + size.axisWidth,size.padding + size.axisWidth] + ")");

	var x = d3.scale.ordinal().rangeBands([0, width], 0.1);
	var y = d3.scale.linear().range([height, 0]);
	var colors = d3.scale.category10();

	var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

	var yAxisEl = eq.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + [ size.axisWidth, size.padding + size.axisWidth ] + ")")
			.call(yAxis);

	var types = {'signup':0, 'login':1, 'resetPassword':2, 'suspicious':3};
	var typeNames = Object.keys(types);

	Object.keys(types).forEach(function(t) {
		eqData[types[t]] = [];
	})

	function addData(d, type) {

		if (d.device === undefined) return;

		var item;
		var index = _.findIndex(eqData[types[type]], 
			function(e) {return e.x.toLowerCase() == d.device.toLowerCase();}
		);

		if (index === -1) {

			Object.keys(types).forEach(function(t) {
				eqData[types[t]].push({
					x: d.device,
					y: 0
				})
			}) 

			index = eqData[types[type]].length - 1;
		}

		item = eqData[types[type]][index].y++;

	}

	function updateData() {

		var stackedData = d3.layout.stack()(eqData);

		x.domain(_.range(0,eqData[0].length,1));
  		y.domain([0, d3.max(stackedData[stackedData.length - 1], function(d) { return d.y0 + d.y; })]);

  		stackedData.forEach(function(typeData, index){

  			var rects = bars.selectAll("rect."+typeNames[index])
				.data(typeData);

			rects.enter().append("rect")
				.classed(typeNames[index],true)
				.attr("x", function(d, i) { return x(i); })
				.attr("y", function(d) { return y(d.y + d.y0); })
				.attr("height", function(d) { return height-y(d.y); })
				.attr("width", x.rangeBand())
				.style("fill", getTexture(index));

			rects.transition()
				.attr("x", function(d, i) { return x(i); })
				.attr("y", function(d) { return y(d.y + d.y0); })
				.attr("height", function(d) { return height-y(d.y); })
				.attr("width", x.rangeBand());

  		});

		// var texts = bars.selectAll('text.xaxis').data(eqData);
		// texts.enter()
		// 		.append('text')
		// 			.classed('xaxis',true)
		// 		    .attr("x", function(d, i) { return x(i) + (x.rangeBand() / 2); }) 
		// 			.attr("y", height + size.padding)
		// 			.text(function(d){return d.x;});

		// texts.transition().attr("x", function(d, i) { return x(i) + (x.rangeBand()/2); });
	}

	function getTexture(i) {

		if (texturesArr.length > i) return texturesArr[i];

		var texture = textures.lines()
		    .orientation("horizontal")
		    .size(5)
			.strokeWidth(3)
		    .stroke(colors(i));

		eq.call(texture);

		texturesArr[i] = texture.url();
		return texturesArr[i];
	}

	this.pushData = function(d, type) {
	    addData(d, type);
	    updateData();
	  };

}
