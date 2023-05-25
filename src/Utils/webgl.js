/**
 * Static class to create shaders, program and textures
 */
export default function () {
    
    /**
	 * Compile Webgl shader (fragment and vertex)
	 *
	 * @param {object} gl context
	 * @param {string} source
	 * @param {number} type (fragment or shader constant)
	 */
	function compileShader( gl, source, type)
	{
		var shader, error;

		// Compile shader
		shader = gl.createShader(type);
		gl.shaderSource(shader, 'precision highp float;' + source);
		gl.compileShader(shader);

		// Check iff there is an error in shader link
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			error = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);

			throw new Error('WebGL::CompileShader() - Fail to compile shader : ' + error);
		}
		return shader;
	}

    /**
     * @param {object} gl context
     * @param {string} vertexShader 
     * @param {string} fragmentShader 
     * @returns {object} webgl Program
     */
    function buildProgram(gl, vertexShader, fragmentShader) {
    
        let shaderProgram, vs, fs, attrib, uniform;
        let i, count, error;
        // Create program and compile shaders
        shaderProgram = gl.createProgram();
        vs = compileShader( gl, vertexShader  , gl.VERTEX_SHADER );
        fs = compileShader( gl, fragmentShader, gl.FRAGMENT_SHADER );
        // Link
        gl.attachShader(shaderProgram, vs);
        gl.attachShader(shaderProgram, fs);
        gl.linkProgram(shaderProgram);
    
        // Check if there is an error in program link
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            error = gl.getProgramInfoLog(shaderProgram);
            gl.deleteProgram(shaderProgram);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            throw new Error('WebGL::buildProgram() - fail to build shaders : ' + error);
        }
    
        // Set attribute locations
        count = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
        shaderProgram.attribute = {};
        for (i = 0; i < count; i++) {
            attrib = gl.getActiveAttrib(shaderProgram, i);
            shaderProgram.attribute[attrib.name] = gl.getAttribLocation(shaderProgram, attrib.name);
        }
    
       // Set uniform locations
        count = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
        shaderProgram.uniform = {};
        for (i = 0; i < count; i++) {
            uniform = gl.getActiveUniform(shaderProgram, i);
            shaderProgram.uniform[uniform.name] = gl.getUniformLocation(shaderProgram, uniform.name);
        }
        return shaderProgram;
    }

    /**
     * Loads an texture
     * @param {} data 
     * @param {function} onComplete | callback
     * @returns 
     */
    function textureLoad( data, onComplete ) {
        var args = Array.prototype.slice.call(arguments, 2);

        if (!data) {
            // Signal failure and goto callback
            args.unshift(false);
			onComplete.apply( null, args );
            return;
        }

        var img = new Image();
		img.src = data;

        img.onload = function OnLoadClosure(){
			// Remove the objectUrl, already used
			if (data.match(/^blob\:/)){
				URL.revokeObjectURL(data);
			}
            // Signal success and goto callback
            args.unshift( true );
			onComplete.apply( this, args );   
        }
    }

    /**
     * Convert to the nearest power of two number
     * @param {integer} num 
     * @returns 
     */
    function toPowerOfTwo( num )
	{
		return Math.pow( 2, Math.ceil( Math.log(num)/Math.log(2) ) );
	}
    
    /**
	 * Load an image and push it to GPU
	 * @param {object} gl context
	 * @param {string} url
	 * @param {function} callback once the image is on gpu
	 */
	function texture( gl, url, callback)
	{
        const args = Array.prototype.slice.call(arguments, 3);
        textureLoad(url, function( success ) {
			if (!success) {
				return;
			}
			let canvas, ctx, texture;
			canvas        = document.createElement('canvas');
			canvas.width  = toPowerOfTwo(this.width);
			canvas.height = toPowerOfTwo(this.height);
			ctx           = canvas.getContext('2d');
            // We need to flip vertically, because of the different coordinate system of webgl and canvas
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
			ctx.drawImage( this, 0, 0, canvas.width, canvas.height );

			texture = gl.createTexture();
			gl.bindTexture( gl.TEXTURE_2D, texture );
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );
			
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);			
			
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			args.unshift( texture );
			callback.apply( null, args );
        });
    }
    // Exports
    return {
        buildProgram: buildProgram,
        texture: texture
    };
}