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

	function addData(d) {

		if (d.device === undefined) return;

		var item;
		var index = _.findIndex(eqData, function(e) {return e.name.toLowerCase() == d.device.toLowerCase();});

		if (index == -1) {
			item = {
				name: d.device,
				stamps: []
			}
			eqData.push(item);
			index = eqData.length - 1;
		}
		else {
			item = eqData[index];
		}

		var now = Date.now();

		item.stamps.push(now);

		eqData.forEach(function(e){
			// e.stamps = _.filter(e.stamps, function(f) {
			// 	return f > Date.now() - timeout;
			// });
			e.value = e.stamps.length;
		});

		// eqData = _.filter(eqData, function(e) {return e.value > 0});

	}

	function updateData() {
		var maxValue = d3.max(eqData,function(d) { return d.value; });

		x.domain(_.range(0,eqData.length,1));
		y.domain([0, maxValue]);
		eq.select("g.y.axis").call(yAxis/*.ticks(5)*/);

		var rects = bars.selectAll('rect.value').data(eqData);    
		rects.enter()
				.append('rect')
					.classed('value',true)
					.attr("height", 0)
				    .attr("x", function(d, i) { return x(i); }) 
					.attr("y", height)
					.attr("width", x.rangeBand())
					.style("fill", function(d,i){ return getTexture(i); });

		rects.exit().remove();

		rects.transition()
					.attr("y", function(d) { return y(d.value); })
					.attr("height", function(d) { return height-y(d.value); })
					.attr("width", x.rangeBand())
					.attr("x", function(d, i) { return x(i); });

		var texts = bars.selectAll('text.xaxis').data(eqData);
		texts.enter()
				.append('text')
					.classed('xaxis',true)
				    .attr("x", function(d, i) { return x(i) + (x.rangeBand() / 2); }) 
					.attr("y", height + size.padding)
					.text(function(d){return d.name;});

		texts.exit().remove();

		texts.transition().attr("x", function(d, i) { return x(i) + (x.rangeBand()/2); });
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

	this.pushData = function(d) {
	    addData(d);
	    updateData();
	  };

}
