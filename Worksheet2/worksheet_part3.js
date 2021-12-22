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
        
    var max_verts = 1000;
    var numDrawnFigures = 0; 
    var pointIndices = [];
    var triangleIndices = [];

    //creating the buffer for the drawn points
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec2'], gl.STATIC_DRAW);

            
    var vPosition = gl.getAttribLocation( program, "a_Position");     
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);   
    gl.enableVertexAttribArray(vPosition);

    var defaultColor = colors[0];

    //creating the buffer for colors
    var cBuffer = gl.createBuffer();   
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);   
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec4'], gl.STATIC_DRAW);
                
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
        
        window.requestAnimFrame(drawShapes, canvas);
    }
    drawShapes();

    //clear canvas with colors
    var clearMenu = document.getElementById("clearMenu");
    var clearCanvasButton = document.getElementById("canvas-clear-button");
    clearCanvasButton.addEventListener("click", function(){
        numDrawnFigures = 0;
        pointIndices=[];
        triangleIndices = [];
        var bgcolor = colors[clearMenu.selectedIndex];
        gl.clearColor(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
        //gl.clear(gl.COLOR_BUFFER_BIT);
    })


    //choose the points colors
    var colorMenu = document.getElementById("colorMenu");
    colorMenu.addEventListener("click", function(){
        defaultColor = colors[colorMenu.selectedIndex];
    })

    var drawingMode = 1;
    var currentTrianglePoints = 0;

    pointsMode.addEventListener("click", function(){
        drawingMode = 1;
    })

    triangleMode.addEventListener("click", function(){
        drawingMode = 2;
    })


    //add event listener to mouse click
    canvas.addEventListener("click", function (event) {

        var domThingy = event.target.getBoundingClientRect() ;

        var newPoint = vec2(-1 + 2 * (event.clientX - domThingy.left)/canvas.width,
                    -1 + 2*(canvas.height - event.clientY + domThingy.top-1)/canvas.height);

        if(drawingMode === 1){ //points mode
            pointIndices.push(numDrawnFigures);
        }
        else if(drawingMode === 2){ //triangle mode
            if(currentTrianglePoints <2){
                currentTrianglePoints++;
                pointIndices.push(numDrawnFigures);
            }
            else{
                currentTrianglePoints=0;
                triangleIndices.push(numDrawnFigures);
                pointIndices.pop();
                pointIndices.pop();
            }
        }
                    
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, numDrawnFigures*sizeof['vec2'], flatten(newPoint));

        
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, numDrawnFigures*sizeof['vec4'], flatten(defaultColor));
        
        numDrawnFigures++;
        numDrawnFigures %= max_verts;
        
    });
     
}