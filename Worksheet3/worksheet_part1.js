window.onload = function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas)
    if(!gl){
        console.log("WebGL is not available.");
    }

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //initilising the shaders from html
    var program = initShaders(gl, "vertex-shader", "fragment-shader");    
    gl.useProgram(program);  
    gl.enable(gl.DEPTH_TEST); 
    
    
    
    var vertices = [
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, -0.5),
    ];


    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0), //black
        vec4(1.0, 0.0, 0.0, 1.0), //red
        vec4(1.0, 1.0, 0.0, 1.0), //yellow
        vec4(0.0, 1.0, 0.0, 1.0), //green
        vec4(0.0, 0.0, 1.0, 1.0), //blue
        vec4(1.0, 0.0, 1.0, 1.0), //magenta
        vec4(1.0, 1.0, 1.0, 1.0), //white
        vec4(0.0, 1.0, 1.0, 1.0), //cyan
    ]

    /** USING TRIANGLES

    var indices = [
        1, 0, 3,
        3, 2, 1,
        2, 3, 7,
        7, 6, 2,
        3, 0, 4,
        4, 7, 3,
        6, 5, 1,
        1, 2, 6, 
        4, 5, 6,
        6, 7, 4,
        5, 4, 0,
        0, 1, 5, 
    ]
    */

    var lines = [
        0, 1,
        1, 2,
        2, 3,
        3, 0,
        4, 5, 
        5, 6,
        6, 7,
        7, 4,
        0, 4, 
        1, 5,
        2, 6, 
        3, 7,
    ]

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    
    /** USING TRIANGLES
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    */
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(lines), gl.STATIC_DRAW);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

            
    var vPosition = gl.getAttribLocation( program, "a_Position");     
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();   
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);   
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
                
    var cPosition = gl.getAttribLocation( program, "a_Color");     
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(cPosition);

    var matrix = gl.getUniformLocation(program, 'matrix');
    
    var directions=[
        vec3(0.0, 0.0, 0.0), //eye - pov coordinates
        vec3(0.5, 0.5, 0.5), //at - point towards eye witness
        vec3(0.0, 1.0, 0.0), //up - up direction
    ]
    var lookAtDir = lookAt(directions[0], directions[1], directions[2]);
    gl.uniformMatrix4fv(matrix, gl.FALSE, flatten(lookAtDir));

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /** USING TRIANGLES
     
    gl.drawElements(gl.TRIANGLES, indices.length , gl.UNSIGNED_BYTE, 0); 
    
    */
    gl.drawElements(gl.LINES, lines.length , gl.UNSIGNED_BYTE, 0); 


     
}