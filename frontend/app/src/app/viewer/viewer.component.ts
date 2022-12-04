import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import CameraControls from 'camera-controls';
import * as THREE from 'three';
import { OrbitControls } from 'lesca-threejs-orbitcontrols';
//import { OrbitControls } from 'three-orbitcontrols-ts';
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';


@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  private scene;
  private renderer;
  private camera;
  private controls;
  private container;
  private raycaster;
  private intersected:any;
  private group:THREE.Group;

  constructor() { 
    this.container = document.getElementById("viewer")!;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    this.renderer = new THREE.WebGLRenderer();
    this.controls = new OrbitControls( this.camera, this.container);
    this.raycaster = new THREE.Raycaster();
    this.intersected = [];
    this.group = new THREE.Group();
  }

  ngOnInit(): void {
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas:  this.container});
    this.renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
    this.renderer.xr.enabled = true;
    this.camera.position.set( 0, 1.6, 3 );
    this.camera.lookAt( 0, 0, 0 );

    this.controls.target.set( 0, 1.6, 0 );
    this.controls.update();

    var material = new THREE.MeshStandardMaterial( {
      color: 0xeeeeee,
      roughness: 1.0,
      metalness: 0.0
    } );
    var floor = new THREE.Mesh(  new THREE.PlaneGeometry( 4, 4 ), material );
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add( floor );

    this.scene.add( new THREE.HemisphereLight( 0x808080, 0x606060 ) );
    var light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 0, 6, 0 );
				light.castShadow = true;
				light.shadow.camera.top = 2;
				light.shadow.camera.bottom = - 2;
				light.shadow.camera.right = 2;
				light.shadow.camera.left = - 2;
				light.shadow.mapSize.set( 4096, 4096 );
				this.scene.add( light );
				this.scene.add( this.group );

				var geometries = [
					new THREE.BoxGeometry( 0.2, 0.2, 0.2 ),
					new THREE.ConeGeometry( 0.2, 0.2, 64 ),
					new THREE.CylinderGeometry( 0.2, 0.2, 0.2, 64 ),
					new THREE.IcosahedronGeometry( 0.2, 3 ),
					new THREE.TorusGeometry( 0.2, 0.04, 64, 32 )
				];

				for ( var i = 0; i < 50; i ++ ) {

					var geometry = geometries[ Math.floor( Math.random() * geometries.length ) ];
					var material = new THREE.MeshStandardMaterial( {
						color: Math.random() * 0xffffff,
						roughness: 0.7,
						metalness: 0.0
					} );

					var object = new THREE.Mesh( geometry, material );

					object.position.x = Math.random() * 4 - 2;
					object.position.y = Math.random() * 2;
					object.position.z = Math.random() * 4 - 2;

					object.rotation.x = Math.random() * 2 * Math.PI;
					object.rotation.y = Math.random() * 2 * Math.PI;
					object.rotation.z = Math.random() * 2 * Math.PI;

					object.scale.setScalar( Math.random() + 0.5 );

					object.castShadow = true;
					object.receiveShadow = true;

					this.group.add( object );

				}

				//

				this.renderer = new THREE.WebGLRenderer( { antialias: true } );
				this.renderer.setPixelRatio( window.devicePixelRatio );
				this.renderer.setSize( window.innerWidth, window.innerHeight );
				this.renderer.outputEncoding = THREE.sRGBEncoding;
				this.renderer.shadowMap.enabled = true;
				this.renderer.xr.enabled = true;
				this.container.appendChild( this.renderer.domElement );

				document.body.appendChild( VRButton.createButton( this.renderer ) );

				// controllers

				let controller1 = this.renderer.xr.getController( 0 );
				controller1.addEventListener( 'selectstart', this.onSelectStart );
				controller1.addEventListener( 'selectend', this.onSelectEnd );
				this.scene.add( controller1 );

				let controller2 = this.renderer.xr.getController( 1 );
				controller2.addEventListener( 'selectstart', this.onSelectStart );
				controller2.addEventListener( 'selectend', this.onSelectEnd );
				this.scene.add( controller2 );

				var controllerModelFactory = new XRControllerModelFactory();

				let controllerGrip1 = this.renderer.xr.getControllerGrip( 0 );
				controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
				this.scene.add( controllerGrip1 );

				let controllerGrip2 = this.renderer.xr.getControllerGrip( 1 );
				controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
				this.scene.add( controllerGrip2 );

				//

				var geometryn = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

				var line = new THREE.Line( geometryn );
				line.name = 'line';
				line.scale.z = 5;

				controller1.add( line.clone() );
				controller2.add( line.clone() );

				

				//

				window.addEventListener( 'resize', this.onWindowResize, false );
  }

   onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  onSelectStart( event:any ) {

    var controller = event.target as any;

    var intersections = this.getIntersections( controller );

    if ( intersections.length > 0 ) {

      var intersection = intersections[ 0 ];
      let tempMatrix = new THREE.Matrix4();
      tempMatrix.getInverse( controller.matrixWorld );

      var object = intersection.object;
      object.matrix.premultiply( tempMatrix );
      object.matrix.decompose( object.position, object.quaternion, object.scale );
      //object.material.emissive.b = 1;
      controller.add( object );

      controller.userData.selected = object;

    }

  }

  onSelectEnd( event:any ) {

    var controller = event.target;

    if ( controller.userData.selected !== undefined ) {

      var object = controller.userData.selected;
      object.matrix.premultiply( controller.matrixWorld );
      object.matrix.decompose( object.position, object.quaternion, object.scale );
      //object.material.emissive.b = 0;
      this.group.add( object );

      controller.userData.selected = undefined;

    }


  }

  getIntersections( controller:any ) {
    let tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation( controller.matrixWorld );
    this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    return this.raycaster.intersectObjects( this.group.children );

  }

  intersectObjects( controller:any ) {

    // Do not highlight when already selected

    if ( controller.userData['selected'] !== undefined ) return;

    var line = controller.getObjectByName( 'line' );
    var intersections = this.getIntersections( controller );

    if ( intersections.length > 0 ) {

      var intersection = intersections[ 0 ] as THREE.Intersection;

      var object = intersection.object;
      //object.material.emissive.r = 1;
      this.intersected.push( object );

      line.scale.z = intersection.distance;

    } else {

      line.scale.z = 5;

    }

  }

  cleanIntersected() {

    while ( this.intersected.length ) {

      var object = this.intersected.pop();
      object.material.emissive.r = 0;

    }

  }

}
