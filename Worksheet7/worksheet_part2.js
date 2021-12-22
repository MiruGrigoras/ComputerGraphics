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
    var vertices = [
        vec4(-1.0, -1.0, 0.999, 1.0), 
        vec4(1.0, -1.0, 0.999, 1.0), 
        vec4(-1.0, 1.0, 0.999, 0.0), 
        vec4(1.0, 1.0, 0.999, 0.0) 
    ];


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
    pointsArray.push(
        vertices[0],
        vertices[1],
        vertices[3],
        vertices[3],
        vertices[2],
        vertices[0]
    );

    normalsArray.push(
        vertices[0],
        vertices[1],
        vertices[3],
        vertices[3],
        vertices[2],
        vertices[0]
    );
    index += 6;

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

    
    var cubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

    var cubefiles = ['textures/cm_left.png', // POSITIVE_X
        'textures/cm_right.png', // NEGATIVE_X
        'textures/cm_top.png', // POSITIVE_Y
        'textures/cm_bottom.png', // NEGATIVE_Y
        'textures/cm_back.png', // POSITIVE_Z
        'textures/cm_front.png' // NEGATIVE_Z
    ]; 

    gl.uniform4fv(gl.getUniformLocation(program, "lightDirection"), flatten(lightDirection));
    gl.uniform4fv(gl.getUniformLocation(program, "lightEmission"), flatten(lightEmission));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

    var perspectiveMatrix = gl.getUniformLocation(program, 'perspectiveMatrix');
    var fovy = 90.0;                              //angle
    var aspect = canvas.width / canvas.height;  // width vsheight canvas ratio
    var near = 0.01;    
    var far = 50.0;      
    var persp = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv(perspectiveMatrix, gl.FALSE, flatten(persp));

    var viewMatrix = gl.getUniformLocation(program, 'viewMatrix');
    var directions=[
        vec3(0.0, 0.0, 4.5), //eye - pov coordinates
        vec3(0.0, 0.0, 0.0), //at - point towards eye witness
        vec3(0.0, 1.0, 0.0), //up - up direction
    ]  

    var imageCounter = 0;
    for (var i = 0; i < cubefiles.length; i++) {
        var image = document.createElement('img');
        image.crossorigin = 'anonymous';
        image.onload = function (event) {
            var imageTarget = event.target;
            imageCounter++;
            gl.texImage2D(imageTarget.texturetarget, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageTarget);
        }
        image.src = cubefiles[i];
        image.texturetarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var theta = 0;
    function rotate(){
        theta += 0.025;
        directions[0] = vec3(4.5 * Math.sin(theta), 0.0, 4.5 * Math.cos(theta));
        var lookAtDir = lookAt(directions[0], directions[1], directions[2]);
        gl.uniformMatrix4fv(perspectiveMatrix, gl.FALSE, flatten(persp));
        gl.uniformMatrix4fv(viewMatrix, gl.FALSE, flatten(lookAtDir));
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if(imageCounter === 6){
            gl.uniformMatrix4fv(texMatrix, gl.FALSE, flatten(mat4()));
            gl.drawArrays(gl.TRIANGLES, 0, index-6);

            var texfinal = mult(inverse(lookAtDir), inverse(persp));

            gl.uniformMatrix4fv(texMatrix, gl.FALSE, flatten(texfinal));
            gl.drawArrays(gl.TRIANGLES, index-6, 6);
        }
        window.requestAnimFrame(rotate);
    }

    rotate();

    function draw(){
       
        index = 0;
        pointsArray = [];
        normalsArray = [];

        tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
        pointsArray.push(
            vertices[0],
            vertices[1],
            vertices[3],
            vertices[3],
            vertices[2],
            vertices[0]
        );
    
        normalsArray.push(
            vertices[0],
            vertices[1],
            vertices[3],
            vertices[3],
            vertices[2],
            vertices[0]
        );
        index += 6;

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

    filterModeMag.addEventListener("click", function(){
        switch(filterModeMag.value){
            case "nearest":
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                break;
            case "linear":
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                break;
            default: break;
        }
    });

    filterModeMin.addEventListener("click", function(){
        switch(filterModeMin.value){
            case "nearest":
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);;
                break;
            case "linear":
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                break;
            case "mipmapnn":
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST); 
                break;
            case "mipmapln":
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                break;
            case "mipmapnl":
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
                break;
            case "mipmapll":
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                break;
            default: break;
        }
    });
}
