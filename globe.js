/**
 * dat.globe Javascript WebGL Globe Toolkit
 * http://dataarts.github.com/dat.globe
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var DAT = DAT || {};

DAT.Globe = function(container, colorFn) {

  colorFn = colorFn || function(x) {
    var c = new THREE.Color();
    if (x==0.0) {
    	c.setHSV( ( 0.6 - ( x * 0.5 ) ), 0, 0 );
    } else {
    	c.setHSV( ( 0.6 - ( x * 0.5 ) ), 1.0, 1.0 );
    }
    return c;
  };

  var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: 0, texture: null }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vNormal = normalize( normalMatrix * normal );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D texture;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
          'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
          'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
        '}'
      ].join('\n')
    },
    'atmosphere' : {
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'vNormal = normalize( normalMatrix * normal );',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'float intensity = pow( 0.77 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 15.0 );',
          'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
        '}'
      ].join('\n')
    }
  };

  var camera, scene, sceneAtmosphere, renderer, w, h;
  var vector, mesh, atmosphere, point;

  var overRenderer;

  var imgDir = '/img/';

  var curZoomSpeed = 0;
  var zoomSpeed = 50;

  var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
  var rotation = { x: 10, y: 10 },
      target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
      targetOnDown = { x: 0, y: 0 };

  var distance = 100000, distanceTarget = 100000;
  var padding = 40;
  var PI_HALF = Math.PI / 2;

  function init() {

    container.style.color = '#fff';
    container.style.font = '13px/20px Arial, sans-serif';

    var shader, uniforms, material;
    w = container.offsetWidth || window.innerWidth;
    h = container.offsetHeight || window.innerHeight;

    camera = new THREE.Camera(
        30, w / h, 1, 10000);
    camera.position.z = distance;

    vector = new THREE.Vector3();

    scene = new THREE.Scene();
    sceneAtmosphere = new THREE.Scene();

    var geometry = new THREE.Sphere(200, 40, 30);

    shader = Shaders['earth'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].texture = THREE.ImageUtils.loadTexture(imgDir+'world' +'.jpg');

    material = new THREE.MeshShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });

    mesh = new THREE.Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    scene.addObject(mesh);

    shader = Shaders['atmosphere'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    material = new THREE.MeshShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });

    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.1;
    mesh.flipSided = true;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    sceneAtmosphere.addObject(mesh);

    geometry = new THREE.Cube(0.5, 0.5, 1, 1, 1, 1, null, false, { px: true,
          nx: true, py: true, ny: true, pz: false, nz: true});

    for (var i = 0; i < geometry.vertices.length; i++) {

      var vertex = geometry.vertices[i];
      vertex.position.z += 0.5;

    }

    // geometry = new THREE.Sphere(1, 10, 10);

    point = new THREE.Mesh(geometry);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.autoClear = false;
    renderer.setClearColorHex(0x000000, 0.0);
    renderer.setSize(w, h);

    // renderer.domElement.style.position = 'absolute';

    container.appendChild(renderer.domElement);

    container.addEventListener('mousedown', onMouseDown, false);

    container.addEventListener('dblclick', onToggleZoom, false);

    document.addEventListener('keydown', onDocumentKeyDown, false);

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mouseover', function() {
      overRenderer = true;
    }, false);

    container.addEventListener('mouseout', function() {
      overRenderer = false;
    }, false);
  }

  function getColor(value) {

    switch(value) {
      case 'github': return new THREE.Color(0x999999);
      case 'auth0': return new THREE.Color(0xEB5424);
      case 'ad': return new THREE.Color(0x00abec);
      case 'samlp': return new THREE.Color(0xF5AB35);//------
      case 'adfs': return new THREE.Color(0x00abec); // AD
      case 'facebook': return new THREE.Color(0x3b5998);
      case 'waad': return new THREE.Color(0xFDE3A7); //------
      case 'google-oauth2': return new THREE.Color(0xdb4437);
      case 'amazon': return new THREE.Color(0xff9900);
      case 'oauth2': return new THREE.Color(0xDB0A5B); //-----
      case 'pingfederate': return new THREE.Color(0xC82946);
      case 'linkedin': return new THREE.Color(0x0077b5);
      case 'google-apps': return new THREE.Color(0x0f9d58);
      case 'twitter': return new THREE.Color(0x55acee);
      case 'windowslive': return new THREE.Color(0x00bcf2);
      case 'yahoo': return new THREE.Color(0x400191);
      case 'sms': return new THREE.Color(0x2ECC71); //-----
      case 'office365': return new THREE.Color(0xCB3F07);
      case 'vkontakte': return new THREE.Color(0x5B7195);


      case 'salesforce-sandbox':
      case 'salesforce-community': return new THREE.Color(0x1798c1);
      
      case 'instagram': return new THREE.Color(0x3f729b);


      default: console.log(value); return new THREE.Color(0xffffff);
    }
  }

  addData = function(data, opts) {
    var lat, lng, size, color, i, j, strategies;

    var subgeo = new THREE.Geometry();
    for (i = 0; i < data.length; i += 1) {
      strategies = Object.keys(data[i].strategies);

      size = 1;

      for (j = 0; j < strategies.length; j += 1) {

        value = strategies[j];

        if (value != 'auth0') size = 1;

        lat = data[i].geo.lat + Math.cos(j * Math.PI * 0.5) * 0.001;
        lng = data[i].geo.lng + Math.sin(j * Math.PI * 0.5) * 0.001;
        
        addStrategyToFilter(value);
        color = getColor(value);
        addPoint(lat, lng, size, color, subgeo);
      }
    }

    this._baseGeometry = subgeo;

  };

  function createPoints() {
    if (this._baseGeometry !== undefined) {
      var points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
              color: 0xffffff,
              opacity: 1,
              vertexColors: THREE.FaceColors,
              morphTargets: false
      }));
      scene.addObject(points);
    }
  }

  function addPoint(lat, lng, size, color, subgeo) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;

    point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
    point.position.y = 200 * Math.cos(phi);
    point.position.z = 200 * Math.sin(phi) * Math.sin(theta);

    point.lookAt(mesh.position);

    point.scale.set(size, size, size);

    point.updateMatrix();
    var i;
    for (i = 0; i < point.geometry.faces.length; i++) {

      point.geometry.faces[i].color = color;

    }

    GeometryUtils.merge(subgeo, point);
  }

  function onMouseDown(event) {
    event.preventDefault();

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mouseout', onMouseOut, false);

    mouseOnDown.x = - event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    container.style.cursor = 'move';
  }

  function onMouseMove(event) {
    ainc = 0;
    mouse.x = - event.clientX;
    mouse.y = event.clientY;

    var zoomDamp = distance/1000;

    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
  }

  function onMouseUp(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
    container.style.cursor = 'auto';
  }

  function onMouseOut(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
  }

  var isZoomed = false;
  function onToggleZoom(event) {

    isZoomed = !isZoomed;

    event.preventDefault();

    zoom(isZoomed ? 1000 : -1000);

    return false;
  }

  function onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 38:
        zoom(100);
        event.preventDefault();
        break;
      case 40:
        zoom(-100);
        event.preventDefault();
        break;
    }
  }

  function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function zoom(delta) {
    distanceTarget -= delta;
    distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
    distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
  }


  function animate() {
    requestAnimationFrame(animate);
    render();

    stats.update();
  }
var a = 0;
var ainc = 0.01;
  function render() {
    a = a - ainc;
    zoom(curZoomSpeed);

    rotation.x += (target.x - rotation.x) * 0.1;
    rotation.y += (target.y - rotation.y) * 0.1;
    distance += (distanceTarget - distance) * 0.3;

    // camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    // camera.position.y = distance * Math.sin(rotation.y);
    // camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);


    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.x = distance * Math.sin(rotation.x + a) * Math.cos(rotation.y);
    camera.position.z = distance * Math.cos(rotation.x + a) * Math.cos(rotation.y);

    vector.copy(camera.position);

    renderer.clear();
    renderer.render(scene, camera);
    renderer.render(sceneAtmosphere, camera);
  }

  init();
  this.animate = animate;
  this.addData = addData;
  this.createPoints = createPoints;
  this.renderer = renderer;
  this.scene = scene;
  
  this.clearData = function() {
  	// I am pretty sure I am doing it wrong, but there is no documentation I can
  	// find on the Web, and it is quarter past two in the night, so I will go with
  	// "this seems superficially to work enough for a throwaway website"
  	if (this.scene.__webglObjects)
	  	while (this.scene.__webglObjects.length > 1)
  			this.scene.__webglObjects.pop();
  	if (this.scene.children)
  		while (this.scene.children.length > 1)
  			this.scene.removeChild(this.scene.children[this.scene.children.length-1]);
  };

  return this;

};

