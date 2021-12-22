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
    
    //points coordinates
    var vertices = [vec2(0.0), vec2(1, 0), vec2(1,1) ]; 

    var colors =[vec4(1, 0, 0, 1), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0)]
      
    //creating the buffer
    var vBuffer = gl.createBuffer();   
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "a_Position");     
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(vPosition);

        
    
    //creating the buffer
    var cBuffer = gl.createBuffer();   
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);   
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation( program, "a_Color");     
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(cPosition);

    
    //drawing the points
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}