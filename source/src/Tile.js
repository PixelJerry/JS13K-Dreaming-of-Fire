var tileTypes = {
    none: 0,
    river: 11
};

var Tile = function(radius, centerX, centerY, type) {
    this.visualHexagon = new Hexagon(radius, centerX, centerY);
    this.mapIndex = new Point(0, 0);
    this.districtIndex = null;
    this.population = 0;
    this.destruction = 0;

    this.mouseOver = false;
    this.visible = true;
    this.animating = false;

    this.burning = false;
    this.fireSpread = false;
    this.charred = false;
    this.startedBurning = null;

    this.type = tileTypes.none;
    if (typeof tileTypes[type] !== "undefined")
    {
        this.type = tileTypes[type];
    }

    this.district = null;

    this.maxFuel = 0;
    this.fuel = 0;
    this.fireStrength = 0;
    this.spreadResistance = 0;
    this.burnTime = 0; // time in ms

    this.baseColour = GameMap.emptyColour;

    this.setStroke("rgb(0,0,0)", 0.5);
    this.setFill("rgb(128,128,128)");

    // NEW
    this.fireAnimTimer = null;
    this.animTime = 250;

    this.setupTile();
};

Tile.prototype = {
    setupTile: function() {
        if (this.type === tileTypes.none)
        {
            this.maxFuel = 60;
            this.fuel = this.maxFuel;
            this.spreadResistance = 0.5;
            this.burnTime = 1000;
        }
        else if (this.type === tileTypes.river)
        {
            this.maxFuel = 0;
            this.fuel = this.maxFuel;
            this.spreadResistance = 1;
            this.burnTime = 0;
        }
    },
    setMapIndex: function(xIndex, yIndex) {
        this.mapIndex.x = xIndex;
        this.mapIndex.y = yIndex;
    },
    burn: function() {
        if (this.burning && !this.charred)
        {
            this.animateFire();
        }
        if (this.burnTime < GameMap.timePerHour && MainGame.timeNow() - this.startedBurning >= this.burnTime)
        {
            this.fireStrength += Fire.strenghtIncrease;
        }
        else if (MainGame.timeNow() - this.startedBurning >= this.burnTime)
        {
            this.fireStrength += Fire.strenghtIncrease;
        }
        if (this.fireStrength > Fire.maxiumStrength)
        {
            this.fireStrength = Fire.maxiumStrength;
        }

        if (MainGame.timeNow() - this.startedBurning >= this.burnTime)
        {
            if (this.calculateEffectiveFuel() > 0)
            {
                this.fuel--;
                this.updateDestruction();
                this.startedBurning = MainGame.timeNow();
            }
        }
    },
    animateFire: function()
    {
        if (this.fireAnimTimer === null || MainGame.timeNow() - this.fireAnimTimer > this.animTime)
        {
            this.fireAnimTimer = MainGame.timeNow();
            var randTest = randomRange(0,1);
            var col = Fire.fireColour;
            if (randTest < 0.3333)
            {
                col = Fire.fireHighlight;
            }
            else if (randTest < 0.6666)
            {
                col = Fire.fireDarkColour;
            }

            Motion.fadeTileColourTo(this, col, this.animTime);

            this.animTime = Math.round(randomRange(300, 450));
        }
    },
    calculateEffectiveFuel: function()
    {
        return this.fuel - (this.maxFuel * GameMap.districts[this.districtIndex].getFuelModifier());
    },
    draw: function(canvasID) {
        if (!this.visible)
        {
            return;
        }

        this.visualHexagon.draw(canvasID);
    },
    killPeople: function()
    {
        GameMap.districts[this.districtIndex].population -= this.population;
        this.population = 0;
        GameMap.countPopulation();
        UI.displayAreaInfo();
    },
    updateDestruction: function()
    {
        this.destruction++;
        GameMap.districts[this.districtIndex].destruction++;
        GameMap.destruction++;
        UI.displayAreaInfo();
    },
    calculateDimentions: function() {
        this.visualHexagon.calculateDimentions();
    },
    setDistrictIndex: function(indexNumber)
    {
        this.districtIndex = indexNumber;
    },
    setStroke: function(colour, lineWidth) {
        this.visualHexagon.setStroke(colour, lineWidth);
    },
    setFill: function(colour) {
        this.visualHexagon.setFill(colour);
    },
    setRadius: function(newRadius) {
        this.visualHexagon.setRadius(newRadius);
    },
    setCenter: function(newX, newY) {
        this.visualHexagon.setCenter(newX, newY);
    },
    setCenterFromPoint: function(newPoint) {
        this.visualHexagon.setCenterFromPoint(newPoint);
    },
    setType: function(newType) {
        if (typeof tileTypes[newType] !== "undefined")
        {
            this.type = tileTypes[newType];
            this.setupTile();
        }
    },
    setBaseColour: function(newColour) {
        this.baseColour = newColour;
    },
    getFill: function() {
        return this.visualHexagon.getFill();
    },
    getTotalFireResistance: function()
    {
        return this.fireResistance + Fire.naturalResistance + GameMap.districts[this.districtIndex].fireResistance;
    },
    getHeight: function() {
        return this.visualHexagon.getHeight();
    },
    getWidth: function() {
        return this.visualHexagon.getWidth();
    }
};