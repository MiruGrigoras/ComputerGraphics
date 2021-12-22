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

    // var vertexColors = [
    //         vec4(0.0, 0.0, 0.0, 1.0), //black
    //         vec4(1.0, 0.0, 0.0, 1.0), //red
    //         vec4(1.0, 1.0, 0.0, 1.0), //yellow
    //         vec4(0.0, 1.0, 0.0, 1.0), //green
    //         vec4(0.0, 0.0, 1.0, 1.0), //blue
    //         vec4(1.0, 0.0, 1.0, 1.0), //magenta
    //         vec4(1.0, 1.0, 1.0, 1.0), //white
    //         vec4(0.0, 1.0, 1.0, 1.0), //cyan
    //     ]

    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    
        
    var numTimesToSubdivide = 0;
    var numVertexes = 0;
    var vertexes = [];
    gl.p_buffer = null;

    function triangle(a, b, c){
        vertexes.push(a);
        vertexes.push(b);
        vertexes.push(c);
        numVertexes += 3;
    }

    function divideTriangle(a, b, c, count){
        if (count > 0) {
            var ab = normalize(mix(a, b, 0.5), true);
            var ac = normalize(mix(a, c, 0.5), true);
            var bc = normalize(mix(b, c, 0.5), true);
            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        } else {
            triangle(a, b, c);
        }
    }

    function tetrahedron(a, b, c, d, n){
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }

    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    gl.deleteBuffer(gl.p_buffer);
    gl.p_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.p_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexes), gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // var cBuffer = gl.createBuffer();   
    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);   
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
                
    // var cPosition = gl.getAttribLocation( program, "a_Color");     
    // gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);   
    // gl.enableVertexAttribArray(cPosition);

    var perspectiveMatrix = gl.getUniformLocation(program, 'perspectiveMatrix');
    var fovy = 45.0;                              //angle
    var aspect = canvas.width / canvas.height;  // width vsheight canvas ratio
    var near = 0.01;    
    var far = 20.0;      
    var persp = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv(perspectiveMatrix, gl.FALSE, flatten(persp));

    var viewMatrix = gl.getUniformLocation(program, 'viewMatrix');
    var directions=[
        vec3(0.0, 0.0, 4.5), //eye - pov coordinates
        vec3(0.0, 0.0, 0.0), //at - point towards eye witness
        vec3(0.0, 1.0, 0.0), //up - up direction
    ]    
    var lookAtDir = lookAt(directions[0], directions[1], directions[2]);
    gl.uniformMatrix4fv(viewMatrix, gl.FALSE, flatten(lookAtDir));


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for(var i = 0; i < numVertexes; i+=3){
        gl.drawArrays(gl.TRIANGLES, i , 3);
    }

    function draw(){
       
        numVertexes = 0;
        vertexes = [];

        tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

        gl.deleteBuffer(gl.p_buffer);
        gl.p_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.p_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexes), gl.STATIC_DRAW);

        var a_Position = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
       
        // var cBuffer = gl.createBuffer();   
        // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);   
        // gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
                    
        // var cPosition = gl.getAttribLocation( program, "a_Color");     
        // gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);   
        // gl.enableVertexAttribArray(cPosition);

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for(var i = 0; i < numVertexes; i += 3){
            gl.drawArrays(gl.TRIANGLES, i , 3);
        }
    }

    increase.addEventListener("click", function () {
        if(numTimesToSubdivide < 5){
            numTimesToSubdivide++;
            draw();
        }
    });

   decrease.addEventListener("click", function () {
        if(numTimesToSubdivide > 0){
            numTimesToSubdivide--;
            draw();
        }
    });

}