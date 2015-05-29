var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.bottom = '0px';

document.body.appendChild( stats.domElement );

//================================================================


if(!Detector.webgl){
	Detector.addGetWebGLMessage();
} else {
	var container = document.getElementById('container');
	var globe = new DAT.Globe(container);
}