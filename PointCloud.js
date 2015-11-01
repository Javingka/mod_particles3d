var destination = [];
function PointCloud(externalSizeRange, count, selectionM, listX, listY, listZ ) {
  this.selMode = selectionM;
  this.count = count;
  this.faces = 1;
  this.clickStateParticles = [];
  this.clickedParticles = [];
  this.lastSelected;
  this.newOveredParticle = false;
  this.indexDownClick;
  this.indexUpClick;

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
  this.pointCloud.name = 'pointCloud';
  this.pointCloud.dynamic=true;
};
PointCloud.prototype.raycasterSetup = function(){

  var recSize = sizeDefault*1.1; //TODO set custom sizes according the overed particle (create a custom Shader material)
  var overText = new CanvasRecTexture( 120, 40, recSize, 'white', 1 );
	var overParticleMaterial = new THREE.SpriteMaterial(
		{ map: overText.getTexture(), fog: true  } );

	this.overSprite = new THREE.Sprite( overParticleMaterial );
  this.overSprite.name = 'selectSprite';
	this.overSprite.scale.set(30,10,0);

  //this.overSprite.position.set(0,0,0); //-externalSizeRange*.5,externalSizeRange*.5);
	scene.add( this.overSprite);

  //CREATING THE SQUARE FOR SELECTED PARTICLE
	this.textureSel = (new CanvasRecTexture( 120, 40, recSize*2, 'white', 1 )).getTexture(); //new THREE.Texture(canvas);
	this.textureSel.needsUpdate = true;
  this.textureSel.minFilter = THREE.LinearFilter;
}

