var destination = [];
function PointCloud(externalSizeRange, count , listX, listY, listZ ) {
  this.count = count;
  this.faces = 1;
  this.clickStateParticles = [];
  this.clickedParticles = [];
	var n = externalSizeRange, n2 = n/2;	// elements spread in the cube
//	var d = elementSize, d2 = d/2;

  // custom attributes to be applied on buffer geomtry
  var positions = new Float32Array( count * 3 );
  //destination is not an attribute within of the buffer geometry!. works as a global independent array
  destination = new Float32Array( count * 3 );
  var colors = new Float32Array( count * 3 );
  var sizes = new Float32Array( count );

  // setting the clickeable particles list to know when each particle is selected or not
  for ( var p = 0; p < count; p++) {
    this.clickStateParticles[p] = false;
  }

  this.geometry = new THREE.BufferGeometry();

  for (var i = 0; i < count; i++)  {
    //  set position
    var x = typeof listX === 'undefined'?(Math.random() * n - n2):(listX[i] * n2);
    var y = typeof listY === 'undefined'?(Math.random() * n - n2):(listY[i] * n2); //Math.random() * n - n2;
    var z = typeof listZ === 'undefined'?(Math.random() * n - n2):(listZ[i] * n2); //Math.random() * n - n2;
    z *= -1;

    positions[ i*3 + 0 ] = x;//1;//x;
    positions[ i*3 + 1 ] = y;//1;// y;
    positions[ i*3 + 2 ] = z;//1;//z;
    destination[ i*3 + 0 ] = x;
    destination[ i*3 + 1 ] = y;
    destination[ i*3 + 2 ] = z;

		// colors
    var cr,cg,cb;
    switch (colorSettingType) {
    case 0:
      cr = expColorR(x/n2,y/n2,z/n2,i);
      cg = expColorG(x/n2,y/n2,z/n2,i); //( y / n ) + 0.5;
      cb = expColorB(x/n2,y/n2,z/n2,i); //( z / n ) + 0.5;
      break;
    case 1:
      cr = colorArray[i][0];
      cg = colorArray[i][1];
      cb = colorArray[i][2];
      break;
    case 2:
      cr = colorDefault.r;
      cg = colorDefault.g;
      cb = colorDefault.b;
      break;
    }
    colors[ i*3 + 0] = cr;
  	colors[ i*3 + 1] = cg;
  	colors[ i*3 + 2] = cb;

    // sizes
    switch(sizeSettingType){
    case 0:
  	  sizes[i]= sizeDefault;
      break;
    case 1:
      sizes[i] = sizeDefault; //TODO set custom sizes (create a custom Shader material) sizeArray[i];
      break;
    }
  }

  this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3) );
  this.geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3) );
  this.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1) );

  this.geometry.computeBoundingBox();
  //this.geometry.computeBoundingSphere();
  var material = new THREE.PointsMaterial( {size: sizeDefault, vertexColors: THREE.VertexColors, fog: false } );

  this.pointCloud = new THREE.Points( this.geometry, material );
  this.pointCloud.dynamic=true;
};

PointCloud.prototype.raycasterSetup = function(){

  var canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 40;
  var fontsize = 10;
  var fontface = "Arial";
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;

  // CREATING THE SQUARE FOR THE OVERED PARTICLE
	// text color
	context.fillStyle = "rgba(255, 255, 255, 1.0)";
  context.lineWidth=.8;
  /*  context.textAlign="center";
  context.strokeStyle = 'black';
  context.fillText( "message", 60, 40); //borderThickness, fontsize + borderThickness);
  context.strokeText( "message", 60, 40); //borderThickness, fontsize + borderThickness);
  context.stroke();
  */
  var RecSize = sizeDefault*1.1; //TODO set custom sizes according the overed particle (create a custom Shader material)
  context.strokeStyle = 'white';
  context.rect( canvas.width/2 - RecSize/2, canvas.height/2 - RecSize/2,RecSize,RecSize);
  context.stroke();
	// canvas contents will be used for a texture
	this.texture = new THREE.Texture(canvas);
	this.texture.needsUpdate = true;
  this.texture.minFilter = THREE.LinearFilter;

  // Pass the canvas texture to the material
	var overParticleMaterial = new THREE.SpriteMaterial(
		{ map: this.texture, fog: true  } );
	this.overSprite = new THREE.Sprite( overParticleMaterial );
	this.overSprite.scale.set(30,10,0);

  //this.overSprite.position.set(0,0,0); //-externalSizeRange*.5,externalSizeRange*.5);
	scene.add( this.overSprite);

  //CREATING THE SQUARE FOR SELECTED PARTICLE
  var canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 40;
  var fontsize = 10;
  var fontface = "Arial";
	var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  var circleSize = sizeDefault*1.1; //TODO set custom sizes according the overed particle (create a custom Shader material)
  context.strokeStyle = 'white';
  context.beginPath();
  context.arc(canvas.width/2,canvas.height/2 ,circleSize,0,2*Math.PI);
  context.stroke();

	this.textureSel = new THREE.Texture(canvas);
	this.textureSel.needsUpdate = true;
  this.textureSel.minFilter = THREE.LinearFilter;

  // Pass the canvas texture to the material
	var SelectedParticleMaterial = new THREE.SpriteMaterial(
		{ map: this.textureSel, fog: true  } );
	this.selectSprite = new THREE.Sprite( SelectedParticleMaterial );
	this.selectSprite.scale.set(30,10,0);
	scene.add( this.selectSprite);
}
PointCloud.prototype.raycasterIntersect = function( m, faceNumb ){
	raycaster.setFromCamera( mouse, camera );

	var intersections = raycaster.intersectObject( m );
//	var intersects = raycaster.intersectObject( m );
	if ( intersections.length > 0 ) {
		var intersect = intersections[ 0 ]; //the first face intersecting the line between the camera center and the mouse point

    if (intersect.index != lastIndexMouse) { // new over element
      newElementSelected = true;
      lastIndexMouse = intersect.index;
      sendMessageToParent( [lastIndexMouse] );
    }

    // detect and the the overed particle
    var overS = this.overSprite;
    overS.visible = true;
    overS.position.set(m.geometry.attributes.position.array[ intersect.index * 3 ],
      m.geometry.attributes.position.array[ intersect.index * 3 + 1],
      m.geometry.attributes.position.array[ intersect.index * 3 + 2]);
  } else {
    var overS = this.overSprite;
    overS.visible = false;
    if (newElementSelected )  {
      newElementSelected = false;
      lastIndexMouse = -1;
      sendMessageToParent( [lastIndexMouse] );
//      console.log(lastIndexMouse);
    }
  }
  if (onClick && newElementSelected) {
    if ( lastIndexMouse != -1 ) { // exist one overed particle
      var toTrue = this.clickStateParticles[intersect.index] = !this.clickStateParticles[intersect.index];
      if (toTrue) this.clickedParticles.push(intersect.index);
      console.log("state of the particle clicked? ", this.clickStateParticles[intersect.index] );

      for(var i = this.clickedParticles.length -1; i >= 0 ; i--){
        // get the particle state from the index within the clickedParticles list
        if(this.clickStateParticles[ this.clickedParticles[i] ] == false){
          this.clickedParticles.splice(i, 1);
        }
      }
      console.log(this.clickedParticles);
    }
    onClick = false;
  }
};

PointCloud.prototype.getMesh = function(){
	return this.pointCloud ;
};
PointCloud.prototype.getCount = function() {
  return this.count;
};
PointCloud.prototype.getFacesNumber = function() {
  return this.faces;
};
