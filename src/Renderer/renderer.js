
export default function (canvas, Camera) {
    
    // Namespace
    const Renderer = {};

    Renderer.canvas = canvas;
    /**
	 * @var {WebGLContext}
	 */
	Renderer.gl     = null;
    /**
     * @var {integer}
     */
    Renderer.tick = 0;
    /**
	 * @var {function[]} callbacks to execute
	 */
	Renderer.renderCallbacks = [];
    
    // fallback to timeout
    const _requestAnimationFrame =
    window.requestAnimationFrame        ||
    window.webkitRequestAnimationFrame  ||
    function(callback){
        window.setTimeout( callback, 1000/60 );
    };

    /**
     * Init the rendering
     */
    Renderer.init = function init() {
        const gl =  this.canvas.getContext("webgl", { depth: true });
        const canvas =  this.canvas;
        this.gl = gl;

		gl.clearDepth( 1.0 );
		gl.enable( gl.DEPTH_TEST );
		gl.depthFunc( gl.LEQUAL );
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		
        gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
        // Set first viewport and init camera
        this.resize(canvas.width, canvas.height);
    };

    /**
     * Renders the scene and all the callbacks
     */
    Renderer.render = function render(func) {
        let i, count, gl = this.gl;
        this.tick = Date.now();
        
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        Camera.update(this.tick);
        
        _requestAnimationFrame( this.render.bind(this) );
        // Call all the sub renders
        count = this.renderCallbacks.length;
        
        for (i = 0; i < count; ++i) {
			this.renderCallbacks[i]( gl, this.tick, Camera.projection, Camera.modelView);
		}
    };

    /**
     * Adds the function to the render callback list
     * @param {function} func | callBack
     */
    Renderer.addRender = function addRender(func) {
        if (typeof func === 'function') {
			this.renderCallbacks.push(func);
		}
    };

    Renderer.resize = function resize(width, height) {
        this.canvas.width         = width;
		this.canvas.height        = height;
		this.canvas.style.width   = this.width + 'px';
		this.canvas.style.height  = this.height + 'px';
        this.gl.viewport( 0, 0, width, height );
       
        // Update camera projection
        Camera.init( width, height);
    }
    return Renderer;
}