PointCloud.prototype.raycasterIntersect = function( m, faceNumb ){
  camera.updateMatrixWorld();
	raycaster.setFromCamera( mouse, camera );

	var intersections = raycaster.intersectObject( m );

  // When a particle is overed
	if ( intersections.length > 0 )
  {
		var intersect = intersections[ 0 ]; //the first particle intersecting the line between the camera center and the mouse point

    if (intersect.index != lastIndexMouse) { // new over element different from the last
      this.newOveredParticle = true;
      lastIndexMouse = intersect.index; // store this index to use to detect future point intersections
      createSendMessageToParent( [lastIndexMouse], 'rollover');
      //sendMessageToParent( [lastIndexMouse, -1, -1] ); // SEND!! message to Lichen
    }

    // draw and place a sprite over the focused particle
    var overS = this.overSprite;
    overS.visible = true; // set this sprite visible
    overS.position.set( // and set the new position for the sprite
      m.geometry.attributes.position.array[ intersect.index * 3 ],
      m.geometry.attributes.position.array[ intersect.index * 3 + 1],
      m.geometry.attributes.position.array[ intersect.index * 3 + 2]
    );
  }
  else
  {
    var overS = this.overSprite;
    overS.visible = false;
    if (this.newOveredParticle  )  {
      this.newOveredParticle  = false;
      lastIndexMouse = -1;
      createSendMessageToParent( [lastIndexMouse], 'rollover');
      //      console.log(lastIndexMouse);
    }
    onClick = false;
  }

  // When clicked the backgrond
  if (onBackgroundClick)
  {
    // set all particles to unselected
    for(var i = this.clickedParticles.length -1; i >= 0 ; i--){
      this.clickStateParticles[ this.clickedParticles[i][0] ] = false;
      // get the particle state from the index within the clickedParticles list
      if(this.clickStateParticles[ this.clickedParticles[i][0] ] == false)
      { // if it false. return this particle state to false. and remove the object scene drawed
        this.restoreParticleToOff(this.clickedParticles[i],m);
        this.clickedParticles.splice(i, 1);
      }
    }
    createSendMessageToParent( [-1,-1], 'clear-selection');
    onBackgroundClick = false;
  }

  // When has a overed particle and receibe a click
  if (onClick && this.newOveredParticle )
  {
    if ( lastIndexMouse != -1 ) { // if the lastIndexMouse has an actual index value.
      var toTrue = this.clickStateParticles[intersect.index] = !this.clickStateParticles[intersect.index];

      // If the state of the particle overed is true. will be added to the selected list of particles.
      if (toTrue) {
        redIndexColor = m.geometry.attributes.color.array[ intersect.index * 3 + 0];
        greenIndexColor = m.geometry.attributes.color.array[ intersect.index * 3 + 1];
        blueIndexColor = m.geometry.attributes.color.array[ intersect.index * 3 + 2];

        // adding the selected texture to the particle
      	var SelectedParticleMaterial = new THREE.SpriteMaterial(
      		{ map: this.textureSel, fog: true  }
        );
      	var selectSprite = new THREE.Sprite( SelectedParticleMaterial );
      	selectSprite.scale.set(30,10,0);
        selectSprite.name = intersect.index;
        selectSprite.position.set(
          m.geometry.attributes.position.array[ intersect.index * 3 + 0],
          m.geometry.attributes.position.array[ intersect.index * 3 + 1],
          m.geometry.attributes.position.array[ intersect.index * 3 + 2]
          ); //-externalSizeRange*.5,externalSizeRange*.5);
      	scene.add( selectSprite);
        //console.log(selectSprite.name);

        // selMode 0 → return just one Selected Index | selMode 1 → return the entire array
        // On selMode 0 this array will have just one element, the actual selected particle
        // so just the first element is added just like selMode 1
        if (this.selMode == 1 || ( this.selMode == 0 && this.clickedParticles.length < 1 ) ) {
          // adding the particle index and color to the array.
          this.clickedParticles.push(
            [
              intersect.index,
              new THREE.Color(
                m.geometry.attributes.color.array[ intersect.index * 3 + 0],
                m.geometry.attributes.color.array[ intersect.index * 3 + 1],
                m.geometry.attributes.color.array[ intersect.index * 3 + 2]
              )
            ]
          );
        } else { // if the array already have 2 elements just chenge it.
          this.restoreParticleToOff(this.clickedParticles[0],m);
          this.clickedParticles[0] = [
              intersect.index,
              new THREE.Color(
                m.geometry.attributes.color.array[ intersect.index * 3 + 0],
                m.geometry.attributes.color.array[ intersect.index * 3 + 1],
                m.geometry.attributes.color.array[ intersect.index * 3 + 2]
              )
            ];
        }
        //sendMessageToParent( [-1,intersect.index,-1] ); // SEND!! message to Lichen

        // setting a 'selected color'
        m.geometry.attributes.color.array[ intersect.index * 3 + 0] = m.geometry.attributes.color.array[ intersect.index * 3 + 0]*.8;
        m.geometry.attributes.color.array[ intersect.index * 3 + 1] = m.geometry.attributes.color.array[ intersect.index * 3 + 1]*.8;
        m.geometry.attributes.color.array[ intersect.index * 3 + 2] = m.geometry.attributes.color.array[ intersect.index * 3 + 2]*.8;
        m.geometry.attributes.color.needsUpdate = true;
      } else {
        // loop over the entire list of selected particles to remove the unselected particle from the list
        for(var i = this.clickedParticles.length -1; i >= 0 ; i--){
          // get the particle state from the index within the clickedParticles list
          if(this.clickStateParticles[ this.clickedParticles[i][0] ] == false)
          { // if it false. return this particle state to false. and remove the object scene drawed
            this.restoreParticleToOff(this.clickedParticles[i],m);
            this.clickedParticles.splice(i, 1);
            break;
          }
        }
      }

      // SEND THE SELECTED ARRAY TO LICHEN
      if (this.selMode == 1 ) {
        var indexArr = [];
        this.clickedParticles.forEach( function logArrayElements(element, index, array) {
          indexArr.push(element[0]); // pass the id number to the array
        });
        createSendMessageToParent( [lastIndexMouse,indexArr], 'selected-Array');
      } else if (this.selMode == 0 ) {
        //send the selected particle index or -1 to indicate there is no selected particle
        var newSelect = this.clickedParticles.length>0? this.clickedParticles[0][0]:-1;
        createSendMessageToParent( [lastIndexMouse,newSelect], 'selected-particle');
      }
      //console.log(this.clickedParticles);
    }
    onClick = false;
  }


};
PointCloud.prototype.restoreParticleToOff = function(clickedP_i,m) {
  //recovering the color
  var indexParticleToRemove = clickedP_i[0];
  m.geometry.attributes.color.array[ indexParticleToRemove * 3 + 0] = clickedP_i[1].r;
  m.geometry.attributes.color.array[ indexParticleToRemove * 3 + 1] = clickedP_i[1].g;
  m.geometry.attributes.color.array[ indexParticleToRemove * 3 + 2] = clickedP_i[1].b;
  m.geometry.attributes.color.needsUpdate = true;

  //remove the scene object
  var selectedObject = scene.getObjectByName(indexParticleToRemove);
  scene.remove( selectedObject );
  // removed element from selected list
}
PointCloud.prototype.getMesh = function(){
	return this.pointCloud ;
};
PointCloud.prototype.getCount = function() {
  return this.count;
};
PointCloud.prototype.getFacesNumber = function() {
  return this.faces;
};

function CanvasRecTexture( cW, cH, recS, colorS, lineW ) {
  this.canvas = document.createElement('canvas');
  this.canvas.width = cW;
  this.canvas.height = cH;
  this.context = this.canvas.getContext('2d');

  // CREATING THE SQUARE FOR THE OVERED PARTICLE
  var rS = recS/2; //TODO set custom sizes according the overed particle size ( needs creation a custom Shader material)
  this.context.strokeStyle = colorS;
  this.context.lineWidth= lineW;
  this.context.rect( cW/2 - rS, cH/2 - rS, recS, recS);
  this.context.stroke();

	// canvas contents will be used for a texture
	this.texture = new THREE.Texture(this.canvas);
	this.texture.needsUpdate = true;
  this.texture.minFilter = THREE.LinearFilter;

  this.getTexture = function() { return this.texture; }
}
