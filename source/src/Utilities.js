var requestAnimation = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;

function createCanvas(width, heigth, canvasID, elementID){
    console.log ("Creating a new canvas element named " + canvasID);
    var newCanvas = document.createElement('canvas');
    //Making sure the canvas will render ontop of other canvases
    newCanvas.style.position = "absolute";
    
    newCanvas.id     = canvasID;
    newCanvas.width  = width;
    newCanvas.height = heigth;
    newCanvas.style.top = "0px";

    if (typeof elementID !== 'undefined')
    {
        document.getElementById(elementID).appendChild(newCanvas);
    }
    else
    {
        document.body.appendChild(newCanvas);
    }
}

function deleteCanvas(canvasID){
    if (canvasID !== null && document.getElementById(canvasID) !== null) //Will be null on startup
    {
        console.log ("Deleting the " + canvasID + " canvas element.");
        document.getElementById(canvasID).parentNode.removeChild(document.getElementById(canvasID));
    }
}

function randomRange(min, max){
    return Math.random() * ( max - min ) + min;
}

function rgbStringToInt(rgbString) {
    var rgbInts = {r: 0, g: 0, b:0};

    rgbInts.r = parseInt(rgbString.substring(rgbString.indexOf("(") + 1, rgbString.indexOf(",")));
    rgbInts.g = parseInt(rgbString.substring(rgbString.indexOf(",") + 1, rgbString.lastIndexOf(",")));
    rgbInts.b = parseInt(rgbString.substring(rgbString.lastIndexOf(",") + 1, rgbString.lastIndexOf(")")));

    return rgbInts;
}

function rgbIntToString(rgbSet) {
    return "rgb(" + rgbSet.r + "," + rgbSet.g + "," + rgbSet.b +")";
}

function offsetColour(colourToOffset, rangeMin, rangeMax, randomChannel) {
    var colour = rgbStringToInt(colourToOffset);
    var offset1, offset2, offset3;

    if (randomChannel && typeof randomChannel !== "undefined")
    {
        offset1 = Math.round(randomRange(rangeMin, rangeMax));
        offset2 = Math.round(randomRange(rangeMin, rangeMax));
        offset3 = Math.round(randomRange(rangeMin, rangeMax));
    }
    else
    {
        offset1 = offset2 = offset3 = Math.round(randomRange(rangeMin, rangeMax));
    }

    colour.r += offset1;
    colour.g += offset2;
    colour.b += offset3;

    colour.r = keepWithinRange(colour.r, 0, 255);
    colour.g = keepWithinRange(colour.g, 0, 255);
    colour.b = keepWithinRange(colour.b, 0, 255);

    return rgbIntToString(colour);
}

function keepWithinRange(value, min, max)
{
    if (value < min)
    {
        value = min;
    }
    else if (value > max)
    {
        value = max;
    }

    return value;
}

var Point = function(pX, pY)
{
    if (typeof pX === "undefined")
    {
        this.x = null;
    }
    else
    {
        this.x = pX;
    }

    if (typeof pY === "undefined")
    {
        this.y = null;
    }
    else
    {
        this.y = pY;
    }
};

Point.prototype = {
    equals: function(otherPoint)
    {
        this.x = otherPoint.x;
        this.y = otherPoint.y;
    },
    set: function(pX, pY)
    {
        this.x = pX;
        this.y = pY;
    }
};