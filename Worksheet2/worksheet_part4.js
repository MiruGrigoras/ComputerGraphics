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
    
    var colors = [
        vec4(0.0, 0.0, 0.0, 1.0), //black
        vec4(1.0, 0.0, 0.0, 1.0), //red
        vec4(1.0, 1.0, 0.0, 1.0), //yellow
        vec4(0.0, 1.0, 0.0, 1.0), //green
        vec4(0.0, 0.0, 1.0, 1.0), //blue
        vec4(1.0, 0.0, 1.0, 1.0), //magenta
        vec4(0.0, 1.0, 1.0, 1.0), //cyan
        vec4(0.3921, 0.5843, 0.9294, 1.0), //cornflower
    ]
        
    var maxVerts = 1000;
    var noCircleTriangles = 500;
    var indexButtons = 0; 
    var numPoints = 0;
    var pointIndices = [];
    var triangleIndices = [];
    var circleIndices = [];

    //creating the buffer for the drawn points
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVerts*sizeof['vec2'], gl.STATIC_DRAW);

            
    var vPosition = gl.getAttribLocation( program, "a_Position");     
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(vPosition);

    var defaultColor = colors[0];

    //creating the buffer for colors
    var cBuffer = gl.createBuffer();   
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);   
    gl.bufferData(gl.ARRAY_BUFFER, maxVerts*sizeof['vec4'], gl.STATIC_DRAW);
                
    var cPosition = gl.getAttribLocation( program, "a_Color");     
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(cPosition);

    
    function drawShapes(){
        gl.clear(gl.COLOR_BUFFER_BIT);
        var i;
        for (i = 0; i <= pointIndices.length-1; i++) {
            var index = pointIndices[i];
            gl.drawArrays(gl.POINTS, index, 1);
        }
        for (i = 0; i <= triangleIndices.length-1; i++) {
            var index = triangleIndices[i];
            gl.drawArrays(gl.TRIANGLES, index - 2, 3);
        }
        for (i = 0; i <= circleIndices.length-1; i++) {
            var index = circleIndices[i];
            gl.drawArrays(gl.TRIANGLE_FAN, index - 1, noCircleTriangles + 2);
        }
        window.requestAnimFrame(drawShapes, canvas);
    }
    drawShapes();

    //clear canvas with colors
    var clearMenu = document.getElementById("clearMenu");
    var clearCanvasButton = document.getElementById("canvas-clear-button");
    clearCanvasButton.addEventListener("click", function(){
        indexButtons = 0;
        numPoints = 0;
        pointIndices=[];
        triangleIndices = [];
        circleIndices=[];
        var bgcolor = colors[clearMenu.selectedIndex];
        gl.clearColor(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
    });


    //choose the points colors
    var colorMenu = document.getElementById("colorMenu");
    colorMenu.addEventListener("click", function(){
        defaultColor = colors[colorMenu.selectedIndex];
    });

    var drawingMode = 1;

    pointsMode.addEventListener("click", function(){
        drawingMode = 1;
    });

    triangleMode.addEventListener("click", function(){
        drawingMode = 2;
    });

    circleMode.addEventListener("click", function(){
        drawingMode = 3;
    });


    function calculateRadius(circleCenter, newPoint){
        var x = Math.pow(circleCenter[0] - newPoint[0], 2);
        var y = Math.pow(circleCenter[1] - newPoint[1], 2);
        return Math.sqrt(x+y);
    }

    var currentTrianglePoints = 0;
    var currentCirclePoints = 0;
    var circleCenter = vec2(0.0, 0.0);

    //add event listener to mouse click
    canvas.addEventListener("click", function (event) {

        var domThingy = event.target.getBoundingClientRect() ;

        var newPoint = vec2(-1 + 2 * (event.clientX - domThingy.left)/canvas.width,
                    -1 + 2*(canvas.height - event.clientY + domThingy.top-1)/canvas.height);

        if(drawingMode === 1){ //points mode
            pointIndices.push(indexButtons);
        }
        else if(drawingMode === 2){ //triangle mode
            if(currentTrianglePoints < 2){
                currentTrianglePoints++;
                pointIndices.push(indexButtons);
            }
            else{
                currentTrianglePoints = 0;
                pointIndices.pop();
                pointIndices.pop();
                triangleIndices.push(indexButtons);
            }
        }
        else if(drawingMode === 3){ //circle mode
            if(currentCirclePoints === 0){
                currentCirclePoints++;
                circleCenter = newPoint;
                pointIndices.push(indexButtons);
            }
            else{
                currentCirclePoints = 0;
                pointIndices.pop();
                circleIndices.push(indexButtons);
                var newRadius = calculateRadius(circleCenter, newPoint);
                for(var i = 0; i <= noCircleTriangles; i++){
                    var newAngle = (2*Math.PI) / noCircleTriangles * (i+1);

                    var newX = circleCenter[0] + Math.cos(newAngle) * newRadius;
                    var newY = circleCenter[1] + Math.sin(newAngle) * newRadius;
                    var newCirclePoint = vec2(newX, newY);
                    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, indexButtons * sizeof['vec2'], flatten(newCirclePoint));

                    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, indexButtons * sizeof['vec4'], flatten(defaultColor));
                    indexButtons++;
                }
            }
        } 
                    
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, indexButtons*sizeof['vec2'], flatten(newPoint));

        
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, indexButtons*sizeof['vec4'], flatten(defaultColor));
        
        numPoints = Math.max(numPoints, ++indexButtons); 
        indexButtons %= maxVerts;
        console.log(pointIndices);
        console.log(triangleIndices);
        console.log(circleIndices);
    });
     
}