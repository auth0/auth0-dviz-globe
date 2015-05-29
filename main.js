var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.bottom = '0px';

document.body.appendChild( stats.domElement );

//================================================================

var data = [];
var currentFilter = noFilter;

function noFilter(arr) {
  arr.forEach(function(e){
    if (e.strategies_original) {
      e.strategies = e.strategies_original;
    }
  });
  return arr;
}
function deviceFilter(arr) {
  return _.filter(arr, function(e) {
    return (e.devices['Mac OS X'] != undefined);
  });
}
function strategyFilter(arr) {
  return _.filter(arr, function(e) {

    if (e.strategies['facebook'] != undefined) {
      e.strategies_original = e.strategies;

      e.strategies = {
        facebook:e.strategies['facebook']
      }
      return true;
    }
    return false;

  });
}

function updateFilter(filter) {
  currentFilter = filter;
  loadData($('#timelapse').val());
}

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

  $('#loading').show();
  preloadData(23, new Date(), function(index) {

    $('#loading').html( "Loading " + Math.ceil((23-index) * 100/23) + '%');

    if (index == 23) { 
      loadData(index); 
    }
    if (index == 0) { 
      $('#play').removeAttr('disabled');
      $('#timelapse').removeAttr('disabled');
      $('#loading').hide();
    }
  });
}

var animated = false;

function loadData(index) {

  globe.clearData();
  globe.addData(currentFilter(data[index]));
  globe.createPoints();
  
  if (!animated) {
    animated = true;
    globe.animate();
  }

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

//================================================================
