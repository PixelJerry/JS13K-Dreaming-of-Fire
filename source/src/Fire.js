var Fire = {
    fireColour: "rgb(255,158,62)", //"rgb(255,176,22)",
    fireHighlight: "rgb(255,202,108)",
    fireDarkColour:"rgb(249,79,33)",
    charredColour: "rgb(66,61,47)",
    maxiumStrength: 100,
    strenghtIncrease: 1,
    burnTime: 3000, // Time in mili-seconds
    spreadTime: 1000, // Time in mili-seconds

    uncontroledEventIn: false,
    uncontroledEventOut: false,
    
    setOnFire: function(tile){
        if (tile === null || tile.burning || tile.charred || !tile.visible || tile.type === tileTypes.river)
        {
            console.log ("Can not set that tile on fire");
            return;
        }
        
        Motion.fadeTileColourTo(tile, this.fireColour, 250);
        tile.burning = true;
        tile.startedBurning = MainGame.timeNow();

        tile.killPeople();
        GameMap.districts[tile.districtIndex].newFireStarted();
    },
    tryToSetOnFire: function(currentTile, tileToBurn){
        if (tileToBurn === null || tileToBurn.burning || tileToBurn.charred || !tileToBurn.visible || tileToBurn.type === tileTypes.river)
        {
            return;
        }

        var testResistance = tileToBurn.spreadResistance - FireTech.tileSpreadMod - (GameMap.destroyedDistricts * FireTech.globalSpreadResistanceMod);
        if (currentTile.districtIndex !== tileToBurn.districtIndex)
        {
            testResistance = GameMap.districtSpreadResistance - FireTech.districtSpreadMod - (GameMap.destroyedDistricts * FireTech.globalSpreadResistanceMod);
        }

        if (currentTile.fireStrength > testResistance * this.maxiumStrength && tileToBurn.calculateEffectiveFuel() > 0)
        {
            this.setOnFire(tileToBurn);
            if (!this.uncontroledEventIn)
            {
                UI.displayEvent("The fire has started spreading", "uncontrollably through the city");
                this.uncontroledEventIn = true;
            }
        }
    },
    burn: function(tile, arrayIndexs){
        tile.burn();

        this.spreadFire(tile, arrayIndexs);

        if (MainGame.timeNow() - tile.startedBurning >= tile.burnTime && !tile.charred)
        {
            this.fireBurnt(tile);
        }
    },
    spreadFire: function(currentTile, spreadFromArrayIndexs){
        var tilePos = null;
        var testDirection = Math.round(randomRange(0, 5));
        var directionMain = [];
        var directionSecondary = [];
        var testedValues = [false, false, false, false, false, false];

        directionMain = ["moveUp", "moveRight", "moveRight", "moveDown", "moveLeft", "moveLeft"];
        directionSecondary = ["", "up", "down", "", "down", "up"];

        for (var i = 0; i < 6; i++)
        {
            tilePos = Navigation[directionMain[testDirection]](spreadFromArrayIndexs, directionSecondary[testDirection]);
            this.spreadFireTo(currentTile, tilePos);

            testedValues[testDirection] = true;
            // finish random direction next
            
            do{
                testDirection = Math.round(randomRange(0, 5));
            }while(!testedValues[testDirection]);
        }
    },
    spreadFireTo: function(spreadFromTile, spreadToArrayIndex)
    {
        if (GameMap.validArrayIndex(spreadToArrayIndex.x, spreadToArrayIndex.y))
        {
            this.tryToSetOnFire(spreadFromTile, GameMap.tiles[spreadToArrayIndex.x][spreadToArrayIndex.y]);
        }
    },
    fireBurnt: function(tile){
        tile.charred = true;
        tile.burning = false;
        if (tile.mouseOver)
        {
            Motion.fadeTileColourTo(tile, GameMap.hoverColour, 500);
        }
        else
        {
            Motion.fadeTileColourTo(tile, this.charredColour, 500);
        }
    }
};