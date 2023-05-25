import * as glMatrix from "gl-matrix";
import UtilWebGL     from "./Utils/webgl";
import UtilLoader    from "./Utils/loader";
import Renderer      from "./Renderer/renderer";
import Camera        from "./Renderer/camera";
import MouseControl  from "./Control/mouse";
import FireObject    from "./Object/fire";

'use strict';

var main = function() {
  const canvas = document.getElementById('demo-canvas');
   // Static classes
  const WebGL   = UtilWebGL();
  const Loader  = UtilLoader();
  
  // Objects
  const camera   = Camera(glMatrix);
  const renderer = Renderer(canvas, camera);
  const mouseControl = MouseControl(canvas, camera);
  // Manager and Constructor
  const fireModel = FireObject(WebGL, renderer, Loader);
  
  // Initialize engine
  renderer.init();
  mouseControl.init();
  fireModel.init();

  // Renders the scene
  renderer.render();

  const fire = new fireModel([
    './texture/fire_gradient.png',
    './texture/combined_noise.png',
   // './texture/mask.png',
   // './texture/gradient.png'
  ]);
  fire.init();
}
main();

