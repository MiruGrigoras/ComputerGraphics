window.onload = function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas, {alpha: false});
    if(!gl){
        console.log("WebGL is not available.");
    }

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);


    var program = initShaders(gl, "vertex-shader", "fragment-shader");    
    gl.useProgram(program); 
    

    var base = [
        vec3(-2.0, -1.0, -1.0), 
        vec3(-2.0, -1.0, -5.0), 
        vec3(2.0, -1.0, -1.0), 
        vec3(2.0, -1.0, -5.0)
    ];
        
    var leftRect = [
        vec3(0.25, -0.5, -1.25), 
        vec3(0.25, -0.5, -1.75), 
        vec3(0.75, -0.5, -1.25), 
        vec3(0.75, -0.5, -1.75)
    ]; 
        
    var rightRect = [
        vec3(-1.0, -1.0, -2.5), 
        vec3(-1.0, -1.0, -3.0), 
        vec3(-1.0, 0.0, -2.5), 
        vec3(-1.0, 0.0, -3.0)
    ]; 

    var texCoord = [
        vec2(-1.0, 1.0), 
        vec2(-1.0, -1.0), 
        vec2(1.0, 1.0), 
        vec2(1.0, -1.0)
    ]; 

    var pointsArray = [
        base[2], base[0], base[1], base[1], base[3], base[2],
        leftRect[2], leftRect[0], leftRect[1], leftRect[1], leftRect[3], leftRect[2],
        rightRect[2], rightRect[0], rightRect[1], rightRect[1], rightRect[3], rightRect[2]
    ];


    var texArray = [
        texCoord[2], texCoord[0], texCoord[1], texCoord[1], texCoord[3], texCoord[2],
        texCoord[2], texCoord[0], texCoord[1], texCoord[1], texCoord[3], texCoord[2], 
        texCoord[2], texCoord[0], texCoord[1], texCoord[1], texCoord[3], texCoord[2]
    ];


    var p_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, p_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var t_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, t_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texArray), gl.STATIC_DRAW);

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

    var image = document.createElement('img');
    image.crossorigin = 'anonymous';
    image.onload = function () {
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    image.src = 'xamp23.png';

    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);

    gl.texImage2D(gl.TEXTURE_2D ,0,gl.RGB, 1,1,0,gl.RGB,gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0]));

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    var angle = 0;
    var center = vec3(0.0, 2.0, -2.0);
    var radius = 2;

    var indentityMatrix = mat4(); 
    indentityMatrix[3][3] = 0; 
    indentityMatrix[3][1] = 1/(-(center[1] -(-1))) + 0.00001;

    function draw() {
        angle += 0.025;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.uniform1f(gl.getUniformLocation(program, "visibility"), 1);
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
                 
        var posTrans = translate(center[0] + (radius * Math.sin(angle)), center[1], center[2] + (radius * Math.cos(angle)));
        var negTrans = translate(-center[0] + (radius * Math.sin(angle)), -center[1], -center[2] + (radius * Math.cos(angle)));
        gl.uniform1f(gl.getUniformLocation(program, "visibility"), 0);
        gl.uniformMatrix4fv(viewMatrix, false, flatten(mult(mult(posTrans, indentityMatrix), negTrans)));
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
        gl.depthFunc(gl.GREATER);
        gl.drawArrays(gl.TRIANGLES, 6, 12);

        gl.uniform1f(gl.getUniformLocation(program, "visibility"), 1);
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
        gl.uniformMatrix4fv(viewMatrix, false, flatten(mat4()));
        gl.depthFunc(gl.LESS);
        gl.drawArrays(gl.TRIANGLES, 6, 12 );

        window.requestAnimFrame(draw);
    }
    draw();

}