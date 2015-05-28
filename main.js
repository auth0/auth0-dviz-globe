var data = [];

function buildCollectionName(d) {
  return 'hour' + d.getUTCFullYear() + (d.getUTCMonth() + 1) + d.getUTCDate() + d.getUTCHours();  
}

function PlayTimelapse() {
  $('#play').attr('disabled',true).val('Playing...');
  $('#timelapse').attr('disabled',true);
  initTimelapse(0);
}

function initTimelapse(index) {

  setTimeout(function(i){

    var index = i;
    return function() {
        loadData(index);
        $('#timelapse').val(index);

        if (index == 23) {
          $('#play').removeAttr('disabled').val('Play');
          $('#timelapse').removeAttr('disabled');
        }
        else {
          initTimelapse(index+1);
        }
      };

  }(index), 1000);

}

if(!Detector.webgl){
	Detector.addGetWebGLMessage();
} else {
	var container = document.getElementById('container');
	var globe = new DAT.Globe(container);

  preloadData(23, new Date(), function(index) {
    if (index == 23) { 
      loadData(index); 
    }
    if (index == 0) { 
      $('#play').removeAttr('disabled');
      $('#timelapse').removeAttr('disabled');
    }
  });
}

function loadData(index) {
  globe.clearData();
  globe.addJSONData(data[index]);
  globe.createPoints();
  globe.animate();
}

function preloadData(index, date, afterLoadCallback) {
  if (index == -1) return;
  $.ajax( "https://auth0-logins-processor.herokuapp.com/list", {data:{filter:buildCollectionName(date)}})
      .done(function(d) {
        data[index] = d;
        afterLoadCallback(index);

        date.setHours(date.getHours() -1);
        preloadData(index - 1, date, afterLoadCallback);

      })
      .fail(function() {
        alert( "error" );
      });

}