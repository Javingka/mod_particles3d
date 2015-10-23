function triangleShape( elementCount ){
	var elements = elementCount;

	var geometry = new THREE.BufferGeometry();

	var positions = new Float32Array( elements * 3 * 3 ); //array. position of each triangle x,y,z for each vertex
	var normals = new Float32Array( elements * 3 * 3 ); //array. normals for each triangle's vertex
  var colors = new Float32Array( elements * 3 * 3 ); //array. the same for the color
	var color = new THREE.Color();

	var n = 2000, n2 = n/2;	// elements spread in the cube
	var d = 20, d2 = d/2;	// individual triangle size

	var pA = new THREE.Vector3();
	var pB = new THREE.Vector3();
	var pC = new THREE.Vector3();

	var cb = new THREE.Vector3();
	var ab = new THREE.Vector3();

	for ( var i = 0, c = 0 ; i < positions.length; i += 9, c++) {

		// positions
    // center used to begin to calculate a random triangle
		var x = Math.random() * n - n2;
		var y = Math.random() * n - n2;
		var z = Math.random() * n - n2;

		var ax = x + Math.random() * d - d2;
		var ay = y + Math.random() * d - d2;
		var az = z + Math.random() * d - d2;

		var bx = x + Math.random() * d - d2;
		var by = y + Math.random() * d - d2;
		var bz = z + Math.random() * d - d2;

		var cx = x + Math.random() * d - d2;
		var cy = y + Math.random() * d - d2;
		var cz = z + Math.random() * d - d2;

		positions[ i ]     = ax;
		positions[ i + 1 ] = ay;
		positions[ i + 2 ] = az;

		positions[ i + 3 ] = bx;
		positions[ i + 4 ] = by;
		positions[ i + 5 ] = bz;

		positions[ i + 6 ] = cx;
		positions[ i + 7 ] = cy;
		positions[ i + 8 ] = cz;

		// flat face normals

		pA.set( ax, ay, az );
		pB.set( bx, by, bz );
		pC.set( cx, cy, cz );

		cb.subVectors( pC, pB );
		ab.subVectors( pA, pB );
		cb.cross( ab );

		cb.normalize();

		var nx = cb.x;
		var ny = cb.y;
		var nz = cb.z;

		normals[ i ]     = nx;
		normals[ i + 1 ] = ny;
		normals[ i + 2 ] = nz;

		normals[ i + 3 ] = nx;
		normals[ i + 4 ] = ny;
		normals[ i + 5 ] = nz;

		normals[ i + 6 ] = nx;
		normals[ i + 7 ] = ny;
		normals[ i + 8 ] = nz;

		// colors

		var vx = ( x / n ) + 0.5;
		var vy = ( y / n ) + 0.5;
		var vz = ( z / n ) + 0.5;
    
    vx = x / (n+2);
    color.setHSL(vx, 1.0, 0.5 );
    //color.setRGB( vx, vy, vz );

		colors[ i ]     = color.r;
		colors[ i + 1 ] = color.g;
		colors[ i + 2 ] = color.b;

		colors[ i + 3 ] = color.r;
		colors[ i + 4 ] = color.g;
		colors[ i + 5 ] = color.b;

		colors[ i + 6 ] = color.r;
		colors[ i + 7 ] = color.g;
		colors[ i + 8 ] = color.b;

	}
  // itemSize = 3 because there are 3 values (components) per vertex
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  //	geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  var material = new THREE.MeshBasicMaterial( {
			color: 0xaaaaaa,  vertexColors: THREE.VertexColors
	} );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
}

function bipyramidShape( elementCount, elementSize ){
	var elements = elementCount;

	var geometry = new THREE.BufferGeometry();

  var totalVertices = 3;
  var totalData = totalVertices * 3; //x,y,z for each vertex

	var positions = new Float32Array( elements * totalData ); //array. position of each face
  var normals = new Float32Array( elements * totalData ); //array. normals for each  face (each 3 vertex is a face)
  var colors = new Float32Array( elements * totalData ); //array. the same for the color
	var color = new THREE.Color();


	var n = 2000, n2 = n/2;	// elements spread in the cube
	var d = elementSize, d2 = d/2;	// individual triangle size

	var pA = new THREE.Vector3();
	var pB = new THREE.Vector3();
	var pC = new THREE.Vector3();
	var pD = new THREE.Vector3();
	var pE = new THREE.Vector3();

	var cb = new THREE.Vector3();
	var ab = new THREE.Vector3();

  var rad = d - d2;
	for ( var i = 0 ; i < positions.length; i += totalData) {

		// positions
    // center used to begin to calculate a random triangle
		var x = Math.random() * n - n2;
		var y = Math.random() * n - n2;
		var z = Math.random() * n - n2;

    var ax = x;
    var ay = y; 
		var az = z + rad;

		var bx = x + rad; // - Math.sin(3.66) * rad; //+ d - d2;
		var by = y;
    var bz = z - rad; // - Math.cos(3.66) * rad; //d + d2;

    var cx = x - rad; // Math.sin(-0.52) * rad; // d + d2;
		var cy = y;
    var cz = z - rad; // Math.cos(-0.52) * rad; //z - d + d2;

		positions[ i ]     = ax;
		positions[ i + 1 ] = ay;
		positions[ i + 2 ] = az;

		positions[ i + 3 ] = bx;
		positions[ i + 4 ] = by;
		positions[ i + 5 ] = bz;

		positions[ i + 6 ] = cx;
		positions[ i + 7 ] = cy;
		positions[ i + 8 ] = cz;

		// flat face normals

		pA.set( ax, ay, az );
		pB.set( bx, by, bz );
		pC.set( cx, cy, cz );

		cb.subVectors( pC, pB ); // Sets this vector to pC - pB.
		ab.subVectors( pA, pB );
		cb.cross( ab );

		cb.normalize();

		var nx = cb.x;
		var ny = cb.y;
		var nz = cb.z;

		normals[ i ]     = nx;
		normals[ i + 1 ] = ny;
		normals[ i + 2 ] = nz;

		normals[ i + 3 ] = nx;
		normals[ i + 4 ] = ny;
		normals[ i + 5 ] = nz;

		normals[ i + 6 ] = nx;
		normals[ i + 7 ] = ny;
		normals[ i + 8 ] = nz;

		// colors

		var vx = ( x / n ) + 0.5;
		var vy = ( y / n ) + 0.5;
		var vz = ( z / n ) + 0.5;
    
    vx = x / (n+2);
    color.setHSL(vx, 1.0, 0.5 );
//		color.setRGB( vx, vy, vz );

		colors[ i ]     = color.r;
		colors[ i + 1 ] = color.g;
		colors[ i + 2 ] = color.b;

		colors[ i + 3 ] = color.r;
		colors[ i + 4 ] = color.g;
		colors[ i + 5 ] = color.b;

		colors[ i + 6 ] = color.r;
		colors[ i + 7 ] = color.g;
		colors[ i + 8 ] = color.b;

	}
  // itemSize = 3 because there are 3 values (components) per vertex
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  //	geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

 var material = new THREE.MeshBasicMaterial( {
			color: 0xaaaaaa,  vertexColors: THREE.VertexColors
	} );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
}
