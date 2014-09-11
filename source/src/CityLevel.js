var CityLevel = {
    backgroundImage: null,
    timer1: null,
    redrawBuffer: 0,
    placedFirstFollower: false,
    followerTravelChance: 0.05,
    travelTimer: null,
    travelTestTime: 1000,

    firstFollowerMoved: false,
    firstFollowerOverRiver: false,

    endTimer: null,

    create: function() {
        console.log("Creating TestLevel");

        //Creating the ui
        UI.create();

        GameMap.setSafeZone(10);
        GameMap.buildMap(8, 23);
        console.log("Number of Tiles: " + GameMap.numberOfTiles);

        GameMap.setBaseHexagonColour(GameMap.emptyColour);
        document.getElementById("GameHere").style.backgroundColor = GameMap.backgroundColour;
        this.createBackgroundImage();
    },
    input: function() {
        if (!MainGame.gameOver)
        {
            if (!FireTech.show)
            {
                this.mouseOverMap(Input.mouseHexaGridPos);
            }
        }
    },
    update: function() {
        if (!MainGame.gameOver)
        {
            if (FireTech.show)
            {
                FireTech.update();
            }
            else
            {
                UI.updateCounter();
                GameMap.tryToSpawn();
                GameMap.tryToSetOnFire();
                this.followerTryToMove();

                FireTech.allocatePoints();

                this.checkVictory();
            }
        }
    },
    render: function() {
        FireTech.render();
        UI.render();
        GameMap.drawActiveHexagons(MainGame.currentState);

        var noneBurning = true;

        for (var xIndex in GameMap.tiles)
        {
            for (var yIndex in GameMap.tiles[xIndex])
            {
                if (GameMap.tiles[xIndex][yIndex].burning)
                {
                    noneBurning = false;
                    this.redrawBuffer = 2;
                }
            }
        }

        for (var xIndex in GameMap.tiles)
        {
            for (var yIndex in GameMap.tiles[xIndex])
            {
                if (GameMap.tiles[xIndex][yIndex].burning)
                {
                    if (MainGame.timeNow() - this.timer1 >= 250 || this.timer1 === null)
                    {
                        this.timer1 = MainGame.timeNow();
                        this.redrawBackground();
                    }
                }
                else if (noneBurning && this.redrawBuffer > 0 && MainGame.timeNow() - this.timer1 >= 250)
                {
                    console.log("After burn map draw");
                    this.timer1 = MainGame.timeNow();
                    this.redrawBackground();
                    this.redrawBuffer--;
                }
                if (GameMap.tiles[xIndex][yIndex].burning && !GameMap.tiles[xIndex][yIndex].charred)
                {
                    Fire.burn(GameMap.tiles[xIndex][yIndex], new Point(parseInt(xIndex), parseInt(yIndex)));
                }
            }
        }
        // show message on screen
        if (MainGame.gameOver)
        {
            var ctx = document.getElementById(MainGame.currentState).getContext("2d");
            var radialGradiant = ctx.createRadialGradient(250, 280, 10, 250, 280, 450);
            radialGradiant.addColorStop(0,"rgba(63,28,51,0.9)");
            radialGradiant.addColorStop(1,"rgba(2,1,8,0.9)");
            ctx.fillStyle = radialGradiant;
            ctx.fillRect(0,0,500,560);

            ctx.font = "bold 45pt Arial";
            ctx.textAlign="center";
            ctx.fillStyle = "rgb(255,194,197)";
            ctx.fillText("City Destroyed",250,100);

            ctx.font = "bold 30pt Arial";
            ctx.fillStyle = "rgb(185,215,238)";
            ctx.fillText("The city survived for",250,225);
            ctx.fillText(UI.days + " days and " + UI.hours + " hours",250,275);
            
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.font = "normal 15pt Arial";
            ctx.fillText("Press the Esc key to return to the main menu",250,450);
        }
    },
    deleteState: function() {
        this.backgroundImage = null;
        this.timer1 = null;
        this.redrawBuffer = 0;
        this.placedFirstFollower = false;

        this.firstFollowerMoved = false;

        GameMap.clearMap();

        FireTech.deleteMenu();

        UI.deleteUI();
    },
    onClick: function() {
        if (!MainGame.gameOver)
        {
            if (FireTech.show)
            {
                FireTech.onClick();
            }
            else
            {
                if (Input.mousePosition.x > 370 && Input.mousePosition.x < 490 &&
                    Input.mousePosition.y > 460 && Input.mousePosition.y < 550)
                {
                    UI.openTechTree();
                }
                
                this.placeFollower();
                this.redrawBackground();
            }
        }
    },
    createBackgroundImage: function()
    {
        GenerateMap.create();
        GameMap.initialPopulation();
        UI.displayAreaInfo();
        GameMap.drawMainBackground();
    },
    redrawBackground: function()
    {
        MainGame.clearBackground();
        GameMap.drawBackground("background");
    },
    tempRedraw: function()
    {
        MainGame.clearBackground();
        GameMap.drawMap("background");
    },
    drawBurningTiles: function(canvasID)
    {
        for (var xIndex in GameMap.tiles)
        {
            for (var yIndex in GameMap.tiles[xIndex])
            {
                if (GameMap.tiles[xIndex][yIndex].burning)
                {
                    GameMap.tiles[xIndex][yIndex].draw(canvasID);
                }
            }
        }
    },
    mouseOverMap: function(gridPosition) {
        if (Input.mouseOver)
        {
            var tempTile = GameMap.findTileAtGridIndex(gridPosition);

            if (tempTile === null)
            {
                return;
            }

            if (tempTile.districtIndex !== null)
            {
                GameMap.districts[tempTile.districtIndex].onMouseOver();
            }
            GameMap.setMouseOverState(gridPosition);
        }
        else
        {
            GameMap.setMouseOverState(gridPosition);
        }
    },
    placeFollower: function(){
        if (!this.placedFirstFollower)
        {
            // place a follower in the district that the mouse is over
            // look to see if the mouse if over a district
            var currentTile = GameMap.findTileAtGridIndex(Input.mouseHexaGridPos);
            if (currentTile !== null)
            {
                if (currentTile.type !== tileTypes.river && currentTile.visible)
                {
                    for (var district in GameMap.districts)
                    {
                        if (GameMap.districts[district].mouseOver)
                        {
                            console.log ("Placing the first follower cleric in " + GameMap.districts[district].name);
                            GameMap.districts[district].addFollower("cleric");
                            this.placedFirstFollower = true;
                            UI.displayEvent("A cleric of fire apeared in ", "the " + GameMap.districts[district].name);
                            Fire.setOnFire(GameMap.findTileAtGridIndex(Input.mouseHexaGridPos));
                        }
                    }
                }
            }
        }
    },
    followerTryToMove: function()
    {
        if (FireTech.canTravel)
        {
            if (this.travelTimer === null || MainGame.timeNow() - this.travelTimer > this.travelTestTime)
            {
                this.travelTimer = MainGame.timeNow();

                var randomTest = randomRange(0,1);
                if (FireTech.travleChance + (GameMap.destroyedDistricts * FireTech.travleChance) + FireTech.followerMoveMod > randomTest)
                {
                    randomTest = randomRange(0,1);
                    if (randomTest > 0.5)
                    {
                        this.moveFollower("cleric");
                    }
                    else
                    {
                        this.moveFollower("zealot");
                    }
                }
            }
        }
    },
    moveFollower: function(followerClass)
    {
        // look for a random district that has followers of the required type
        console.log ("Move follower...");

        // This code causes an infinate loop, fix it.
        if (GameMap.numberOfFollowers[followerClass + "s"] > 1)
        {
            console.log ("Found atleast one " + followerClass);
            var randomIndex = Math.round(randomRange(0, GameMap.numberOfDistricts - 1));
            // look for a district that has followers of this type
            var breakCounter = 0;
            while (GameMap.districts[randomIndex].numberOfFollowers[followerClass + "s"] <= 1)
            {
                console.log ("No followers in " + randomIndex);
                randomIndex = Math.round(randomRange(0, GameMap.numberOfDistricts - 1));
                breakCounter++;
                if (breakCounter > 30)
                {
                    return;
                }
            }

            // Find a district to move to based on the random index
            var moveToIndex = randomIndex;
            var fiftyFifty = 0;

            if (randomIndex === 0 || randomIndex === GameMap.indexOfFirstBottomDistrict)
            {
                // starting district of a section
                if (FireTech.canCrossRiver)
                {
                    fiftyFifty = randomRange(0, 1);
                }
                else
                {
                    fiftyFifty = 0;
                }
                if (fiftyFifty > 0.25) // Want a bigger chance of them crossing the river if they can.
                {
                    // cross river
                    if (randomIndex === 0 )
                    {
                        moveToIndex = GameMap.indexOfFirstBottomDistrict;
                    }
                    else
                    {
                        moveToIndex = 0;
                    }
                    if (!this.firstFollowerOverRiver)
                    {
                        UI.displayEvent("A " + followerClass + " has crossed the river!");
                        this.firstFollowerOverRiver = true;
                    }
                }
                else
                {
                    // move right
                    moveToIndex++;
                }
            }
            else if (randomIndex === GameMap.indexOfFirstBottomDistrict - 1 || 
                     randomIndex === GameMap.numberOfDistricts - 1)
            {
                // End district of a section
                if (FireTech.canCrossRiver)
                {
                    fiftyFifty = randomRange(0, 1);
                }
                else
                {
                    fiftyFifty = 0;
                }
                if (fiftyFifty > 0.25) // Want a bigger chance of them crossing the river if they can.
                {
                    // cross river
                    if (randomIndex === GameMap.indexOfFirstBottomDistrict - 1)
                    {
                        moveToIndex = GameMap.numberOfDistricts - 1;
                    }
                    else
                    {
                        moveToIndex = GameMap.indexOfFirstBottomDistrict - 1;
                    }
                }
                else
                {
                    // move left
                    moveToIndex--;
                }
            }
            else
            {
                // inbetween
                fiftyFifty = randomRange(0, 1);
                if (fiftyFifty > 0.5)
                {
                    // move right
                    moveToIndex++;
                }
                else
                {
                    // move left
                    moveToIndex--;
                }
            }

            console.log ("Moving " + followerClass + " from " + randomIndex + " to " + moveToIndex);
            if (!GameMap.districts[moveToIndex].destroyed) // only move to a healty district
            {
                GameMap.districts[randomIndex].followerMigrate(followerClass, GameMap.districts[moveToIndex]);

                if (!this.firstFollowerMoved)
                {
                    UI.displayEvent("A " + followerClass + " has traveld to a" ,"neighbouring district!");
                    this.firstFollowerMoved = true;
                }
            }
        }
    },
    checkVictory: function(){
        if (GameMap.numberOfDistricts === GameMap.destroyedDistricts)
        {
            if (!this.gameOver)
            {
                UI.displayEvent("The entire city has been", "burned down in " + UI.days + "days!");
            }
            MainGame.gameOver = true;
        }
    }
};