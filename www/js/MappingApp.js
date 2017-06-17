/* global THREE */
(function (global) {
  'use strict';

  var world;

  var wsURL = 'ws://172.20.10.4:1881';
  var connection;

  var meshes = {};

  // OBJ Geometry
  var modelGeometry;
  var materials = [
    new THREE.MeshPhongMaterial({
      color        : 0x59b3e1,
      emissive     : 0xb67373,
      shininess    : 30,
      shading      : THREE.SmoothShading,
    }),
    new THREE.MeshPhongMaterial({
      color        : 0x232637,
      emissive     : 0x242a34,
      shininess    : 30,
      shading      : THREE.SmoothShading,
    }),
    new THREE.MeshPhongMaterial({
      color        : 0xb93b3b,
      emissive     : 0x895f24,
      shininess    : 30,
      shading      : THREE.SmoothShading,
    })
  ];


  function loadModel () {
    var loader = new THREE.OBJLoader();
    loader.load('models/nubes.obj', onLoadOBJ);
  }

  function onLoadOBJ (group) {
    var mesh = group.children[0];
    modelGeometry = mesh.geometry;
  }
  function lightSetup() {
    var ambient = new THREE.AmbientLight(0xffffff, 0.3);
    world.scene.add(ambient);

    // Key fill rim
    var keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
    keyLight.position.set( -35, 30, 35 );

    var fillLight = new THREE.DirectionalLight(0xffffff, 0.1);
    fillLight.position.set(30, 20, 20);

    var rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set( -10, 30, -30 );

    world.scene.add(keyLight);
    world.scene.add(fillLight);
    world.scene.add(rimLight);
  }

  function createNewMesh () {
    if (modelGeometry) {
      var mesh = new THREE.Mesh(modelGeometry, materials[0]);
      world.scene.add(mesh);

      mesh.position.x = Math.random() * 100 - 50;

      return mesh;
    }
  }

  /*******************
   * WebSocket logic *
   *******************/

  function setupWebSocket () {
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    connection = new WebSocket (wsURL);

    connection.onopen    = onConnectionOpen;
    connection.onerror   = onConnectionError;
    connection.onmessage = onConnectionMessage;
  }

  function onConnectionOpen () {
    console.log('Connected with server!');

    var message = {
      type : 'register',
      data : 'output'
    };
    connection.send(JSON.stringify(message));
  }

  function onConnectionError () {
    console.log('Error in connection :(!');
  }

  function onConnectionMessage (event) {
    var payload = event.data;
    var message = JSON.parse(payload);
    console.log(message);

    var type = message.type;
    var data = message.data;

    if (type === 'newInput') {
      onInputConnected(data);
    }
    else if (type === 'data') {
      onDataReceived(data.from, data.payload);
    }
    else if (type === 'disconnected') {
      onInputDisconnected(data);
    }
  }

  function onInputConnected (idConnection) {
    var mesh = createNewMesh();
    meshes[idConnection] = mesh;
  }

  function onDataReceived (from, indexMaterial) {
    console.log(indexMaterial);
    var mesh = meshes[from];
    if (mesh) {
      mesh.material = materials[indexMaterial];
    }
  }

  function onInputDisconnected (idConnection) {
    var mesh = meshes[from];
    if (mesh) {
      world.scene.remove(mesh);
      delete meshes[data];
    }
  }

  /*************
   * App logic *
   *************/

  var MappingApp = function (_world) {
    world = _world;
  };

  MappingApp.prototype.setup = function () {
    loadModel();
    setupWebSocket ();
    lightSetup();
  };
  


  MappingApp.prototype.update = function () {};

  global.MappingApp = MappingApp;
})(window);

