
var angle=0;

window.onload = function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl){
        console.log("WebGL is not available.");
    }
    
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //initilising the shaders from html
    var program = initShaders(gl, "vertex-shader", "fragment-shader");    
    gl.useProgram(program);   
    
    //points coordinates
    var vertices = [vec2(0.5, 0), vec2(0, 0.5), vec2(-0.5, 0), vec2(0, -0.5)]; 
     
    //creating the buffer
    var vBuffer = gl.createBuffer();   
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "a_Position"); 

    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(vPosition);
    
    angleLocation = gl.getUniformLocation(program, "u_AngleLoc");

    rotate();
    //drawing the points
    
}


function rotate(){
    setTimeout(function(){
        angle += 0.25;
        gl.uniform1f(angleLocation, angle);
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        requestAnimFrame(rotate);
    }, 16);
    
}