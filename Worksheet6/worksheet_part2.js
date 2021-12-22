window.onload = function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas)
    if(!gl){
        console.log("WebGL is not available.");
    }

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");    
    gl.useProgram(program); 
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    var vertices = [
        vec3(-4.0, -1.0, -1.0),
         vec3(4.0, -1.0, -1.0), 
         vec3(4.0, -1.0, -21.0), 
         vec3(-4.0, -1.0, -21.0)
    ];
    var texCoord = [
        vec2(-1.5, 0.0), 
        vec2(2.5, 0.0), 
        vec2(2.5, 10.0), 
        vec2(-1.5, 10.0)
    ];
    var colors = [
        vec3(1.0, 1.0, 1.0), 
        vec3(1.0, 1.0, 1.0), 
        vec3(1.0, 1.0, 1.0), 
        vec3(1.0, 1.0, 1.0)
    ]; 


    var p_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, p_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var c_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, c_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    var t_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, t_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);

    var a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_TexCoord);

    
    var perspectiveMatrix = gl.getUniformLocation(program, 'perspectiveMatrix');
    var fovy = 90.0;                              //angle
    var aspect = canvas.width / canvas.height;  // width vsheight canvas ratio
    var near = 0.01;    
    var far = 50.0;      
    var persp = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv(perspectiveMatrix, gl.FALSE, flatten(persp));

    var viewMatrix = gl.getUniformLocation(program, 'viewMatrix');
    var directions=[
        vec3(0.0, 0.0, 0.0), //eye - pov coordinates
        vec3(0.0, 0.0, 0.0), //at - point towards eye witness
        vec3(0.0, 1.0, 0.0), //up - up direction
    ]  
    var lookAtDir = lookAt(directions[0], directions[1], directions[2]);
    gl.uniformMatrix4fv(viewMatrix, gl.FALSE, flatten(lookAtDir));

    var texSize = 64;
    var numRows = 8;
    var numCols = 8;
    var myTexels = new Uint8Array(4*texSize*texSize);
    for (var i = 0; i < texSize; ++i) {
        for (var j = 0; j < texSize; ++j) {
            var patchx = Math.floor(i/(texSize/numRows));
            var patchy = Math.floor(j/(texSize/numCols));
            var c = (patchx%2 !== patchy%2 ? 255 : 0);
            myTexels[4*i*texSize+4*j] = c;
            myTexels[4*i*texSize+4*j+1] = c;
            myTexels[4*i*texSize+4*j+2] = c;
            myTexels[4*i*texSize+4*j+3] = 255;
        }
    }

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
    gl.generateMipmap(gl.TEXTURE_2D);


    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        
        window.requestAnimFrame(render);
    }

    render();

    wrappingMode.addEventListener("click", function(){
        switch(wrappingMode.value){
            case "repeat": 
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                break;
            case "clamp":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                break;
            case "mirror":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                break;
            default: break;
        }
    });

    filterModeMag.addEventListener("click", function(){
        switch(filterModeMag.value){
            case "nearest":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                break;
            case "linear":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                break;
            default: break;
        }
    });

    filterModeMin.addEventListener("click", function(){
        switch(filterModeMin.value){
            case "nearest":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);;
                break;
            case "linear":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                break;
            case "mipmapnn":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST); 
                break;
            case "mipmapln":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                break;
            case "mipmapnl":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
                break;
            case "mipmapll":
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                break;
            default: break;
        }
    });
}