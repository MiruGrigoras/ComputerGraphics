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
    
    var pointsArray = [];
    var maxNumCurvePoints = 300;
    var numPointsCurve = 0;
    var numControlPoints = 3;

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, pointsArray.length);
        window.requestAnimFrame(render, canvas);
    }

    render();
    
    function factorial(x){
        var fact = 1;
        for(var i=1; i <= x; i++)
            fact = fact * i;
        return fact;
    }

    function getBezierCurve(pointsArray, numControlPoints){
        var curvePoints = [];
        for(var i=1; i <= maxNumCurvePoints; i++){
            var step = i / maxNumCurvePoints;
            var px = 0;
            var py = 0;
            for(var j=0; j < numControlPoints; j++){
                var binCoeff = factorial(numControlPoints-1) / (factorial(j) * factorial(numControlPoints - j - 1));
                px += pointsArray[pointsArray.length-1-j][0] 
                    * Math.pow(step, numControlPoints - j - 1) 
                    * Math.pow((1-step), j) 
                    * binCoeff;
                py += pointsArray[pointsArray.length-1-j][1] 
                    * Math.pow(step, numControlPoints - j - 1) 
                    * Math.pow((1-step), j) 
                    * binCoeff;
            }
            curvePoints.push(vec2(px, py));
        }
        return curvePoints;
    }

    canvas.addEventListener("click", function () {
        var domThingy = event.target.getBoundingClientRect() ;
        var newPoint = vec2(-1 + 2 * (event.clientX - domThingy.left)/canvas.width,
                    -1 + 2*(canvas.height - event.clientY + domThingy.top-1)/canvas.height);
        numPointsCurve++;
        pointsArray.push(newPoint);

        if (numPointsCurve == numControlPoints) {
            numPointsCurve = 0;
            var curve = getBezierCurve(pointsArray, numControlPoints);
            for (var i = 0; i < numControlPoints; i++)
                pointsArray.pop();
            curve.forEach(p => {
                pointsArray.push(p);
            });
        }

    });

    var clearCanvasButton = document.getElementById("canvas-clear-button");
    clearCanvasButton.addEventListener("click", function(){
        numPointsCurve = 0;
        pointsArray = [];
    });

    noControlPoints.addEventListener('change', function(){
        numControlPoints = this.value;
        numPointsCurve = 0;
        pointsArray = [];
    })
    
}