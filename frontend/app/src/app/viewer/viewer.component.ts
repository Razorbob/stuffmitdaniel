import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';


@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  private scene;
  private renderer;
  private camera;

  constructor() { 
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    this.renderer = new THREE.WebGLRenderer();
  }

  ngOnInit(): void {
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas:  document.getElementById("viewer")!});
    this.renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
    this.renderer.xr.enabled = true;
    this.camera.position.set( 0, 0, 100 );
    this.camera.lookAt( 0, 0, 0 );

    const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 0, 0 ) );

    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    this.scene.add( line );
    this.renderer.render( this.scene, this.camera );
  }

}
