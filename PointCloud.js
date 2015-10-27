var destination = [];
function PointCloud(externalSizeRange, count, elementSize, listX, listY, listZ ) {
  this.count = count;  
  
	var n = externalSizeRange, n2 = n/2;	// elements spread in the cube
	var d = elementSize, d2 = d/2;

  // custom attributes to be applied on buffer geomtry
  var positions = new Float32Array( count * 3 );
  //destination is not an attribute within of the buffer geometry!. works as a global independent array
  destination = new Float32Array( count * 3 ); 
  var colors = new Float32Array( count * 3 );
  var sizes = new Float32Array( count );

  this.geometry = new THREE.BufferGeometry();

  for (var i = 0; i < count; i++)  {
    //  set position
    var x = typeof listX === 'undefined'?(Math.random() * n - n2):(listX[i] * n2);
    var y = typeof listY === 'undefined'?(Math.random() * n - n2):(listY[i] * n2); //Math.random() * n - n2;
    var z = typeof listZ === 'undefined'?(Math.random() * n - n2):(listZ[i] * n2); //Math.random() * n - n2;

    positions[ i*3 + 0 ] = 1;//x;
    positions[ i*3 + 1 ] = 1;// y;
    positions[ i*3 + 2 ] = 1;//z;
    destination[ i*3 + 0 ] = x;
    destination[ i*3 + 1 ] = y;
    destination[ i*3 + 2 ] = z;
		// colors
    var vx = expColorR(x/n2,y/n2,z/n2,i);
    var vy = expColorG(x/n2,y/n2,z/n2,i); //( y / n ) + 0.5;
    var vz = expColorB(x/n2,y/n2,z/n2,i); //( z / n ) + 0.5;
    colors[ i*3 + 0] = vx;
  	colors[ i*3 + 1] = vy;
  	colors[ i*3 + 2] = vz;
  	sizes[i]=3;
  }
  
  this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3) );
  this.geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3) );
  this.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1) );

  this.geometry.computeBoundingSphere();
  var material = new THREE.PointsMaterial( { size: 15, vertexColors: THREE.VertexColors } );

  this.pointCloud = new THREE.Points( this.geometry, material );
  this.pointCloud.dynamic=true;
};

PointCloud.prototype.getMesh = function(){
	return this.pointCloud ;
};
PointCloud.prototype.getCount = function() {
  return this.count;
};



