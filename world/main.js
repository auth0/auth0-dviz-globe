var container, renderer, controls, stats;
var scene, atmosphereScene;
var camera, camera2;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var cube;
var debug = false;
var charactersGroup = new THREE.Object3D();
var ratamahatta = null;

var onRenderFcts = [];

var mapEnabled = true;
var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;

init();
animate();

function mapScroll(ev){
	if(window.pageYOffset > SCREEN_HEIGHT) {
		mapEnabled = false;	
	}
	else if (!mapEnabled) {
		mapEnabled = true;
		animate();
	}
}

function init() 
{
	container = document.getElementById( 'container3js' );
	container.style.height = SCREEN_HEIGHT + "px";

	scene = new THREE.Scene();
	atmosphereScene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera2 = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

	camera2.position = camera.position;
	camera2.rotation = camera.rotation;	

	scene.add(camera);
	atmosphereScene.add(camera2);

	ratamahatta = new THREEx.MD2CharacterRatmahatta();

	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	

	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container.appendChild( renderer.domElement );

	THREEx.WindowResize(renderer, camera);
	THREEx.WindowResize(renderer, camera2);

	controls = new THREE.OrbitControls( camera, renderer.domElement );

	controls.minDistance = 400;
	controls.maxDistance = 400; //200 for zoomed

	if (debug) {
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );
	}

	// var light = new THREE.PointLight(0xffffff);
	// light.position.set(0,0,250);
	// scene.add(light);

	var light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
	scene.add( light );

	
	var imagePrefix = "world/images/nebula-";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".png";
	var skyGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );	
	
	var imageURLs = [];
	for (var i = 0; i < 6; i++)
		imageURLs.push( imagePrefix + directions[i] + imageSuffix );
	var textureCube = THREE.ImageUtils.loadTextureCube( imageURLs );
	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;
	var skyMaterial = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	} );
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );

	
	var customMaterialAtmosphere = new THREE.ShaderMaterial( 
	{
	    uniforms:       
		{ 
			"c":   { type: "f", value: 0.5 },
			"p":   { type: "f", value: 4.0 }
		},
		vertexShader:   document.getElementById( 'vertexShaderAtmosphere'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShaderAtmosphere' ).textContent
	}   );

	var sphereGeo = new THREE.SphereGeometry(100, 32, 16);
    
	var earthTexture = THREE.ImageUtils.loadTexture( 'world/model/earth-compresed.jpg' );
	var bumpTexture = THREE.ImageUtils.loadTexture( 'world/model/high-bump-compresed.jpg' );
	var earthMaterial = new THREE.MeshBasicMaterial( { 
		map: earthTexture,
		bumpMap:     bumpTexture,
        bumpScale:   1
	} );
    var earth = new THREE.Mesh(sphereGeo, earthMaterial);
    scene.add(earth);
	
	var mesh = new THREE.Mesh( sphereGeo.clone(), customMaterialAtmosphere );
	mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.2;

	mesh.material.side = THREE.BackSide;
	atmosphereScene.add(mesh);
	
	var blackMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} ); 
	var sphere = new THREE.Mesh(sphereGeo.clone(), blackMaterial);
	sphere.scale.x = sphere.scale.y = sphere.scale.z = 1;
	atmosphereScene.add(sphere);
	
	var renderTargetParameters = 
		{ minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, 
		  format: THREE.RGBFormat, stencilBuffer: false };
	var renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters );
	composer2 = new THREE.EffectComposer( renderer, renderTarget );
	
	// prepare the secondary render's passes
	var render2Pass = new THREE.RenderPass( atmosphereScene, camera2 );
	composer2.addPass( render2Pass );
	
	// prepare final composer
	finalComposer = new THREE.EffectComposer( renderer, renderTarget );

	// prepare the final render's passes
	var renderModel = new THREE.RenderPass( scene, camera );
	finalComposer.addPass( renderModel );

	var effectBlend = new THREE.ShaderPass( THREE.AdditiveBlendShader, "tDiffuse1" );
	effectBlend.uniforms[ 'tDiffuse2' ].value = composer2.renderTarget2;
	effectBlend.renderToScreen = true;
	finalComposer.addPass( effectBlend );
	
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

    scene.add(charactersGroup);
   
}

function addCharacter(lat,lng) {
	var phi = (90 - lat) * Math.PI / 180;
    var theta = (-1 * lng) * Math.PI / 180;

    // var hover = 15 * (1 + Math.random() * 0.2) ;
    // var weight = (hover - size * 3);
    // var radius = 200 + (weight < 0 ? 0 : weight);
    var radius = 105;

    var x = radius * Math.sin(phi) * Math.cos(theta);
	var y = radius * Math.cos(phi);
	var z = radius * Math.sin(phi) * Math.sin(theta);

	var newRatamahatta = new THREEx.MD2CharacterRatmahatta( null, ratamahatta.character.meshBody.clone());

	var character = newRatamahatta.character.object3d;
	
	character.position.set(x,y,z);

	character.lookAt(new THREE.Vector3(x,y,z));
	character.rotateOnAxis (new THREE.Vector3(1,0,0), 45)

	charactersGroup.add(character);

	setTimeout(function(){
		newRatamahatta.setAnimationName("jump")
	},500);
	setTimeout(function(){
		charactersGroup.remove( character );
	},2000);

	onRenderFcts.push(function(delta){
		newRatamahatta.update(delta)
	})
}

function animate(nowMsec) 
{
	if (mapEnabled){
		requestAnimationFrame( animate );
	}
	render();		
	update(nowMsec);
}

var lastTimeMsec= null;
function update(nowMsec)
{
	// controls.rotateLeft(0.001);
	controls.update();

	lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
	var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
	lastTimeMsec	= nowMsec

	onRenderFcts.forEach(function(onRenderFct){
		onRenderFct(deltaMsec/1000, nowMsec/1000)
	})

	if (debug) stats.update();
}

function render() 
{
	composer2.render();
	finalComposer.render();
}