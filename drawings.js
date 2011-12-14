(function () {  

    var Mode = { drawing: 0, write: 1 };

    var ctx = document.getElementById("canvas").getContext("2d")
        ,canvas = document.getElementById("canvas")
        ,$cvs = $("#canvas")
        ,img
        ,top = $cvs.offset().top
        ,left = $cvs.offset().left
        ,draw = 0
        ,mode = Mode.drawing
        ,curFont = "Helvetica"
        ,curFontSz = "18px"
        ,ctrlPressed = false
        ,histCount = 1
        ,blankCanvas = true;


    var resizeCvs = function() {
        ctx.canvas.width = $(window).width();
        ctx.canvas.height = $(window).height();
        };
    
    var initializeCvs = function (clearing) {
        var mnu = $(".menu")[0];
        ctx.lineCap = "round";
        resizeCvs();
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();

        if (window.localStorage && !clearing) { 
            img = new Image();
            $(img).load(function () {
                ctx.drawImage(img, 0, 0);
            });
            if (localStorage.curImg) {
                img.src = localStorage.curImg;      
                blankCanvas = false;
            }
        }
        if (clearing) { storeHistory(); }
    };

    var storeHistory = function () {
        img = canvas.toDataURL("image/png");
        history.pushState({ imageData: img }, "i", window.location.href);
        histCount++;
        if (window.localStorage) { localStorage.curImg = img; }
    };

    var undoDraw = function () {
        window.history.back();
        histCount--;
    };

    var redoDraw = function () {
        window.history.forward();
        histCount++;
    };
    
    var backout = function () {
        window.history.go("-" + histCount); 
    };
/*
    $cvs.mousedown(function (e) {
        if (e.button === 0) {
            if (blankCanvas) {
                storeHistory();
                blankCanvas = false;
            }
            switch (mode) {
                case Mode.drawing:
                    draw = 1;
                    ctx.beginPath();
                    ctx.moveTo(e.pageX - left, e.pageY - top);
                    break;
                case Mode.write:
                    ctx.fillText(prompt('Text to Insert', ''), e.pageX - left, e.pageY - top);
                    storeHistory();
                    break;
            }
        }
        else{
            draw = 0;
        }
    })
    .mouseup(function (e) {
        if(e.button === 0){
            switch (mode) {
                case Mode.drawing:
                    draw = 0;
                    ctx.lineTo(e.pageX-left+1, e.pageY-top+1);
                    ctx.stroke();
                    ctx.closePath();
                    break;
                case Mode.write:
                    break;
                }
            storeHistory();
        }
        else {
            draw = 1;
        }
    })
    .mousemove(function (e) {
        if(draw === 1){
            switch (mode) {
                case Mode.drawing:
                    ctx.lineTo(e.pageX-left+1, e.pageY-top+1);
                    ctx.stroke();
                    break;
                case Mode.write:
                    break;
            }
        }
    });
    */
   $(document).ready(function() {
    // create a drawer which tracks touch movements
    var draw = {
        isDrawing: false,
        mousedown: function(coordinates) {
            if (blankCanvas) { storeHistory(); blankCanvas = false; }
            ctx.beginPath();
            ctx.moveTo(coordinates.x, coordinates.y);
            this.isDrawing = true;
        },
        mousemove: function(coordinates) {
            if (this.isDrawing) {
                ctx.lineTo(coordinates.x, coordinates.y);
                ctx.stroke();
            }
        },
        mouseup: function(coordinates) {
            this.isDrawing = false;
            ctx.lineTo(coordinates.x, coordinates.y);
            ctx.stroke();
            ctx.closePath();
            storeHistory();
        },
        touchstart: function(coordinates){
            if (blankCanvas) { storeHistory(); blankCanvas = false; }
            ctx.beginPath();
            ctx.moveTo(coordinates.x, coordinates.y);
            this.isDrawing = true;
        },
        touchmove: function(coordinates){
            if (this.isDrawing) {
                ctx.lineTo(coordinates.x, coordinates.y);
                ctx.stroke();
            }
        },
        touchend: function(coordinates){
            if (this.isDrawing) {
                this.touchmove(coordinates);
                this.isDrawing = false;
                storeHistory();
            }
        }
    };
    // create a function to pass touch events and coordinates to drawer
    function setupDraw(event){

        var coordinates = {};
        if (event.type.indexOf("touch") != -1 ){
            coordinates.x = event.targetTouches[0].pageX - left;
            coordinates.y = event.targetTouches[0].pageY - top;
        } else {
            coordinates.x = event.pageX - left;
            coordinates.y = event.pageY - top;
        }
             
        draw[event.type](coordinates);
    };

    window.addEventListener("mousedown", setupDraw, false);
    window.addEventListener("mousemove", setupDraw, false);
    window.addEventListener("mouseup", setupDraw, false);
    canvas.addEventListener('touchstart',setupDraw, false);
    canvas.addEventListener('touchmove',setupDraw, false);
    canvas.addEventListener('touchend',setupDraw, false); 

    document.body.addEventListener('touchmove',function(event){
      event.preventDefault();
    },false);
});
    $('#clear').click(function (e) {
        initializeCvs(true);
    });
    
    $('#undo').click(function (e) {
        e.preventDefault();
    undoDraw();
    });

    $("#redo").click(function (e) {
        e.preventDefault();
        redoDraw();                             
    });

    $("#backout").click(function (e) {
        e.preventDefault();
        backout();
    }); 
    
    $("#draw").click(function (e) {
        e.preventDefault();
        $("label[for='sizer']").text("Line Size:");
        mode = Mode.drawing;
    });
    
    $("#text").click(function (e) {
        e.preventDefault();
        $("label[for='sizer']").text("Font Size:");
        mode = Mode.write;
    });
    
    $("#colors li").click(function (e) { 
        e.preventDefault();
        $("label[for='sizer']").text("Line Size:");
        mode = Mode.drawing;
        ctx.strokeStyle = $(this).css("background-color");
    });
    
    $("#fonts li").click(function (e) {
        e.preventDefault();
        $("label[for='sizer']").text("Font Size:");
        mode = Mode.write;
        curFont = $(this).css("font-family");
        ctx.font = curFontSz + " " + curFont;
    });
    
    $("#sizer").change(function (e) {
        switch(mode) {
            case Mode.drawing:
                ctx.lineWidth = parseInt($(this).val(), 10);
                break;
            case Mode.write:
                curFontSz = parseInt($(this).val(), 10) + "px";
                ctx.font = curFontSz + " " + curFont;
                break;
        }
    });

    $(document).keyup(function (e) { 
        if(e.which === 17) {
            ctrlPressed = false;
        } 
    })
    .keydown(function (e) { 
        if(e.which === 17) {
             ctrlPressed = true; 
        }
        //ctrl + z
        if(e.which === 90 && ctrlPressed === true) {
            undoDraw(); 
        } 
        //ctrl + y
        if(e.which === 89 && ctrlPressed === true) {
            redoDraw(); 
        } 
    });

    initializeCvs();
    
    window.onpopstate = function (event) {
        if (event.state !== null) {
            img = new Image();
            $(img).load(function () {
                ctx.drawImage(img, 0, 0);
            });
            img.src = event.state.imageData;
        }
    };
    
    window.onresize = function() {
        resizeCvs();
        if (window.localStorage) {
            img = new Image();
            $(img).load(function () {
                ctx.drawImage(img, 0, 0);               
            });
            if (localStorage.curImg) {
                img.src = localStorage.curImg;      
            }
        }
    };
})();
