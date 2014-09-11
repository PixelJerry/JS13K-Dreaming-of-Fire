var districtTypes = {
    names: ["none", "industrial", "commercial", "residential"],
    none: 0,
    industrial: 1,
    commercial: 2,
    residential: 3,

    name: function(code)
    {
        if (code >= 0 && code <= 3)
        {
            return this.names[code];
        }
        else
        {
            return "INVALID";
        }
    }
};

var District = function(type, colour)
{
    this.name = "";
    if (typeof type === "undefined" || typeof districtTypes[type] === "undefined")
    {
        this.mainType = districtTypes.none;
    }
    else
    {
        this.mainType = districtTypes[type];
    }
    this.tiles = []; // All the tiles in this district
    this.numberOfTiles = 0;
    this.baseColour = colour;

    this.fireProc = 0.08; // Value between 0 and 100
    this.fireStaringByZealotMod = 0.006;
    this.tileResistance = 0.92;
    this.clericResistanceModifier = 0.01;

    this.flammable = false;
    this.destroyed = false;

    this.clerics = [];
    this.zealots = [];
    this.numberOfFollowers = {clerics: 0, zealots: 0};
    this.followerSpawnChance = 0.08;
    this.followerSpawnFireMod = 0.002;
    this.clericChance = 0.5;
    this.spawnTestTimer = null; //use to keep track of time
    this.spawnTestTime = 1000; // try to spawn every second
    this.fireTestTimer = null;
    this.fireTestTime = 1000;
    this.fireCounter = 0; // Use this to force fires if there was to long time without one

    this.startingPopulation = 0;
    this.population = 0;
    this.deaths = 0;
    this.destruction = 0;
    this.firesStarted = 0;

    this.mouseOver = false;
    // this.selected = false;
    this.displayUpdated = false;

    this.determineName();
};

