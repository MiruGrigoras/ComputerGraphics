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
    

    var max_verts = 1000;
    var index = 0; var numPoints = 0;

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec2'], gl.STATIC_DRAW);


    //add event listener to mouse click
    canvas.addEventListener("click", function (event) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

        var domThingy = event.target.getBoundingClientRect() ;

        var newPoint = vec2(-1 + 2 * (event.clientX - domThingy.left)/canvas.width,
                    -1 + 2*(canvas.height - event.clientY + domThingy.top-1)/canvas.height);

        gl.bufferSubData(gl.ARRAY_BUFFER, index*sizeof['vec2'], flatten(newPoint));
        numPoints = Math.max(numPoints, ++index); 
        index %= max_verts;
            
        var vPosition = gl.getAttribLocation( program, "a_Position");     
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);   
        gl.enableVertexAttribArray(vPosition);
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        //drawing the points
        gl.drawArrays(gl.POINTS, 0, numPoints);
    });
     
}