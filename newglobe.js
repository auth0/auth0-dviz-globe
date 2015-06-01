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
          'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
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

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 100000);
    camera.position.z = distance;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    scene.add(createAtmosphere());
    scene.add(createSphere());

    // controls = new THREE.TrackballControls(camera);

    controls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.maxDistance = 1;
    controls.minDistance = 100000;
    controls.userRotateSpeed = 500;
    controls.momentumDampingFactor = 8;
    controls.momentumScalingFactor = 0.005;
    controls.getMouseProjectionOnBall2 = controls.getMouseProjectionOnBall;



    container.appendChild(renderer.domElement);
    renderer.shadowMapEnabled = true
    
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
    shader = Shaders['earth'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].value = THREE.ImageUtils.loadTexture(imgDir+'world' +'.jpg');

    return new THREE.Mesh(
      new THREE.SphereGeometry(2000, 40, 30),
      // new THREE.MeshBasicMaterial({color: 0x2194CE})
      new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      })
    );
  }

  function render() {
    stats.update();
    controls.update();
    // sphere.rotation.y += 0.0005;
    // clouds.rotation.y += 0.0005;
    requestAnimationFrame(render);
    //renderer.render(sceneAtmosphere, camera);
      renderer.render(scene, camera);

  }
  

  init();
  render();
  
  return this;

};