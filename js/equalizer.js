var Equalizer = function(){
	
	var timeout = 30 /* seconds */* 1000;
	
	var eqData = [];

	var height = 420;
	var width = window.innerWidth;
	var browserIcon = 70;
	var barsHeight = height - browserIcon;
	var backgroundLineHeight = 7;

	var eq = d3.select('.equalizer')
			.style('height', height + 'px');

	var texturesArr = [];

	var x = d3.scale.ordinal().rangeBands([0, width], 0.1);
	var y = d3.scale.linear().range([barsHeight, 0]);

	var bars = eq.append('div').attr('class','content');

	var types = ['signup', 'login', 'suspicious', 'resetPassword'];
	var typeIndex = [];
	types.forEach(function(v,i){
		typeIndex[v]=i;
	});
	var browserIndex = {};

	function addData(d, type) {

		if (d.browser === undefined) return;

		var index = browserIndex[ d.browser.toLowerCase() ];

		if (index === undefined) {

			var item = {
				name: d.browser,
				total: 0,
				cleanUpName:d.browser.replace(' ', '_').toLowerCase(),
				values:[]
			};

			types.forEach(function(t) {
				item.values[ typeIndex[t] ] = {
					total:0, 
					type:t,
					y0: 0,
					y:0
				};
			})

			item.values[ typeIndex[type] ].total++;
			item.values[ typeIndex[type] ].y++;
			item.total++;
			
			eqData.push(item) 

			index = eqData.length - 1;

			browserIndex[ d.browser.toLowerCase() ] = index;
		}
		else
		{
			eqData[index].values[ typeIndex[type] ].total++;
			eqData[index].total++;

  			var floor = 0;

  			types.forEach(function(t){
  				eqData[index].values[ typeIndex[t] ].y0 = floor;
  				eqData[index].values[ typeIndex[t] ].y = eqData[index].values[ typeIndex[t] ].total;
  				floor += eqData[index].values[ typeIndex[t] ].total;
  			})

		}

	}

	function updateData() {

		x.domain(_.range(0,eqData.length,1));
  		y.domain([0, d3.max(eqData, function(d) { return d.total; })]);

		var rects = bars.selectAll("div.col")
			.data(eqData);

		var col = rects.enter().append("div")
			.attr('class', function(d){return 'col ' + d.cleanUpName;})
			.style("width", x.rangeBand() + 'px')
			.style("left", function(d, i) { return (x(i))+ 'px'; })
			.style("top", 0)
			.style("height", height + 'px');

		col.append("div")
			.classed('detail',true)
			.append('div').classed('icon',true);

		rects
			.style("width", x.rangeBand() + 'px')
			.style("left", function(d, i) { return (x(i))+ 'px'; });

		var colTypes = rects.selectAll('div.type')
			.data(function(d){ return d.values; });
		
		colTypes.enter().append('div')
			.attr('class', function(d){return 'type ' + d.type;})
			.style("top", function(d) { return ceilHeight(y(d.y + d.y0))+ 'px'; })
			.style("left", 0)
			.style("height", function(d) { return ceilHeight(barsHeight-y(d.y))+ 'px'; })
			.style('width', "100%");

		colTypes
			.style("top", function(d) { return ceilHeight(y(d.y + d.y0))+ 'px'; })
			.style("height", function(d) { return ceilHeight(barsHeight-y(d.y))+ 'px'; });
	}

	function ceilHeight(value) {
		return Math.ceil(Math.ceil(value)/backgroundLineHeight) * backgroundLineHeight;
	}


	this.pushData = function(d, type) {
	    addData(d, type);
	};

	this.updateData = updateData;

}
