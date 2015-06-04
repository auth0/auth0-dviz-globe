var Equalizer = function(){
	
	var timeout = 30 /* seconds */* 1000;
	var size = {
		height:400,
		width: window.innerWidth,
		padding:20,
		xAxisWidth:40,
		yAxisHeight:80
	}
	var xAxisCircleRadius = 25;
	var eqData = [];
	var height = size.height - size.padding * 2 - size.yAxisHeight;
	var width = size.width - size.padding * 2 - size.xAxisWidth;

	var eq = d3.select('.equalizer svg')
		.attr("width", size.width)
	    .attr("height", size.height);

	var texturesArr = [];

	var bars = eq.append('g').attr("transform", "translate(" + [ size.padding + size.xAxisWidth,size.padding] + ")");
	var xAxisEl = eq.append('g').attr('class','x axis').attr("transform", function(d,i) {return "translate(" + [size.padding + size.xAxisWidth, size.height - size.yAxisHeight + 10] + ")"; });;

	var x = d3.scale.ordinal().rangeBands([0, width], 0.1);
	var y = d3.scale.linear().range([height, 0]);
	var colors = d3.scale.category10();

	var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

	var yAxisEl = eq.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + [ size.xAxisWidth, size.padding] + ")")
			.call(yAxis);

	var types = {'signup':0, 'login':1, 'suspicious':2, 'resetPassword':3};
	var typeNames = Object.keys(types);

	Object.keys(types).forEach(function(t) {
		eqData[types[t]] = [];
	})

	function addData(d, type) {

		if (d.browser === undefined) return;

		var item;
		var index = _.findIndex(eqData[types[type]], 
			function(e) {return e.x.toLowerCase() == d.browser.toLowerCase();}
		);

		if (index === -1) {

			Object.keys(types).forEach(function(t) {
				eqData[types[t]].push({
					x: d.browser,
					y: 0,
					cleanUpName:d.browser.replace(' ', '_').toLowerCase()
				})
				console.log(d.browser.replace(' ', '_').toLowerCase());
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
				.style("fill", 'url(#'+ typeNames[index] +'-pattern)');

			rects.transition()
				.attr("x", function(d, i) { return x(i); })
				.attr("y", function(d) { return y(d.y + d.y0); })
				.attr("height", function(d) { return height-y(d.y); })
				.attr("width", x.rangeBand());

  		});

		var xItems = xAxisEl.selectAll('g.item')
				.data(eqData[0]);
		
		var xItem = xItems.enter().append('g')
				.classed('item',true)
				.attr("transform", function(d,i) {return "translate(" + [x(i) + (x.rangeBand() / 2), 0] + ")"; });

		xItem.append('circle')
				.attr('class',function(d){ return d.cleanUpName; },true)
				.attr("r",xAxisCircleRadius);

		xItem.append('image')
				.attr('xlink:href', function(d){ return 'img/browser/' + d.cleanUpName + '.png'; })
				.attr('x',-25)
				.attr('y',-25)
				.attr('height',50)
				.attr('width',50);

		xItems.transition()
				.attr("transform", function(d,i) {return "translate(" + [x(i) + (x.rangeBand() / 2), 0] + ")"; });
	}

	function getTexture(i) {

		if (texturesArr.length > i) return texturesArr[i];

		var texture = textures.lines()
		    .orientation("horizontal")
		    .size(5)
			.strokeWidth(3);

		eq.call(texture);

		texturesArr[i] = texture.url();
		return texturesArr[i];
	}

	this.pushData = function(d, type) {
	    addData(d, type);
	    updateData();
	  };

}
