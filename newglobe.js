var DAT = DAT || {};

DAT.Globe = function(container) {

  var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: null }
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
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 4.0 );',
          'gl_FragColor = vec4( diffuse + atmosphere, 0.5 );',
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
          'float intensity = pow( 0.75 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 7.0 );',
          'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
        '}'
      ].join('\n')
    }
  };

  var width, height;
  var scene, sceneAtmosphere;
  var camara, renderer, controls;
  var distance = 10000;
  var imgDir = '';

  function init() {

    width = container.offsetWidth || window.innerWidth;
    height = container.offsetHeight || window.innerHeight;

    scene = new THREE.Scene();
    sceneAtmosphere = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 100, 100000);
    camera.position.z = distance;

    scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.00001 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    scene.add( new THREE.AmbientLight( 0xFFFFFF ) );

    var light = new THREE.DirectionalLight(0xFFFFFF, 2.5);
    light.position.set(0,0,-1);
    scene.add(light);

    //scene.add(createAtmosphere());
    scene.add(createSphere());
    scene.add(createSun());

    scene.add(createSmoke());

    // controls = new THREE.TrackballControls(camera);

    controls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.maxDistance = 100000;
    controls.minDistance = 4000;
    controls.userRotateSpeed = 500;
    controls.momentumDampingFactor = 8;
    controls.momentumScalingFactor = 0.005;
    controls.getMouseProjectionOnBall2 = controls.getMouseProjectionOnBall;



    container.appendChild(renderer.domElement);
    renderer.shadowMapEnabled = true
    
  }

  function createSmoke() {
    var smokeParticles = new THREE.Geometry;
    // for (var i = 0; i < 10000; i++) {
    //     var particle = new THREE.Vector3(Math.random() * 10, Math.random() * 200, Math.random() * 200);
    //     smokeParticles.vertices.push(particle);
    // }

    var a = 50,b = 100,c = 50;

    for (var x = -1*a; x <= a; x=x+5) {
      for (var y = -1*b; y <= b; y=y+5) {
        for (var z = -1*c; z <= c; z=z+5) {

          if (Math.pow(x,2)/Math.pow(a,2) + Math.pow(y,2)/Math.pow(b,2)+ Math.pow(z,2)/Math.pow(c,2) <= 1) {
              var particle = new THREE.Vector3(x,y,z);
              smokeParticles.vertices.push(particle);
          }
      
        }
      }
    }

    var smokeTexture = THREE.ImageUtils.loadTexture('smoke.png');
    var smokeMaterial = new THREE.ParticleBasicMaterial({ map: smokeTexture, transparent: true, blending: THREE.AdditiveBlending, size: 30, color: 0x111111 });

    var smoke = new THREE.ParticleSystem(smokeParticles, smokeMaterial);
    smoke.sortParticles = true;
    smoke.position.x = 2100;
    smoke.position.y = 0;
    smoke.position.z = 0;

    return smoke;
  }

  function createAtmosphere() {

    shader = Shaders['atmosphere'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    mesh = new THREE.Mesh(new THREE.SphereGeometry(2000, 40, 30), 
        new THREE.ShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        })
      );

    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.1;
    mesh.material.side = THREE.BackSide;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    return mesh;
  }

  function createSphere() {
    // shader = Shaders['earth'];
    // uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    // uniforms['texture'].value = THREE.ImageUtils.loadTexture(imgDir+'world' +'.jpg');

    // return new THREE.Mesh(
    //   new THREE.SphereGeometry(2000, 40, 30),
    //   // new THREE.MeshBasicMaterial({color: 0x2194CE})
    //   new THREE.ShaderMaterial({
    //     uniforms: uniforms,
    //     vertexShader: shader.vertexShader,
    //     fragmentShader: shader.fragmentShader
    //   })
    // );

    return new THREE.Mesh(
      new THREE.SphereGeometry(2000, 40, 30),
      new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture(imgDir+'world' +'.jpg')})
    );
  }

  function createSun() {

    var sun = new THREE.Mesh(
      new THREE.SphereGeometry(500, 40, 30),
      new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(imgDir+'sun' +'.png')})
    );

    sun.position.z = -0.5 * 10000;

    return sun;
  }

  function render() {
    stats.update();
    controls.update();
    // sphere.rotation.y += 0.0005;
    // clouds.rotation.y += 0.0005;

    requestAnimationFrame(render);
    renderer.render(scene, camera);

  }
  

  init();
  render();
  
  return this;

};