District.prototype = {
    determineName: function() {
        var typeName = districtTypes.name(this.mainType);
        this.name = typeName.charAt(0).toUpperCase() + typeName.slice(1) + " District";
    },
    addTile: function(tile, index) {
        this.tiles[this.numberOfTiles] = tile;
        this.tiles[this.numberOfTiles].setFill(this.baseColour);
        this.tiles[this.numberOfTiles].setBaseColour(this.baseColour);
        this.tiles[this.numberOfTiles].districtIndex = index;
        this.numberOfTiles++;
    },
    initialPopulation: function() {
        var min = 0;
        var max = 0;

        this.population = 0;
        
        if (this.mainType === districtTypes.industrial)
        {
            min = 0;
            max = 2;
        }
        else if (this.mainType === districtTypes.commercial)
        {
            min = 1;
            max = 4;
        }
        else if (this.mainType === districtTypes.residential)
        {
            min = 2;
            max = 6;
        }
        
        for (var tile in this.tiles)
        {
            this.tiles[tile].population = Math.round(randomRange(min, max));
            this.population += this.tiles[tile].population;
        }
        
        this.startingPopulation = this.population;
    },
    addFollower: function(followerClass) {
        this.flammable = true;

        newFollower = new Follower(followerClass);
        followerClass = newFollower.fireClass;

        this[followerClass + "s"][this[followerClass + "s"].length] = new Follower(followerClass);
        this.calculateStats();
    },
    killFollower: function(followerClass){
        if (typeof this[followerClass + "s"] === "undefined")
        {
            console.log ("There are no " + followerClass + "s in " + this.name + " to kill.");
            return;
        }
        else
        {
            var killed = false;

            for (var index in this[followerClass + "s"])
            {
                if (this[followerClass + "s"][index].alive)
                {
                    console.log ("Killing a " + followerClass + " in " + this.name);
                    this[followerClass + "s"][index].kill();
                    killed = true;
                    this.calculateStats();
                    break;
                }
            }

            if (!killed)
            {
                console.log ("All the " + followerClass + "s are already dead.");
            }
        }
    },
    newFireStarted: function()
    {
        this.firesStarted++;
        this.calculateStats();
    },
    countFollowers: function()
    {
        this.numberOfFollowers =  {clerics: 0, zealots: 0};

        for (var cleric in this.clerics)
        {
            if (this.clerics[cleric].alive)
            {
                this.numberOfFollowers.clerics++;
            }
        }

        for (var zealot in this.zealots)
        {
            if (this.zealots[zealot].alive)
            {
                this.numberOfFollowers.zealots++;
            }
        }
    },
    tryToSpawnFollowers: function()
    {
        if (!this.destroyed)
        {
            if (MainGame.timeNow() - this.spawnTestTimer >= this.spawnTestTime || this.spawnTestTimer === null)
            {
                this.spawnTestTimer = MainGame.timeNow();

                if(this.firesStarted > 0)
                {
                    var spawnChance = randomRange(0, 1);
                    if (this.followerSpawnChance + (this.followerSpawnFireMod * this.firesStarted) + FireTech.followerSpawnMod > spawnChance)
                    {
                        var spawnType = randomRange(0,1);
                        if (this.clericChance + FireTech.clericSpawnMod > spawnType)
                        {
                            // Spawn a cleric
                            console.log ("Spawning a cleric");
                            this.addFollower("cleric");
                        }
                        else
                        {
                            // Spawn a zealot
                            console.log ("Spawning a zealot");
                            this.addFollower("zealot");
                        }
                    }
                    GameMap.countFollowers();
                }
            }
        }
    },
    tryToStartFire: function(){
        if (MainGame.timeNow() - this.fireTestTimer >= this.fireTestTime || this.fireTestTimer === null)
        {
            this.fireTestTimer = MainGame.timeNow();
            var fireStartChance = randomRange(0, 1);
            if (this.flammable)
            {
                this.fireCounter++;
            }
            if (this.fireCounter >= 10)
            {
                console.log ("Force a fire");
            }

            if ((this.flammable && this.fireProc + (this.numberOfFollowers.zealots * this.fireStaringByZealotMod) + FireTech.fireProcMod > fireStartChance) || this.fireCounter >= 10)
            {
                console.log ("START A FIRE in " + this.name);
                this.startFire();
                this.checkDestroyed();
                this.fireCounter = 0;
            }
        }
    },
    startFire: function(){
        var burnableTile = false;
        var startedFire = false;
        var randomIndex = 0;

        for (var index in this.tiles)
        {
            if (!this.tiles[index].burning && !this.tiles[index].charred && this.tiles[index].fuel > 0)
            {
                burnableTile = true;
                break;
            }
        }

        if (!burnableTile)
        {
            console.log ("No more tiles to burn in " + this.name);
            return;
        }

        do{
            randomIndex = Math.round(randomRange(0, this.numberOfTiles - 1));

            if (!this.tiles[randomIndex].burning && !this.tiles[randomIndex].charred && this.tiles[randomIndex].fuel > 0)
            {
                //set the tile on fire
                Fire.setOnFire(this.tiles[randomIndex]);
                startedFire = true;
            }
        }while(!startedFire);
    },
    followerMigrate: function(followerType, newDistrict){
        console.log ("Follower moving to a new district");
        var follower = "cleric";
        if (followerType.indexOf("z") === 0)
        {
            follower = "zealot";
        }

        if (this.numberOfFollowers[follower + "s"] > 0)
        {
            newDistrict.addFollower(follower);
            this.killFollower(follower);
        }
    },
    calculateStats: function() {
        GameMap.countFollowers();
    },
    getFuelModifier: function()
    {
        return keepWithinRange(this.tileResistance - (this.numberOfFollowers.clerics * this.clericResistanceModifier) - FireTech.fuelModifierMod, 0, 1);
    },
    onMouseOver: function()
    {
        if (!this.mouseOver)
        {
            for (var temp in this.tiles)
            {
                if (!this.tiles[temp].burning)
                {
                    Motion.fadeTileColourTo(this.tiles[temp], GameMap.hoverColour, 200);
                }
                this.tiles[temp].mouseOver = true;
            }

            this.displayUpdated = false;
        }
        this.mouseOver = true;
        
        if (!this.displayUpdated)
        {
            UI.displayAreaInfo();
            this.displayUpdated = true;
        }
    },
    onMouseOff: function()
    {
        if (this.mouseOver)
        {
            for (var temp in this.tiles)
            {
                if (this.tiles[temp].burning)
                {
                    //skip this tile
                }
                else if (this.tiles[temp].charred)
                {
                    Motion.fadeTileColourTo(this.tiles[temp], Fire.charredColour, 250);
                }
                else
                {
                    Motion.fadeTileColourTo(this.tiles[temp], this.tiles[temp].baseColour, 250);
                }
                this.tiles[temp].mouseOver = false;
            }
            this.displayUpdated = false;
        }
        this.mouseOver = false;

        if (!this.displayUpdated)
        {
            UI.displayAreaInfo();
            this.displayUpdated = true;
        }
    },
    checkDestroyed: function()
    {
        if (!this.destroyed)
        {
            var healtyTile = false;

            for (var tile in this.tiles)
            {
                if (!this.tiles[tile].charred && !this.tiles[tile].burning)
                {
                    healtyTile = true;
                }
            }

            if (!healtyTile)
            {
                this.destroyed = true;
                GameMap.destroyedDistricts++;
                if (GameMap.destroyedDistricts === 1)
                {
                    UI.displayEvent("You have completely destroyed", " the " + this.name + "!");
                }
            }
        }
    }
};