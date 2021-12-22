

window.onload = function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas)
    if(!gl){
        console.log("WebGL is not available.");
    }

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);


    var programTeapot = initShaders(gl, "vertex-shader-teapot", "fragment-shader-teapot");    
    gl.useProgram(programTeapot); 

    var teapot = initialiseTeapot();
    function initialiseTeapot() {
        programTeapot.a_Position = gl.getAttribLocation(programTeapot, 'a_Position');
        programTeapot.a_Normal = gl.getAttribLocation(programTeapot, 'a_Normal');
        programTeapot.a_Color = gl.getAttribLocation(programTeapot, 'a_Color');

        var teapot = new Object();
        teapot.vertexBuffer = createEmptyArrayBuffer(gl, programTeapot.a_Position, 3, gl.FLOAT);
        teapot.normalBuffer = createEmptyArrayBuffer(gl, programTeapot.a_Normal, 3, gl.FLOAT);
        teapot.colorBuffer = createEmptyArrayBuffer(gl, programTeapot.a_Color, 4, gl.FLOAT);
        teapot.indexBuffer = gl.createBuffer();

        readOBJFile('teapot.obj', gl, teapot, 1.0, true);
        return model;
    }

    var programFloor = initShaders(gl, "vertex-shader-floor", "fragment-shader-floor");    
    gl.useProgram(programFloor); 

    var floor = initialiseFloor();
    function initialiseFloor() {

        programFloor.position = gl.getAttribLocation(programFloor, "a_Position");
        programFloor.tex = gl.getAttribLocation(programFloor, "a_TexCoord");
        var base = [
            vec3(-2.0, -1.0, -1.0), 
            vec3(-2.0, -1.0, -5.0), 
            vec3(2.0, -1.0, -1.0), 
            vec3(2.0, -1.0, -5.0)
        ];    
        var pointsArray = [base[2], base[0], base[1], base[1], base[3], base[2]];
        var texCoord = [
            vec2(-1.0, 1.0), 
            vec2(-1.0, -1.0), 
            vec2(1.0, 1.0), 
            vec2(1.0, -1.0)
        ]; 
        var texArray = [texCoord[2], texCoord[0], texCoord[1], texCoord[1], texCoord[3], texCoord[2]];
        
        var floor = new Object();
        floor.vertexBuffer = createEmptyArrayBuffer(gl, programFloor.position, 3, gl.FLOAT);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        floor.texBuffer = createEmptyArrayBuffer(gl, programFloor.tex, 2, gl.FLOAT);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(texArray), gl.STATIC_DRAW);

        return floor;
    }


    var image = document.createElement('img');
    image.crossorigin = 'anonymous';
    image.onload = function () {
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.uniform1i(gl.getUniformLocation(programTeapot, "texMap"), 0);
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    image.src = 'xamp23.png';


    var directions=[
        vec3(0.0, 0.0, 0.0), //eye - pov coordinates
        vec3(0.0, 0.0, 0.0), //at - point towards eye witness
        vec3(0.0, 1.0, 0.0), //up - up direction
    ]  

    var fovy = 90.0; //angle in degrees
    var aspect = canvas.width / canvas.height;
    var near = 1.0;
    var far = 100.0;

    var angle = 0.0;
    var angleShadow = 0.0;
    var inMotion = true;
    var fromAbove = false;
    var lightOn = true;
    var center = vec3(0.0, 2.0, -2.0);
    var radius = 2;

    var indentityMatrix = mat4(); 
    indentityMatrix[3][3] = 0; 
    indentityMatrix[3][1] = 1/(-(center[1] -(-1))) + 0.00001;

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(programFloor);

        var perspectiveMatrixFloor = gl.getUniformLocation(programFloor, 'perspectiveMatrix');
        var perspFloor = perspective(fovy, aspect, near, far);

        if (fromAbove) {
            var perspFloorUp = lookAt(vec3(0.0, 1.0, -2.999999), vec3(0.0, 0.0, -3.0), vec3(0.0, 1.0, 0.0));
            perspFloor = mult(perspFloor, perspFloorUp);
        }
        gl.uniformMatrix4fv(perspectiveMatrixFloor, false, flatten(perspFloor));

        var viewMatrixFloor = gl.getUniformLocation(programFloor, 'viewMatrix');
        var lookAtDir = lookAt(directions[0], directions[1], directions[2]);
        gl.uniformMatrix4fv(viewMatrixFloor, gl.FALSE, flatten(lookAtDir));

        initialiseAttribute(gl, programFloor.position, floor.vertexBuffer, 3, gl.FLOAT);
        initialiseAttribute(gl, programFloor.tex, floor.texBuffer, 2, gl.FLOAT);

        gl.uniform1i(gl.getUniformLocation(programFloor, "texMap"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.useProgram(programTeapot);
        initialiseAttribute(gl, programTeapot.a_Position, teapot.vertexBuffer, 3, gl.FLOAT);
        initialiseAttribute(gl, programTeapot.a_Normal, teapot.normalBuffer, 3, gl.FLOAT);
        initialiseAttribute(gl, programTeapot.a_Color, teapot.colorBuffer, 4, gl.FLOAT);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapot.indexBuffer);

        var perspectiveMatrixTeapot = gl.getUniformLocation(programTeapot, 'perspectiveMatrix');
        var perspTeapot = perspective(fovy, aspect, near, far);
        if (fromAbove) {
            var perspTeapotUp = lookAt(vec3(0.0, 1.0, -2.999999), vec3(0.0, 0.0, -3.0), vec3(0.0, 1.0, 0.0));
            perspTeapot = mult(perspTeapot, perspTeapotUp);
        }

        gl.uniformMatrix4fv(perspectiveMatrixTeapot, gl.FALSE, flatten(perspTeapot));
        var viewMatrixTeapot = gl.getUniformLocation(programTeapot, 'viewMatrix');
       
        if (!modelInfo && objectInfo && objectInfo.isMTLComplete()) {
            modelInfo = onReadComplete(gl, teapot, objectInfo);
        }
        if (modelInfo){
            if (inMotion) {
                angle += 0.01;
            }
            var multTeapot = mult(translate(0, -1.0 + Math.abs((Math.sin(angle) / 2)), -3), scalem(0.25, 0.25, 0.25));

            if (lightOn) {
                angleShadow += 0.01;
            }

            var posTrans = translate(center[0] + (radius * Math.sin(angle)), center[1], center[2] + (radius * Math.cos(angle)));
            var negTrans = translate(-center[0] + (radius * Math.sin(angle)), -center[1], -center[2] + (radius * Math.cos(angle)));
            var multTeapotFinal = mult(mult(mult(posTrans, indentityMatrix), negTrans), multTeapot);

            gl.uniform1f(gl.getUniformLocation(programTeapot, "visibility"), 0);
            gl.uniformMatrix4fv(viewMatrixTeapot, false, flatten(multTeapotFinal));
            gl.depthFunc(gl.GREATER);
            gl.drawElements(gl.TRIANGLES, modelInfo.indices.length, gl.UNSIGNED_SHORT, 0);

            gl.uniformMatrix4fv(viewMatrixTeapot, false, flatten(multTeapot));
            gl.uniform1f(gl.getUniformLocation(programTeapot, "visibility"), 1);
            gl.depthFunc(gl.LESS);
            gl.drawElements(gl.TRIANGLES, modelInfo.indices.length, gl.UNSIGNED_SHORT, 0);
        }
        window.requestAnimFrame(render);
    }

    render();
    moveButton.addEventListener("click", function () {
        inMotion = (inMotion) ? false : true;
    });

    aboveButton.addEventListener("click", function () {
        fromAbove = (fromAbove) ? false : true;
    });

    lightButton.addEventListener("click", function () {
        lightOn = (lightOn) ? false : true;
    });

}
var objectInfo = null; 
var modelInfo = null; 

function initialiseAttribute(gl, attribute, buffer, num, type) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(attribute);
}

function createEmptyArrayBuffer(gl, a_attribute, num, type) {

    var buffer = gl.createBuffer(); 

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute); 

    return buffer;
}

function onReadComplete(gl, model, objDoc) {
    var drawingInfo = objDoc.getDrawingInfo();

    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

    return drawingInfo;
}

function readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status !== 404) {
            onReadOBJFile1(request.responseText, fileName, scale, reverse);
        }
    }
    request.open('GET', fileName, true); 
    request.send(); 
}

function onReadOBJFile1(fileString, fileName, scale, reverse) {
    var objDoc = new OBJDoc(fileName); // Create a OBJDoc object
    var result = objDoc.parse(fileString, scale, reverse);
    if (!result) {
        objectInfo = null; modelInfo = null;
        return;
    }
    objectInfo = objDoc;
}
