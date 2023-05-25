
export default function( WebGL, Renderer, Loader ) {
    const vertexShader = `
      attribute vec3  aVertexPosition;
      attribute vec2  aTextureCoord;
    
      varying vec2  vTextureCoord;

      uniform mat4 uModelViewMat;
      uniform mat4 uProjectionMat;

      uniform float uCurrentTick;

      void main() {
        vec4 position = uProjectionMat * uModelViewMat * vec4(aVertexPosition.xyz,1.0);
        gl_Position = position;
        vTextureCoord = aTextureCoord;
      }
    `;
  
    const fragmentShader = `
      varying vec2  vTextureCoord;
      
      uniform sampler2D uColorTexture;
      uniform sampler2D uNoiseTexture;
      //uniform sampler2D uAlphaTexture;
      //uniform sampler2D uGradientTexture;

      uniform float uCurrentTick;

      void main() {
        vec4 noiseTextureSlow = texture2D( uNoiseTexture, vec2(vTextureCoord.x, vTextureCoord.y - uCurrentTick * 0.3) );
        vec4 noiseTextureFast = texture2D( uNoiseTexture, vec2(vTextureCoord.x, vTextureCoord.y - uCurrentTick * 0.6) );
        vec4 noiseMulti = texture2D( uNoiseTexture, vTextureCoord.st );
    
        vec2 transformedUv = vTextureCoord.st;
        transformedUv += (noiseTextureFast.r + noiseTextureSlow.r) * noiseMulti.b * noiseMulti.g;
        
        transformedUv = clamp( transformedUv, 0.0, 0.9 );
        
        vec4 texture = texture2D( uColorTexture, transformedUv.st );
        //vec4 texture = texture2D( uColorTexture, vTextureCoord.st );
        gl_FragColor = texture;
        //gl_FragColor = vec4( transformedUv, 0.0, 1.0);
      }
    `;

    /**
     * Program Link
     */
    var _program = null;
    /**
     * Buffer link (same geometrym, same buffer)
     */
    var _buffer = null;
    /**
     * Internal list
     */
    var _list = [];

    /**
     *  Build program and adds to render list
     */
    Fire.init = function init() {
        const vertices = [
            -0.5, +0.5, 0.0, 0.0, 1.0,
            -0.5, -0.5, 0.0, 0.0, 0.0,            
            +0.5, +0.5, 0.0, 1.0, 1.0,           
            +0.5, -0.5, 0.0, 1.0, 0.0,
        ];
        const gl = Renderer.gl;
        _program = WebGL.buildProgram(gl, vertexShader, fragmentShader);
        _buffer = gl.createBuffer();
      
        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        // Add to render queue
        Renderer.addRender(Fire.render);
    };
  
    /**
     * Renders all squares
     */
    Fire.render = function render(gl, tick, projection, modelView) {
        const uniform   = _program.uniform;
        const attribute = _program.attribute;
        let i, count = _list.length;
        if( !count ) {
            return;
        }
        gl.useProgram( _program );
        // Bind matrix
        gl.uniformMatrix4fv( uniform.uModelViewMat,  false, modelView );
        gl.uniformMatrix4fv( uniform.uProjectionMat, false, projection );
        
        gl.uniform1f( uniform.uCurrentTick, tick / 1000 % 1000);

        // Attributes
        gl.enableVertexAttribArray(attribute.aVertexPosition);
        gl.enableVertexAttribArray(attribute.aTextureCoord);

        gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
        gl.vertexAttribPointer(attribute.aVertexPosition, 3, gl.FLOAT, false, 5*4, 0 );
        gl.vertexAttribPointer(attribute.aTextureCoord,   2, gl.FLOAT, false, 5*4, 3*4);
        

        for( i=0; i < count; i++) {
            if( _list[i].ready === false ) {
                continue;
            }
            // Base
            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, _list[i].textures[0]);
            gl.uniform1i( uniform.uColorTexture, 0 );
            // Noise
            gl.activeTexture( gl.TEXTURE1 );
            gl.bindTexture( gl.TEXTURE_2D, _list[i].textures[1] );
            gl.uniform1i( uniform.uNoiseTexture, 1 );
            // Alpha
            if( _list[i].textures[2] ) {
                gl.activeTexture( gl.TEXTURE2 );
                gl.bindTexture( gl.TEXTURE_2D, _list[i].textures[2] );
                gl.uniform1i( uniform.uAlphaTexture, 2 );
            }
            // Gradient
            if( _list[i].textures[3] ) {
                gl.activeTexture( gl.TEXTURE3 );
                gl.bindTexture( gl.TEXTURE_2D, _list[i].textures[3] );
                gl.uniform1i( uniform.uGradientTexture, 3 );
            }    
            //Draw
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        /*gl.disableVertexAttribArray( attribute.aVertexPosition );
		gl.disableVertexAttribArray( attribute.aTextureCoord );*/
    };
    
    // Class methods
    /**
     * Constructor
     * @param {array} textureNames | array of string 
     */
    function Fire(textureNames) {

        this.textureNames = textureNames;
        
        // Needed
        this.textures = [];
        this.ready = false;
    }
    /**
     * Init object, prototype
     */
    Fire.prototype.init = function init() {
        const gl = Renderer.gl;
        const self = this;
        let loadedTextures = 0;
        let textureCount = this.textureNames.length;
        // Loads textures
        for(let i=0; i < textureCount; i++ ) {
            Loader.loadRemoteFile(this.textureNames[i], function(file){
                onLoadTexture(file,i);
            })
        }
     
        function onLoadTexture(file, index) {
            let texture = URL.createObjectURL(new Blob( [file], { type: 'image/png' }));        
            WebGL.texture(gl, texture, function(texture) {
                self.textures[index] = texture;
                // All has been loaded
                if( ++loadedTextures == textureCount ) {
                    self.ready = true;  
                }
            });
        }
        _list.push(self);
    }
    return Fire;
  }
     
  
  