// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
// custom global variables
var cube;

var ratamahatta, onRenderFcts = [];

init();
animate();

// FUNCTIONS 		
function init() 
{
	// SCENE
	scene = new THREE.Scene();


	ratamahatta = new THREEx.MD2CharacterRatmahatta()

	ratamahatta.character.object3d.position.set(0,0,150);
	ratamahatta.character.object3d.lookAt(new THREE.Vector3(0,0,0));
	ratamahatta.character.object3d.rotateOnAxis (new THREE.Vector3(1,0,0), -90)

	setTimeout(function(){ratamahatta.setAnimationName("jump")},
		2000);

	scene.add(ratamahatta.character.object3d);

	onRenderFcts.push(function(delta){
		ratamahatta.update(delta)
	})


	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera2 = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'container3js' );
	container.appendChild( renderer.domElement );
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.WindowResize(renderer, camera2);

	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	controls.minDistance = 400;
	controls.maxDistance = 400; //200 for zoomed

	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	
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

	////////////
	// CUSTOM //
	////////////
	
	// create custom material from the shader code above
	//   that is within specially labeled script tags
	
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
    
	var moonTexture = THREE.ImageUtils.loadTexture( 'world/model/earth.jpg' );
	var bumpTexture = THREE.ImageUtils.loadTexture( 'world/model/high-bump.jpg' );
	var moonMaterial = new THREE.MeshBasicMaterial( { 
		map: moonTexture,
		bumpMap:     bumpTexture,
        bumpScale:   1
	} );
    var moon = new THREE.Mesh(sphereGeo, moonMaterial);
    scene.add(moon);
	
	// create secondary scene to add atmosphere effect
	
	atmosphereScene = new THREE.Scene();
	
	camera2.position = camera.position;
	camera2.rotation = camera.rotation;	
	atmosphereScene.add( camera2 );
	
	var mesh = new THREE.Mesh( sphereGeo.clone(), customMaterialAtmosphere );
	mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.2;
	// atmosphere should provide light from behind the sphere, so only render the back side
	mesh.material.side = THREE.BackSide;
	atmosphereScene.add(mesh);
	
	// clone earlier sphere geometry to block light correctly
	// and make it a bit smaller so that light blends into surface a bit
	var blackMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} ); 
	var sphere = new THREE.Mesh(sphereGeo.clone(), blackMaterial);
	sphere.scale.x = sphere.scale.y = sphere.scale.z = 1;
	atmosphereScene.add(sphere);
	
	////////////////////////////////////////////////////////////////////////
	// final composer will blend composer2.render() results with the scene 
	////////////////////////////////////////////////////////////////////////
	
	// prepare secondary composer
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
}

function animate(nowMsec) 
{
    requestAnimationFrame( animate );
	render();		
	update(nowMsec);
}

var lastTimeMsec= null;
function update(nowMsec)
{
	controls.rotateLeft(0.001);
	controls.update();

	lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
	var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
	lastTimeMsec	= nowMsec

	onRenderFcts.forEach(function(onRenderFct){
		onRenderFct(deltaMsec/1000, nowMsec/1000)
	})

	stats.update();
}

function render() 
{
	composer2.render();
	finalComposer.render();
}