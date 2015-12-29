
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer;
var plane, cube;
var mouse, raycaster, isShiftDown = false;

var edgeSize = 100;
var radius = edgeSize / 2;
var height = edgeSize / 10;
var deltaX = radius * 3 / 2;
var deltaY = radius * 2 * Math.sqrt(3) / 2;

var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;
var texture;

var selectedHex;

var objects = [];
var hexagonBase;

function initHexagonBase(){
    var hexagon = new THREE.Geometry();
    var angleStep = Math.PI / 3;
    for (var i = 0; i < 6; i++){
        // bottom
        var fact = 0.9;
        hexagon.vertices.push(
            new THREE.Vector3(
                radius * Math.cos(i * angleStep),
                0,
                radius * Math.sin(i * angleStep))
        );
        // top
        hexagon.vertices.push(
            new THREE.Vector3(
                fact * radius * Math.cos(i * angleStep),
                height,
                fact * radius * Math.sin(i * angleStep))
        );
    }
    //hexagon.computeBoundingBox();
    //hexagon.computeBoundingSphere();
    for (var i = 0; i < 3; i ++){
        hexagon.faces.push(new THREE.Face3(2 * i, 2 * i + 1, (2 * (i + 1)) % 12));
        hexagon.faces.push(new THREE.Face3(2 * i + 1, (2 * (i + 1) + 1) % 12,  (2 * (i + 1)) % 12));
    }
    for (var i = 3; i < 6; i ++){
        hexagon.faces.push(new THREE.Face3(2 * i + 1, 2 * i, (2 * (i + 1)) % 12));
        hexagon.faces.push(new THREE.Face3((2 * (i + 1) + 1) % 12, 2 * i + 1, (2 * (i + 1)) % 12));
    }
    hexagon.faces.push(new THREE.Face3(0, 4, 2));
    hexagon.faces.push(new THREE.Face3(0, 6, 4));
    hexagon.faces.push(new THREE.Face3(0, 8, 6));
    hexagon.faces.push(new THREE.Face3(0, 10, 8));

    hexagon.faces.push(new THREE.Face3(1, 5, 3));
    hexagon.faces.push(new THREE.Face3(1, 7, 5));
    hexagon.faces.push(new THREE.Face3(1, 9, 7));
    hexagon.faces.push(new THREE.Face3(1, 11, 9));

    //hexagon.computeVertexNormals();
    hexagon.computeFaceNormals();
    return hexagon;
}

function realXY(cx, cy) {
    var x;
    var y;
    if ((cx % 2) == 1) {
        x =  deltaX * (cx - 1) + deltaX;
        y =  deltaY * (cy) + deltaY / 2;
    }
    else {
        x =  deltaX * (cx);
        y =  deltaY * (cy);
    }
    var P = new Object();
    P.x = x;
    P.y = y;
    return P;
}

function initHexCell(cellTexture){
    var hexVox = new THREE.Mesh(hexagonBase, new THREE.MeshLambertMaterial(
        { 	color: 0x2E974C,
            shading: THREE.FlatShading,
            map: cellTexture
        } ));
    return hexVox;
}

function initHexCellAt(i, j, cellTexture){
    var transP = realXY(i, j);
    var hexVox = initHexCell(cellTexture);
    hexVox.translateX(transP.x);
    hexVox.translateZ(transP.y);
    hexVox.userData = {
        posX: i,
        posY: j
    };
    return hexVox;
}

init();
render();


function init() {

    //THREE.ImageUtils.loadTexture( "textures/road.jpg" );
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    /** my stuff **/
    hexagonBase = initHexagonBase();
    /** end my stuff**/

    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'Hexagonal Game Map <br/> ' +
        '<label for="pos-x">Pos X</label> <input type="text" id="pos-x"> <br/> ' +
        '<label for="pos-y">Pos Y</label> <input type="text" id="pos-y"> <br/>' +
        '<label for="pos-x">Sel X</label> <input type="text" id="sel-x"> <br/> ' +
        '<label for="pos-y">Sel Y</label> <input type="text" id="sel-y"> <br/>';
    container.appendChild( info );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 500, 800, 1300 );
    camera.lookAt( new THREE.Vector3() );

    scene = new THREE.Scene();
    // roll-over helpers
    texture = THREE.ImageUtils.loadTexture("textures/grass.jpg", {}, function() {
        renderer.render(scene);
    });
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00, opacity: 0.5, transparent: true } );
    rollOverMesh = initHexCell(0, 0, rollOverMaterial);
    selectedHex = initHexCell(0, 0, texture);
    scene.add(selectedHex);
    scene.add(rollOverMesh );

    // cubes
    //THREE.ImageUtils.crossOrigin = '';

    cubeGeo = new THREE.BoxGeometry( edgeSize, edgeSize, edgeSize );
    cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, shading: THREE.FlatShading, map: texture } );

    // grid

    var size = 600, step = edgeSize;

    var geometry = new THREE.Geometry();

    for ( var i = - size; i <= size; i += step ) {

        geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

        geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

    }

/*    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );


    var line = new THREE.LineSegments( geometry, material );
    scene.add( line );
*/

   /* var hexVox = initHexCell();
    scene.add(hexVox);

    var hexVox2 = initHexCell();

    hexVox2.translateX(radius + radius * Math.sqrt(3) / 4);
    hexVox2.translateZ(radius * Math.sqrt(3) / 2);
    scene.add(hexVox2);*/

    // push to objects only for intersections
    for (var i = 0; i < 5; i++){
        for (var j = 0; j < 5; j++){
            var hexVox3 = initHexCellAt(i, j, texture);
            scene.add(hexVox3);
            objects.push(hexVox3);
        }
    }

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
    geometry.rotateX( - Math.PI / 2 );

    plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
    scene.add( plane );

    //objects.push( plane );

    // Lights

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    scene.add( directionalLight );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        var intersect = intersects[0];
        document.getElementById('pos-x').value = intersect.object.userData.posX;
        document.getElementById('pos-y').value = intersect.object.userData.posY;
        rollOverMesh.position.copy(intersect.object.position);
        rollOverMesh.position.setY(1);
        //intersect.object.position.addVectors(0, -1, 0);
       /* rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
        rollOverMesh.position.divideScalar( edgeSize ).floor().multiplyScalar( edgeSize ).addScalar( edgeSize / 2);
*/
    }

    render();

}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        var intersect = intersects[0];
        document.getElementById('sel-x').value = intersect.object.userData.posX;
        document.getElementById('sel-y').value = intersect.object.userData.posY;
        selectedHex.position.copy(intersect.object.position);
        selectedHex.position.setY(1);

       /* // delete cube

        if ( isShiftDown ) {

            if ( intersect.object != plane ) {

                scene.remove( intersect.object );

                objects.splice( objects.indexOf( intersect.object ), 1 );

            }

            // create cube

        } else {

            var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
            voxel.position.copy( intersect.point ).add( intersect.face.normal );
            voxel.position.divideScalar( edgeSize ).floor().multiplyScalar( edgeSize ).addScalar( edgeSize / 2);
            scene.add( voxel );

            objects.push( voxel );

        }*/

        render();

    }

}

function onDocumentKeyDown( event ) {

    switch( event.keyCode ) {

        case 16: isShiftDown = true; break;

    }

}

function onDocumentKeyUp( event ) {

    switch ( event.keyCode ) {

        case 16: isShiftDown = false; break;

    }

}

function render() {

    renderer.render( scene, camera );

}

