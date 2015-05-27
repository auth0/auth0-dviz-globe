function buildCollectionName(d) {
  return 'hour' + d.getUTCFullYear() + (d.getUTCMonth() + 1) + d.getUTCDate() + d.getUTCHours();  
}

function PlayTimelapse() {
  $('#play').attr('disabled',true).val('Playing...');

  initTimelapse(23);
}

function initTimelapse(index) {
  setTimeout(function(index){
    return timelapseInterval;
  }(index), 1000);
}

function timelapseInterval() {
  index--;
  loadData(index);
  $('#timelapse').val(23 - index);

  if (index == 0) {
    $('#play').removeAttr('disabled').val('Play');
  }
  else {
    initTimelapse(index);
  }
}

if(!Detector.webgl){
	Detector.addGetWebGLMessage();
} else {
	var container = document.getElementById('container');
	var globe = new DAT.Globe(container);

	var loadData = function(value) {

    var now = new Date();

    now.setHours(now.getHours() - parseInt(value));

    $.ajax( "https://auth0-logins-processor.herokuapp.com/list", {data:{filter:buildCollectionName(now)}})
      .done(function(data) {
        window.data = data;
        globe.clearData();
        globe.addJSONData(data);
        globe.createPoints();
        globe.animate();
      })
      .fail(function() {
        alert( "error" );
      });

	};
	
	loadData(0);
}