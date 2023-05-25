export default function(glMatrix) {
    // Namespace
    const Camera = {};
    
    const mat4 = glMatrix.mat4;
    const vec3 = glMatrix.vec3;
    /**
	 * Projection matrix
	 * @var {mat4} projection
	 */
    Camera.projection = mat4.create();
    /**
	 * ModelView matrix
	 * @var {mat4} modelView
	 */
	Camera.modelView = mat4.create();
    /**
     * Position
	 * @var {vec3}
	 */
	Camera.position = vec3.create();  
    /**
     * Camera view
     * @var {vec3}
     */
    Camera.view = vec3.create();
    /**
     * Rotation da camera (x,y,z)
     * @var {vec3}
     */
    Camera.rotation = vec3.create();

    // Camera Movement
    /**
     * To Position 
     * @var {vec3}
     */
    Camera.toPosition = vec3.create();
    /**
     * Where to look at
     * @var {vec3}
     */
    Camera.toView = vec3.create();
    /**
     * Rotation
     * @var {vec3}
     */
    Camera.toRotation = vec3.create();
    
    /**
     * Last tic
     * @var {integer}
     */
    Camera.lastTick = 0;

    var _default = {
        position:   [  0,   0,  2 ],
        rotation:   [  0,   0,  0 ],
        view:       [  0,   0,  0 ]
    };
    /**
     * Initialization view
     */
    Camera.init = function init(width, height) {

        mat4.perspective(this.projection, 45.0, width/height, 0.1, 10 );

        Camera.reset(); 
        Camera.position.set(Camera.toPosition);
        Camera.view.set(Camera.toView);
        Camera.rotation.set(this.toRotation);        
    };
    
    /**
     * Default camera
     */
    Camera.reset = function reset() {
        Camera.toPosition.set( _default.position );
        Camera.toView.set( _default.view );
        Camera.toRotation.set( _default.rotation );
    };

    /**
	 * Update camera information
	 * @param {number} tick
	 */
    Camera.update = function update(tick){
        const matrix = this.modelView;
        let i, lerp;
        
        lerp = Math.min( (tick - this.lastTick) * 0.005, 1.0);
		this.lastTick = tick;
        
        for(i=0; i < 3; i++)  {
            // Check position, view and rotation changes
            if( this.position[i] != this.toPosition[i]) {
                this.position[i] += ( this.toPosition[i] - this.position[i] ) * lerp;
            }
            
            if( this.view[i] != this.toView[i] ) {
                this.view[i] += ( this.toView[i] - this.view[i] ) * lerp;
            }
            
            if( this.rotation[i] != this.toRotation[i] ) {
                this.rotation[i] += ( this.toRotation[i] - this.rotation[i]) * lerp;
                this.rotation[i] %=  360;
            }
        }

        mat4.lookAt( matrix, this.position,  this.view, [0, 1, 0] );
        
        mat4.rotateX(matrix, matrix, this.rotation[0] / 180 * Math.PI);
        mat4.rotateY(matrix, matrix, this.rotation[1] / 180 * Math.PI);
        mat4.rotateZ(matrix, matrix, this.rotation[2] / 180 * Math.PI);
    };

    return Camera;
}
