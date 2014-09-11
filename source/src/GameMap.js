var GameMap = {
    radius: 8,
    mapEdgeLength: 13,
    gridCenter: new Point(250, 275),
    mapWidth: 0,
    mapHeight: 0,
    tiles: [],
    numberOfTiles: 0,
    districts: [],
    numberOfDistricts: 0,
    destroyedDistricts: 0,
    riverTiles: [],
    numberOfRiverTiles: 0,
    riverAnimationCounter: 0,
    singleSelection: true,
    safeZone: 0,
    
    timePerHour: 2000, //2 real life seconds per 1 in game hour
    startingPopulation: 0,
    population: 0,
    destruction: 0,
    numberOfFollowers: {clerics: 0, zealots: 0},
    districtSpreadResistance: 0.5,

    indexOfFirstBottomDistrict: null,

    emptyColour: "rgb(0,222,50)",
    backgroundColour: "rgb(27,27,27)",
    hoverColour: "rgb(194,255,201)",
    selectedColour: "rgb(125,192,255)",
    hoverSelectedColour: "rgb(174,241,255)",

    riverColour: "rgb(50,50,255)", // Dark blue
    riverColourHighlight: "rgb(80,80,255)", // Lighter blue
    industrialColour: "rgb(200,210,50)", // yellow
    commercialColour: "rgb(150,50,220)", // Purple
    residentialColour: "rgb(205,50,50)", // Red

    initHexaGrid: function(){
        HexagonalGridSystem.setRadius(this.radius);

        this.calculateMapDimentions();
    },
    buildMap: function(radius, mapEdgeLenght){
        this.setRadius(radius);
        this.setMapEdgeLenght(mapEdgeLenght);

        this.initHexaGrid();

        this.createGrid();
    },
    initialPopulation: function(){
        this.population = 0;
        for (var district in this.districts)
        {
            this.districts[district].initialPopulation();
            this.population += this.districts[district].population;
        }
        
        this.startingPopulation = this.population;
    },
    countPopulation: function(){
        this.population = 0;
        for (var index in this.districts)
        {
            this.population += this.districts[index].population;
        }
    },
    countFollowers: function()
    {
        this.numberOfFollowers = {clerics: 0, zealots: 0};

        for (var index in this.districts)
        {
            this.districts[index].countFollowers();
            this.numberOfFollowers.clerics += this.districts[index].numberOfFollowers.clerics;
            this.numberOfFollowers.zealots += this.districts[index].numberOfFollowers.zealots;
        }

        UI.displayAreaInfo();
    },
    tryToSpawn: function()
    {
        // Try to spawn new followers in each district
        for (var index in this.districts)
        {
            this.districts[index].tryToSpawnFollowers();
        }
    },
    tryToSetOnFire: function()
    {
        // Try to start a new fire in each district
        for (var index in this.districts)
        {
            this.districts[index].tryToStartFire();
        }
    },
    setTileSize: function(newRadius){
        this.radius = newRadius;
    },
    setMapSize: function(newLenght){
        this.mapEdgeLength = newLenght;
    },
    createGrid: function(){
        this.initHexaGrid();

        var testNumber = (this.mapEdgeLength * -1) + 1;
        for (var i = testNumber; i < this.mapEdgeLength; i++)
        {
            for (var j = testNumber; j < this.mapEdgeLength; j++)
            {
                if (this.validGridPosition(i, j))
                {
                    this.addTile(i, j);
                }
            }
        }
    },
    calculateMapDimentions: function(){
        var hexWidth = HexagonalGridSystem.calculateHexagonWidth(this.radius);
        var hexHeight = HexagonalGridSystem.calculateHexagonHeight(this.radius);
        var numTilesAccross = (this.mapEdgeLength * 2) - 1;

        this.mapWidth = numTilesAccross * (hexWidth * (3 / 4));
        this.mapHeight = numTilesAccross * hexHeight;
    },
    addTile: function(gridX, gridY){
        if (!this.validGridPosition(gridX, gridY))
        {
            return;
        }

        var pixelPosition = HexagonalGridSystem.gridCoordToPixelCoord(new Point(gridX, gridY));
        pixelPosition = this.centerPointAdjustment(pixelPosition);

        if (typeof this.tiles[this.adjustIndex(gridX)] === "undefined")
        {
            this.tiles[this.adjustIndex(gridX)] = [];
        }
        this.tiles[this.adjustIndex(gridX)][this.adjustIndex(gridY)] = new Tile(this.radius, pixelPosition.x, pixelPosition.y, "none");
        this.tiles[this.adjustIndex(gridX)][this.adjustIndex(gridY)].setMapIndex(this.adjustIndex(gridX), this.adjustIndex(gridY));
        this.numberOfTiles++;
    },
    addDistrict: function(district){
        this.districts[this.numberOfDistricts] = district;
        this.numberOfDistricts++;
    },
    addRiverTile: function(tile){
        tile.setFill(this.riverColour);
        tile.setType("river");
        tile.setBaseColour(this.riverColour);
        this.riverTiles[this.numberOfRiverTiles] = tile;
        this.numberOfRiverTiles++;
    },
    animateRiver: function(){
        if (typeof this.riverTiles[0] === "undefined")
        {
            return;
        }

        if (this.riverAnimationCounter <= 0)
        {
            this.riverAnimationCounter = 5;

            var tileToAnimate = null;

            do{
                tileToAnimate = this.riverTiles[Math.round(randomRange(0, this.numberOfRiverTiles - 1))];
            }while(tileToAnimate.animating);

            if (tileToAnimate.getFill() === this.riverColour && !tileToAnimate.animating)
            {
                Motion.fadeTileColourTo(tileToAnimate, this.riverColourHighlight, 500);
            }
            else
            {
                Motion.fadeTileColourTo(tileToAnimate, this.riverColour, 500);
            }
        }

        this.riverAnimationCounter--;
    },
    calculateIndexAdjustment: function(){
        return this.mapEdgeLength - 1;
    },
    adjustIndex: function(indexToAdjust){
        return indexToAdjust + this.calculateIndexAdjustment();
    },
    centerPointAdjustment: function(inputPixelCoords){
        return new Point(inputPixelCoords.x + this.gridCenter.x, inputPixelCoords.y + this.gridCenter.y);
    },
    validGridPosition: function(gridX, gridY){
        if (gridX >= this.mapEdgeLength || gridY >= this.mapEdgeLength)
        {
            //console.log("INVALID GRID POSITION PROVIDED. --Outside top range--");
            return false;
        }
        else if (gridX <= (this.mapEdgeLength * -1) || gridY <= (this.mapEdgeLength * -1))
        {
            //console.log("INVALID GRID POSITION PROVIDED.--Outside bottom range--");
            return false;
        }
        else if (gridX + gridY >= this.mapEdgeLength || gridX + gridY <= this.mapEdgeLength * -1)
        {
            //console.log("INVALID GRID POSITION PROVIDED.--Outside hexagon shape--");
            return false;
        }
        else if (!this.gridPositionWithinBounds(gridX, gridY))
        {
            // Always add within canvas space.
            //console.log("INVALID GRID POSITION PROVIDED.--Outside canvas safe area--");
            return false;
        }
        else
        {
            return true;
        }
    },
    gridPositionWithinBounds: function(gridX, gridY){
        var topBound = this.safeZone + (this.radius) + 100;
        var leftBound = this.safeZone + (this.radius);
        var bottomBound = 450 - this.safeZone  - (this.radius);
        var rightBound = 500 - this.safeZone  - (this.radius);

        var pixelPoint = HexagonalGridSystem.gridCoordToPixelCoord(new Point(gridX, gridY), this.gridCenter);

        if (pixelPoint.y < topBound || pixelPoint.y > bottomBound)// outside top or bottom
        {
            return false;
        }
        else if (pixelPoint.x < leftBound || pixelPoint.x > rightBound)// outside left or right
        {
            return false;
        }

        return true;
    },
    validArrayIndex: function(indexX, indexY){
        return typeof this.tiles[indexX] !== "undefined" && typeof this.tiles[indexX][indexY] !== "undefined";
    },
    drawMainBackground: function(){
        // Make sure the layer is empty
        document.getElementById("mainBackground").width = 500;
        var ctx = document.getElementById("mainBackground").getContext("2d");
        // Add the radial background
        var radialGradiant = ctx.createRadialGradient(250, 280, 150, 250, 280, 450);
        radialGradiant.addColorStop(0,"rgb(63,28,51)");
        radialGradiant.addColorStop(1,"rgb(2,1,8)");
        ctx.fillStyle = radialGradiant;
        ctx.fillRect(0,0,500,560);

        // Add the first layer, just to create an outline arround the map
        for (var xIndex in this.tiles)
        {
            for (var yIndex in this.tiles[xIndex])
            {
                this.tiles[xIndex][yIndex].setStroke("rgb(183,134,170)",7.5);
                this.tiles[xIndex][yIndex].draw("mainBackground");
            }
        }

        // Add the actual map to the background layer
        for (var xIndex in this.tiles)
        {
            for (var yIndex in this.tiles[xIndex])
            {
                this.tiles[xIndex][yIndex].setStroke("rgb(0,0,0)",0.5);
                this.tiles[xIndex][yIndex].draw("mainBackground");
            }
        }
    },
    drawBackground: function(canvasID){
        var colourHolder = null;

        // draw the districts only
        for (var distIndex in this.districts)
        {
            for (var tileIndex in this.districts[distIndex].tiles)
            {
                if (this.districts[distIndex].tiles[tileIndex].burning)
                {
                    colourHolder = this.getColourForBackground(distIndex, tileIndex);
                    this.districts[distIndex].tiles[tileIndex].setFill(Fire.fireColour);
                }
                else if (this.districts[distIndex].tiles[tileIndex].charred)
                {
                    colourHolder = this.getColourForBackground(distIndex, tileIndex);
                    this.districts[distIndex].tiles[tileIndex].setFill(Fire.charredColour);
                }
                else
                {
                    colourHolder = this.getColourForBackground(distIndex, tileIndex);
                    this.districts[distIndex].tiles[tileIndex].setFill(this.districts[distIndex].tiles[tileIndex].baseColour);
                }

                this.districts[distIndex].tiles[tileIndex].draw(canvasID);

                if (colourHolder !== null)
                {
                    this.districts[distIndex].tiles[tileIndex].setFill(colourHolder);
                }
            }
        }
    },
    getColourForBackground: function(districtIndex, tileIndex){
        if (this.districts[districtIndex].tiles[tileIndex].selected || this.districts[districtIndex].tiles[tileIndex].mouseOver)
        {
            return this.districts[districtIndex].tiles[tileIndex].getFill();
        }
        else
        {
            return null;
        }
    },
    setBaseHexagonColour: function(colour){
        for (var xIndex in this.tiles)
        {
            for (var yIndex in this.tiles[xIndex])
            {
                this.tiles[xIndex][yIndex].setFill(colour);
            }
        }
    },
    drawActiveHexagons: function(canvasID){
        // Only render needed hexagons
        for (var xIndex in GameMap.tiles)
        {
            for (var yIndex in GameMap.tiles[xIndex])
            {
                if (this.tiles[xIndex][yIndex].mouseOver || this.tiles[xIndex][yIndex].animating || this.tiles[xIndex][yIndex].type === tileTypes.river)
                {
                    this.tiles[xIndex][yIndex].draw(canvasID);
                }
            }
        }
    },
    setRadius: function(newRadius){
        this.radius = newRadius;
    },
    setMapEdgeLenght: function(newLength){
        this.mapEdgeLength = newLength;
    },
    setSafeZone: function(newSafeZone){
        this.safeZone = newSafeZone;
    },
    getGridCenter: function(){
        return this.gridCenter;
    },
    findTileAtGridIndex: function(gridIndex){
        if (this.validGridPosition(gridIndex.x, gridIndex.y))
        {
            return this.tiles[this.adjustIndex(gridIndex.x)][this.adjustIndex(gridIndex.y)];
        }
        else
        {
            return null;
        }
    },
    setMouseOverState: function(currentTileGridIndex){
        if (!Input.mouseOver)
        {
            for (var index in this.districts)
            {
                this.districts[index].onMouseOff();
            }
        }

        var currentTileArrayIndex = new Point(this.adjustIndex(currentTileGridIndex.x), this.adjustIndex(currentTileGridIndex.y));

        for (var index in this.districts)
        {
            if (this.districts[index].mouseOver && this.tiles[currentTileArrayIndex.x][currentTileArrayIndex.y].districtIndex !== parseInt(index))
            {
                this.districts[index].onMouseOff();
            }
        }
    },
    clearMap: function(){
        this.tiles = [];
        this.numberOfTiles = 0;
        this.districts = [];
        this.numberOfDistricts = 0;
        this.destroyedDistricts = 0;
        this.riverTiles = [];
        this.numberOfRiverTiles = 0;
        this.riverAnimationCounter = 0;
        this.safeZone = 0;

        this.startingPopulation = 0;
        this.population = 0;
        this.destruction = 0;
        this.numberOfFollowers = {clerics: 0, zealots: 0};

        indexOfFirstBottomDistrict = null;
    }
};