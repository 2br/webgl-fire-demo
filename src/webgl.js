export default class WebGL {
    
    /**
	 * Compile Webgl shader (fragment and vertex)
	 *
	 * @param {object} gl context
	 * @param {string} source
	 * @param {number} type (fragment or shader constant)
	 */
	static compileShader( gl, source, type)
	{
		var shader, error;

		// Compile shader
		shader = gl.createShader(type);
		gl.shaderSource(shader, 'precision mediump float;' + source);
		gl.compileShader(shader);

		// Is there an error ?
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
    static buildProgram(gl, vertexShader, fragmentShader) {
    
        let shaderProgram, vs, fs, attrib, uniform;
        let i, count, error;
        // Cria programa e compila shaders
        shaderProgram = gl.createProgram();
        vs = WebGL.compileShader( gl, vertexShader  , gl.VERTEX_SHADER );
        fs = WebGL.compileShader( gl, fragmentShader, gl.FRAGMENT_SHADER );
        // Link
        gl.attachShader(shaderProgram, vs);
        gl.attachShader(shaderProgram, fs);
        gl.linkProgram(shaderProgram);
    
        // Verifica status de link
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            error = gl.getProgramInfoLog(shaderProgram);
            gl.deleteProgram(shaderProgram);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            throw new Error('WebGL::buildProgram() - fail to build shaders : ' + error);
        }
    
        // Pega attribue location e já ajusta para objeto
        count = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
        shaderProgram.attribute = {};
        for (i = 0; i < count; i++) {
            attrib = gl.getActiveAttrib(shaderProgram, i);
            shaderProgram.attribute[attrib.name] = gl.getAttribLocation(shaderProgram, attrib.name);
        }
    
        // Pega uniform location e poe no objeto
        count = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
        shaderProgram.uniform = {};
        for (i = 0; i < count; i++) {
            uniform = gl.getActiveUniform(shaderProgram, i);
            shaderProgram.uniform[uniform.name] = gl.getUniformLocation(shaderProgram, uniform.name);
        }
        return shaderProgram;
    }
}