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

    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    
        
    var numTimesToSubdivide = 0;
    var index = 0;
    var pointsArray = [];
    var normalsArray = [];
    var lightDirection = vec4 (0, 0, 1, 0);
    var lightEmission = vec4 (1, 1, 1, 1);
    var diffuseProduct = mult(vec4(1, 1, 1, 1), vec4(0, 0.8, 1, 1))
    gl.p_buffer = null;
    gl.n_buffer = null;

    function triangle(a, b, c){
        normalsArray.push(vec4(a[0], a[1], a[2], 0.0));
        normalsArray.push(vec4(b[0], b[1], b[2], 0.0));
        normalsArray.push(vec4(c[0], c[1], c[2], 0.0));

        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);

        index += 3;
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
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.deleteBuffer(gl.n_buffer);
    gl.n_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.n_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var a_Normal = gl.getAttribLocation(program, "a_Normal");
    gl.vertexAttribPointer(a_Normal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.uniform4fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
    gl.uniform4fv(gl.getUniformLocation(program, "lightEmission"), flatten(lightEmission));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

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

    var theta = 0;
    function rotate(){
        theta += 0.025;
        directions[0] = vec3(4.5 * Math.sin(theta), 0.0, 4.5 * Math.cos(theta));
        var lookAtDir = lookAt(directions[0], directions[1], directions[2]);
        gl.uniformMatrix4fv(viewMatrix, gl.FALSE, flatten(lookAtDir));
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for(var i = 0; i < index; i += 3){
            gl.drawArrays(gl.TRIANGLES, i , 3);
        }
        window.requestAnimFrame(rotate);
    }

    rotate();


    function draw(){
       
        index = 0;
        pointsArray = [];
        normalsArray = [];

        tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

        gl.deleteBuffer(gl.p_buffer);
        gl.p_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.p_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

        var a_Position = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
       
        gl.deleteBuffer(gl.n_buffer);
        gl.n_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.n_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

        var a_Normal = gl.getAttribLocation(program, "a_Normal");
        gl.vertexAttribPointer(a_Normal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
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

       
    var front = true;
    switchFrontBack.addEventListener("click", function () {
        if(front){
            gl.frontFace(gl.CW);
            front = false;
        }else{
            gl.frontFace(gl.CCW);
            front = true;
        }
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for(var i = 0; i < index; i+=3){
            gl.drawArrays(gl.TRIANGLES, i , 3);
        }
    });

}