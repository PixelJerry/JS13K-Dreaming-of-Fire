// http://www.redblobgames.com/grids/hexagons/
var Hexagon = function(radius, centerX, centerY)
{
    this.SIDES = 6;

    this.radius = radius;
    this.center = new Point(centerX, centerY);
    this.mouseOver = false;
    this.selected = false;
    this.visible = true;

    this.width = this.radius * 2;
    this.height = (Math.sqrt(3) / 2) * this.width;

    this.strokeColour = "rgb(0,0,0)";
    this.fillColour = "rgb(128,128,128)";
    this.strokeWidth = 0.5;
};

Hexagon.prototype = {
    draw: function(canvasID)
    {
        if (!this.visible)
        {
            return;
        }

        var ctx = document.getElementById(canvasID).getContext("2d");

        ctx.beginPath();
        var angle = 2 * Math.PI / this.SIDES * 0;

        ctx.moveTo(this.center.x + this.radius * Math.cos(angle), this.center.y + this.radius * Math.sin(angle));

        for (var i = 1; i <= this.SIDES; i++)
        {
            angle = 2 * Math.PI / this.SIDES * i;
            ctx.lineTo(this.center.x + this.radius * Math.cos(angle), this.center.y + this.radius * Math.sin(angle));
        }

        ctx.strokeStyle = this.strokeColour;
        ctx.fillStyle = this.fillColour;
        ctx.lineWidth = this.strokeWidth;

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    },
    setStroke: function(colour, lineWidth)
    {
        this.strokeColour = colour;
        this.strokeWidth = lineWidth;
    },
    setFill: function(colour)
    {
        this.fillColour = colour;
    },
    setRadius: function(newRadius) {
        this.radius = newRadius;
    },
    setCenter: function(newX, newY) {
        this.center.x = newX;
        this.center.y = newY;
    },
    setCenterFromPoint: function(newPoint) {
        this.setCenter(newPoint.x, newPoint.y);
    },
    getFill: function()
    {
        return this.fillColour;
    },
    calculateDimentions: function()
    {
        this.width = this.radius * 2;
        this.height = (Math.sqrt(3) / 2) * this.width;
    },
    getHeight: function()
    {
        return this.height;
    },
    getWidth: function()
    {
        return this.width;
    }
};