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
    

    //draw circle
    center_x = 0;
    center_y = 0;
    center_vec = vec2(center_x, center_y);
    
    //we want 60 triangles
    var no_triangles = 60;
    
    //circle radius is 0.35
    var radius = 0.35;
    var verticesData = [center_vec];

    for(var i = 0; i <= 60; i++)
    {
        var new_angle = (2*Math.PI) / no_triangles * (i+1);

        var new_x = center_x + Math.cos(new_angle) * radius;
        var new_y = center_y + Math.sin(new_angle) * radius;
        var new_point = vec2(new_x, new_y);
        verticesData.push(new_point);
   }
     
    //creating the buffer
    var vBuffer = gl.createBuffer();   
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesData), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "a_Position"); 

    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(vPosition);

    
    //color the circle
    var colors =[vec4(1, 0, 0, 1), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0)]
    
    //creating the buffer
    var cBuffer = gl.createBuffer();   
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);   
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation( program, "a_Color");     
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(cPosition);
    
    newPosition = gl.getUniformLocation(program, "v_Trans");

    //W-vec is speed value and direction, 0.0 for no translation on x and 0.01 for translation on y 
    w_Vec = [0.0, 0.01];

   //V-vec is gonna save the new delta for the points and these values will be sent back to html through "newPositions"
    v_Vec =[0,0];

    //YOU CANNOT CALL REQUESTANIMFRAME INSIDE A FUNCTION WITH ARGUMENTS !!!
    function tick(){
        bounce(no_triangles, radius);
        requestAnimFrame(tick);
    }
    tick();

    
}


function bounce(no_triangles, radius){
    // setTimeout(function(){
     {   
        gl.clear(gl.COLOR_BUFFER_BIT);

        v_Vec[0] += w_Vec[0];
        v_Vec[1] += w_Vec[1];

        var vect_length = Math.sqrt(Math.pow(v_Vec[0], 2) + Math.pow(v_Vec[1],2));

        w_Vec[0] *= Math.sign(1-radius-vect_length);
        w_Vec[1] *= Math.sign(1-radius-vect_length);
        
        gl.uniform2f(newPosition, v_Vec[0], v_Vec[1]);
        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, no_triangles+2 );

        
    }
    
}
