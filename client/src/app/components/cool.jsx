import { createClass, createElement, PropTypes } from 'react';
import { assetPath, assetCache } from '../assets.js';
import { find } from 'lodash';
import * as THREE from 'three';
import { Mesh } from 'react-three';



let boxgeometry = new THREE.BoxGeometry(10,10,10);

let boxmaterialcache = [];
function lookupmaterial(materialname) {
  let material = find(boxmaterialcache, function(x) { return x.name === materialname;});
  if (typeof material !== "undefined") { return material; }

  // not found. create a new material for the given texture
  let texturemap = THREE.ImageUtils.loadTexture( assetPath(materialname) );
  let newmaterial = new THREE.MeshBasicMaterial( { map: texturemap } );
  newmaterial.name = materialname;

  boxmaterialcache.push(newmaterial);
  return newmaterial;
}

export let ClickableCube = createClass({
  displayName: 'ClickableCube',
  propTypes: {
    position: PropTypes.instanceOf(THREE.Vector3),
    quaternion: PropTypes.instanceOf(THREE.Quaternion),
    materialname: PropTypes.string.isRequired,
    shared: PropTypes.bool
  },
  render: function() {
    let boxmaterial = lookupmaterial(this.props.materialname);
    let cubeprops = Object.assign({}, this.props, {
      geometry: boxgeometry,
      material: boxmaterial,
      //geometry: assetCache['cyclopsGeometry'],
      //material: assetCache['cyclopsMaterial'],
      scale: 3
    });
    return createElement(Mesh, cubeprops);
  }
});

export default ClickableCube;
