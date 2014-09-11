var GenerateMap = {
	edgeRoughness: 0.75, // value between 0 and 1, 0 is smooth
	edgeDepth: 2,

	minRiverWidth: 1,
	maxRiverWidth: 3,
	riverSpread: 4, // amount of tiles the river can go up and down
	riverRoughness: 0.25, // how often the river changes thickness
	riverBends: 0.8, // how often the river changes direction

	minDistricts: 6,
	maxDistricts: 8,
	districtsTop: 0,
	districtsBottom: 0,
	districtLineStarts: [],

	borderOffset: 2,
	borderRoughness: 0.8,
	borderVariance: 3,
	borderGenColour: "rgb(165,110,55)",

	directionModifier: ["up", "down"],

	leftMiddleTile: new Point(-19, 9),
	leftTopTile: new Point(-19, -1),
	rightTopTile: new Point(19, -20),
	rightBottomTile: new Point(19, 1),
	leftBottomTile: new Point(-19, 20),

	create: function()
	{
		console.log ("Generating the map");

		// this.init();
        this.defineOuterEdge();
        this.createRiver();
        this.defineDistricts();

        GameMap.indexOfFirstBottomDistrict = this.districtsTop;

        this.validateMap();
	},
	defineOuterEdge: function()
	{
		// Start at top left corner and run through the map in a clockwise direction
		var testPos = new Point(this.leftTopTile.x, this.leftTopTile.y);

		var currentTile = GameMap.findTileAtGridIndex(testPos);

		// start moving right

		var rRoughness = 0;
		var rDepth = 0;
		var currentDepth = 0;

		
		do{
			currentDepth = this.randomEdge("down", testPos, currentDepth, rDepth);
			rRoughness = randomRange(0, 1);
			if (this.edgeRoughness > rRoughness)
			{
				rDepth = Math.round(randomRange(0, this.edgeDepth));
			}
			testPos = Navigation.moveRight(testPos, "up");
			currentTile = GameMap.findTileAtGridIndex(testPos);
			if (currentTile === null)
			{
				testPos = Navigation.moveLeft(testPos, "down");
				testPos = Navigation.moveRight(testPos, "down");
				currentTile = GameMap.findTileAtGridIndex(testPos);
				if (currentTile === null)
				{
					testPos = Navigation.moveLeft(testPos, "up");
					currentTile = GameMap.findTileAtGridIndex(testPos);
				}
			}
		}while(testPos.x !== this.rightTopTile.x || testPos.y !== this.rightTopTile.y);
		currentDepth = this.randomEdge("down", testPos, currentDepth, rDepth);

		// move down next
		do
		{
			currentDepth = this.randomEdge("left", testPos, currentDepth, rDepth);
			rRoughness = randomRange(0, 1);
			if (this.edgeRoughness > rRoughness)
			{
				rDepth = Math.round(randomRange(0, this.edgeDepth));
			}

			testPos = Navigation.moveDown(testPos);
			currentTile = GameMap.findTileAtGridIndex(testPos);
			if (currentTile === null)
			{
				testPos = Navigation.moveUp(testPos);
			}
		}while(currentTile !== null);

		// move left next
		do{
			currentDepth = this.randomEdge("up", testPos, currentDepth, rDepth);
			rRoughness = randomRange(0, 1);
			if (this.edgeRoughness > rRoughness)
			{
				rDepth = Math.round(randomRange(0, this.edgeDepth));
			}

			testPos = Navigation.moveLeft(testPos, "down");
			currentTile = GameMap.findTileAtGridIndex(testPos);
			if (currentTile === null)
			{
				testPos = Navigation.moveRight(testPos, "up");
				testPos = Navigation.moveLeft(testPos, "up");
				currentTile = GameMap.findTileAtGridIndex(testPos);
				if (currentTile === null)
				{
					testPos = Navigation.moveRight(testPos, "down");
					currentTile = GameMap.findTileAtGridIndex(testPos);
				}
			}
		}while(testPos.x !== this.leftBottomTile.x || testPos.y !== this.leftBottomTile.y);
		currentDepth = this.randomEdge("up", testPos, currentDepth, rDepth);

		// finally move up
		do
		{
			currentDepth = this.randomEdge("right", testPos, currentDepth, rDepth);
			rRoughness = randomRange(0, 1);
			if (this.edgeRoughness > rRoughness)
			{
				rDepth = Math.round(randomRange(0, this.edgeDepth));
			}
			testPos = Navigation.moveUp(testPos);
			currentTile = GameMap.findTileAtGridIndex(testPos);
			if (currentTile === null)
			{
				testPos = Navigation.moveDown(testPos);
			}
		}while(testPos.x !== this.leftTopTile.x || testPos.y !== this.leftTopTile.y);
		currentDepth = this.randomEdge("right", testPos, currentDepth, rDepth);
	},
	randomEdge: function(direction, gridPosition, currentDepth, randomDepth)
	{
		direction = "move" + direction.charAt(0).toUpperCase() + direction.slice(1);
		var end = currentDepth;

		var tileToKill = GameMap.findTileAtGridIndex(gridPosition);
		if (tileToKill === null)
		{
			console.log ("NULL TILE");
		}

		if (direction === "moveUp" || direction === "moveDown")
		{
			if (randomDepth > currentDepth && gridPosition.x % 2 !== 1)
			{
				end = currentDepth + 1;
			}
			else if (randomDepth < currentDepth && gridPosition.x % 2 !== 0)
			{
				end = currentDepth - 1;
			}
			else
			{
				end = currentDepth;
			}
		}
		else
		{
			if (randomDepth > currentDepth)
			{
				end = currentDepth + 1;
			}
			else if (randomDepth < currentDepth)
			{
				end = currentDepth - 1;
			}
			else
			{
				end = currentDepth;
			}
		}

		for (var i = 0; i < end; i++)
		{
			tileToKill.visible = false;
			gridPosition = Navigation[direction](gridPosition, this.directionModifier[i % 2]);
			tileToKill = GameMap.findTileAtGridIndex(gridPosition);
		}

		return end;
	},
	// Create the river
	createRiver: function()
	{
		// find starting point
		var riverPosition = new Point();
		var riverTile = null;

		riverPosition.equals(this.leftMiddleTile);

		riverPosition.y += Math.round(randomRange(-1, 1));
		riverTile = GameMap.findTileAtGridIndex(riverPosition);
		// find starting position
		var count = 0;
		while(riverTile === null || !riverTile.visible)
		{
			riverPosition = Navigation.moveRight(riverPosition, this.directionModifier[count % 2]);
			riverTile = GameMap.findTileAtGridIndex(riverPosition);
			count++;
		}

		GameMap.addRiverTile(riverTile);

		var directionIndex = 0;
		var movingUp = 0;
		count = 0;

		// random thickness
		var thickness = this.minRiverWidth;
		var rRoughness = randomRange(0,1);
		var lastDirection = "none";

		while(riverPosition.x !== this.rightTopTile.x && riverTile !== null)
		{
			var direction = randomRange(0,1);
			if (direction < this.riverBends / 2)
			{
				directionIndex = 0;
			}
			else if (direction > this.riverBends / 2)
			{
				directionIndex = 1;
			}
			else
			{
				directionIndex = count % 2;
			}

			if (movingUp <= -this.riverSpread)
			{
				directionIndex = 0;
			}
			else if (movingUp >= this.riverSpread)
			{
				directionIndex = 1;
			}

			if (directionIndex === 0) // up
			{
				movingUp++;
			}
			else // down
			{
				movingUp--;
			}

			riverPosition = Navigation.moveRight(riverPosition, this.directionModifier[directionIndex]);
			riverTile = GameMap.findTileAtGridIndex(riverPosition);

			var thicknessPosition = new Point(riverPosition.x, riverPosition.y);
			var thickIncrease = false;
			var directionChange = false;

			if (riverTile !== null && riverTile.visible)
			{
				GameMap.addRiverTile(riverTile);

				rRoughness = randomRange(0,1);
				if (this.riverRoughness > rRoughness)
				{
					var newThickness = Math.round(randomRange(this.minRiverWidth, this.maxRiverWidth));
					if (newThickness > thickness)
					{
						thickness++;
						thickIncrease = true;
					}
					else if (newThickness < thickness)
					{
						thickness--;
					}
				}
				var rivDir = directionIndex;

				for (var i = 1; i < thickness; i++)
				{
					rivDir ++;
					if (i === 1)
					{
						if (lastDirection === "none")
						{
							lastDirection = rivDir;
						}
						else
						{
							if (lastDirection === rivDir)
							{
								directionChange = true;
							}
							else
							{
								directionChange = false;
							}
						}
					}

					thicknessPosition = Navigation["move" + this.directionModifier[rivDir % 2].charAt(0).toUpperCase() + this.directionModifier[rivDir % 2].slice(1)](thicknessPosition);
					riverTile = GameMap.findTileAtGridIndex(thicknessPosition);

					while(riverTile.type === tileTypes.river)
					{
						thicknessPosition = Navigation["move" + this.directionModifier[rivDir % 2].charAt(0).toUpperCase() + this.directionModifier[rivDir % 2].slice(1)](thicknessPosition);
						riverTile = GameMap.findTileAtGridIndex(thicknessPosition);
					}

					if (riverTile !== null && riverTile.visible && riverTile.type !== tileTypes.river)
					{
						GameMap.addRiverTile(riverTile);
						//riverTile.setFill("rgb(255,255,0)");
					}
				}
			}

			riverTile = GameMap.findTileAtGridIndex(riverPosition);

			count++;
		}
	},
	defineDistricts: function()
	{
		//Seperate the districts with lines running over the map
		var numberOfDistricts = Math.round(randomRange(this.minDistricts, this.maxDistricts));

		if (numberOfDistricts % 2 === 1)
		{
			if (randomRange(0,1) > 0.5)
			{
				this.districtsTop = Math.ceil(numberOfDistricts / 2);
				this.districtsBottom = Math.floor(numberOfDistricts / 2);
			}
			else
			{
				this.districtsTop = Math.floor(numberOfDistricts / 2);
				this.districtsBottom = Math.ceil(numberOfDistricts / 2);
			}
		}
		else
		{
			this.districtsTop = numberOfDistricts / 2;
			this.districtsBottom = numberOfDistricts / 2;
		}

		
		var startingPosition = new Point();
		for (var i = 1; i < this.districtsTop; i++)
		{
			startingPosition = this.getStartingPosition(i, "top");
			//this.districtLineStarts[this.districtLineStarts.length] = startingPosition;
			this.defineDistrict(startingPosition, "top");
		}

		for (var i = 1; i < this.districtsBottom; i++)
		{
			startingPosition = this.getStartingPosition(i, "bottom");
			//this.districtLineStarts[this.districtLineStarts.length] = startingPosition;
			this.defineDistrict(startingPosition, "bottom");
		}

		this.addLinesToDistricts();
	},
	getStartingPosition: function(current, half)
	{
		var searchDirection = "moveUp";
		var reverseDirection = "moveDown";

		if (half === "bottom")
		{
			searchDirection = "moveDown";
			reverseDirection = "moveUp";
		}
		var numberOfRows = Math.abs(this.leftTopTile.x) + this.rightTopTile.x;

		var startX = Math.round(current * numberOfRows / this.districtsTop) + Math.round(randomRange(-this.borderOffset, this.borderOffset)) + this.leftTopTile.x;
		if (half === "bottom")
		{
			startX = Math.round(current * numberOfRows / this.districtsBottom) + Math.round(randomRange(-this.borderOffset, this.borderOffset)) + this.leftTopTile.x;
		}
		var temp = new Point(0, 0);
		var testTile = null;

		var foundStart = false;
		while (!foundStart)
		{
			if (temp.x === startX)
			{
				// just move up
				do
				{
					temp = Navigation[searchDirection](temp);
					testTile = GameMap.findTileAtGridIndex(temp);
				}while(testTile !== null);
				temp = Navigation[reverseDirection](temp);
				testTile = GameMap.findTileAtGridIndex(temp);

				while (!testTile.visible)
				{
					temp = Navigation[reverseDirection](temp);
					testTile = GameMap.findTileAtGridIndex(temp);
				}

				//temp = findStartTest(searchDirection, reverseDirection);

				foundStart = true;
			}
			else
			{
				// move right
				var jumpDirection = "jumpRight";
				var moveDirection = "moveLeft";
				if (startX < 0)
				{
					// move left
					jumpDirection = "jumpLeft";
					moveDirection = "moveRight";
				}

				do{
					temp = Navigation[jumpDirection](temp);
				}while ((temp.x > startX && startX < 0) || (temp.x < startX && startX > 0));

				if (temp.x !== startX)
				{
					temp = Navigation[moveDirection](temp, "up");
				}
				do 
				{
					temp = Navigation[searchDirection](temp);
					testTile = GameMap.findTileAtGridIndex(temp);
				}while(testTile !== null);
				temp = Navigation[reverseDirection](temp);
				testTile = GameMap.findTileAtGridIndex(temp);

				while (!testTile.visible)
				{
					temp = Navigation[reverseDirection](temp);
					testTile = GameMap.findTileAtGridIndex(temp);
				}

				foundStart = true;
			}
		}

		this.districtLineStarts[this.districtLineStarts.length] = temp;
		return temp;
	},
	defineDistrict: function(startingPosition, half)
	{
		var drawDirection = "moveDown";

		if (half === "bottom")
		{
			drawDirection = "moveUp";
		}

		var testPos = new Point(startingPosition.x, startingPosition.y);
		var testTile = GameMap.findTileAtGridIndex(testPos);
		testTile.setFill(this.borderGenColour);

		var chanceToChangeDirection = 0;
		var directionChange = 0;
		var lastChange = 0;
		var lastDirection = drawDirection;

		var noChangeDirection = drawDirection;
		var positiveDirection = "moveRight";
		var negativeDirection = "moveLeft";

		var secondaryDirection = "up";
		if (drawDirection === "moveDown")
		{
			secondaryDirection = "down";
		}

		var currentDirection = drawDirection;

		if (testTile === null)
		{
			console.log ("randomLineInDirection found a null tile, aborting.");
		}
		while(testTile.type !== tileTypes.river)
		{
			chanceToChangeDirection = randomRange(0,1);
			if (this.borderRoughness > chanceToChangeDirection)
			{
				directionChange = Math.round(randomRange(- this.borderVariance, this.borderVariance));
			}

			if (directionChange > lastChange)
			{
				if (lastDirection !== negativeDirection)
				{
					currentDirection = positiveDirection;
					lastChange++;
				}
				else
				{
					currentDirection = noChangeDirection;
				}
			}
			else if (directionChange < lastChange)
			{
				currentDirection = negativeDirection;
				if (lastDirection !== positiveDirection)
				{
					currentDirection = negativeDirection;
					lastChange--;
				}
				else
				{
					currentDirection = noChangeDirection;
				}
			}
			else
			{
				currentDirection = noChangeDirection;
			}

			testPos = Navigation[currentDirection](testPos, secondaryDirection);
			testTile = GameMap.findTileAtGridIndex(testPos);
			if (testTile.type !== tileTypes.river)
			{
				testTile.setFill(this.borderGenColour);
			}
			lastDirection = currentDirection;
		}
		// Use the stating position to calculate the distrct's fill start position
		testPos.equals(startingPosition);

		// Now find a valid spot to the left of the line.
		do{
			testPos = Navigation.moveLeft(testPos, secondaryDirection);
			testTile = GameMap.findTileAtGridIndex(testPos);
		}while(testTile === null || !testTile.visible || testTile.getFill() === this.borderGenColour);
		
		var ditType = ["industrial", "commercial", "residential"];
		var randomDistrictType = Math.round(randomRange(0,2));
		if (GameMap.numberOfDistricts !== 0)
		{
			if (GameMap.districts[GameMap.numberOfDistricts - 1].mainType === districtTypes[ditType[randomDistrictType]])
			{
				randomDistrictType = (randomDistrictType + Math.round(randomRange(1,2))) % 3;
			}
		}
		var districtColour = offsetColour(GameMap[ditType[randomDistrictType] + "Colour"], -70, 70, false);
		var newDistrict = new District(ditType[randomDistrictType], districtColour);
		
		this.fillDistrict(testPos, districtColour, newDistrict);// rgbIntToString({r: colourValue, g: colourValue, b: colourValue}));
		GameMap.addDistrict(newDistrict);

		// if this is the last line, find start to the right of the line
		if (GameMap.numberOfDistricts === this.districtsTop - 1 || GameMap.numberOfDistricts === this.districtsTop + this.districtsBottom - 1){
			testPos.equals(startingPosition);

			do{
				testPos = Navigation.moveRight(testPos, secondaryDirection);
				testTile = GameMap.findTileAtGridIndex(testPos);
			}while(testTile === null || !testTile.visible || testTile.getFill() === this.borderGenColour);
			
			randomDistrictType = Math.round(randomRange(0,2));
			if (GameMap.numberOfDistricts !== 0)
			{
				if (GameMap.districts[GameMap.numberOfDistricts - 1].mainType === districtTypes[ditType[randomDistrictType]])
				{
					randomDistrictType = (randomDistrictType + Math.round(randomRange(1,2))) % 3;
				}
			}
			districtColour = offsetColour(GameMap[ditType[randomDistrictType] + "Colour"], -70, 70, false);
			newDistrict = new District(ditType[randomDistrictType], districtColour);
			
			this.fillDistrict(testPos, districtColour, newDistrict);
			GameMap.addDistrict(newDistrict);
		}
	},
	fillDistrict: function(startingPosition, colourValue, district)
	{
		var tilePos = new Point(startingPosition.x, startingPosition.y);
		var testTile = GameMap.findTileAtGridIndex(tilePos);

		district.addTile(testTile, GameMap.numberOfDistricts);

		var directionMain = ["moveUp", "moveRight", "moveRight", "moveDown", "moveLeft", "moveLeft"];
        var directionSecondary = ["", "up", "down", "", "down", "up"];

        for (var i = 0; i < 6; i++)
        {
            tilePos = Navigation[directionMain[i]](startingPosition, directionSecondary[i]);
            testTile = GameMap.findTileAtGridIndex(tilePos);
            if (testTile !== null && 
            	testTile.visible && 
            	testTile.getFill() !== colourValue && 
            	testTile.getFill() !== this.borderGenColour && 
            	testTile.type !== tileTypes.river &&
            	testTile.districtIndex === null)
            {
            	this.fillDistrict(tilePos, colourValue, district);
            }
        }
	},
	addLinesToDistricts: function()
	{
		var numberOfLines = this.districtsTop - 1 + this.districtsBottom - 1;
		var testPos = new Point();
		var testTile = null;
		for (var i = 0; i < numberOfLines; i++)
		{
			//get the start of each line and set colour for testing
			testPos = this.districtLineStarts[i];
			testTile = GameMap.findTileAtGridIndex(testPos);

			var completedLine = false;
			var mainDirection = "moveUp";
			var virticalDirection = "up";
			var districtToAddTo = i;

			if (i < this.districtsTop - 1)
			{
				virticalDirection = "down";
				mainDirection = "moveDown";
			}
			else
			{
				districtToAddTo = i + 1;
			}
			var testStartPos = this.districtLineStarts[i];
			//testTile.setFill("rgb(0,255,0)");
			GameMap.districts[districtToAddTo].addTile(testTile, districtToAddTo);

			while(!completedLine)
			{
				var foundTile = false;

				testPos = testStartPos;
				testPos = Navigation.moveLeft(testPos, virticalDirection);
				testTile = GameMap.findTileAtGridIndex(testPos);
				if (testTile !== null)
				{
					if (testTile.getFill() === this.borderGenColour)
					{
						if (!testTile.visible)
						{
							testTile.visible = true;
						}

						//testTile.setFill("rgb(0,255,0)");
						GameMap.districts[districtToAddTo].addTile(testTile, districtToAddTo);
						foundTile = true;
						testStartPos = testPos;
					}
				}

				testPos = testStartPos;
				testPos = Navigation[mainDirection](testPos, virticalDirection);
				testTile = GameMap.findTileAtGridIndex(testPos);
				if (testTile !== null)
				{
					if (testTile.getFill() === this.borderGenColour)
					{
						if (!testTile.visible)
						{
							testTile.visible = true;
						}
						//testTile.setFill("rgb(0,255,0)");
						GameMap.districts[districtToAddTo].addTile(testTile, districtToAddTo);
						foundTile = true;
						testStartPos = testPos;
					}
				}

				testPos = testStartPos;
				testPos = Navigation.moveRight(testPos, virticalDirection);
				testTile = GameMap.findTileAtGridIndex(testPos);
				if (testTile !== null)
				{
					if (testTile.getFill() === this.borderGenColour)
					{
						if (!testTile.visible)
						{
							testTile.visible = true;
						}
						//testTile.setFill("rgb(0,255,0)");
						GameMap.districts[districtToAddTo].addTile(testTile, districtToAddTo);
						foundTile = true;
						testStartPos = testPos;
					}
				}

				if (!foundTile)
				{
					completedLine = true;
				}
			}
		}
	},
	validateMap: function()
	{
		console.log("Validating the generated map");
		var problemPositions = [];
		var numberOfProblemTiles = 0;
		var testedColour = "rgb(0,255,255)";

		// Step 1. Find all the problem tiles
		for (var xIndex in GameMap.tiles)
		{
			for (var yIndex in GameMap.tiles[xIndex])
			{
				if (GameMap.tiles[xIndex][yIndex].getFill() === GameMap.emptyColour && GameMap.tiles[xIndex][yIndex].visible)
				{
					problemPositions[numberOfProblemTiles] = new Point(parseInt(xIndex), parseInt(yIndex));
					numberOfProblemTiles++;
				}
			}
		}

		var redoMap = false;

		if (numberOfProblemTiles >= 3)
		{
			console.log ("Found too many problem tiles, redo the map");
			redoMap = true;
		}
		else
		{
			for (var testPosition in problemPositions)
			{
				if (!this.validateTile(problemPositions[testPosition], testedColour))
				{
					redoMap = true;
				}
			}
		}

		if (redoMap)
		{
			this.redoMapGeneration();
		}
		else
		{
			this.districtLineStarts = [];
		}

	},
	validateTile: function(startingPosition, markColour){
		var startingPosition = new Point(startingPosition.x - GameMap.calculateIndexAdjustment(), startingPosition.y - GameMap.calculateIndexAdjustment());
		var tilePos = new Point(startingPosition.x, startingPosition.y);
		var testTile = GameMap.findTileAtGridIndex(tilePos);
		testTile.setFill(markColour);


		var directionMain = ["moveUp", "moveRight", "moveRight", "moveDown", "moveLeft", "moveLeft"];
        var directionSecondary = ["", "up", "down", "", "down", "up"];

        var foundValidTile = false;
        var countClear = 0;

        for (var i = 0; i < 6; i++)
        {
            tilePos = Navigation[directionMain[i]](startingPosition, directionSecondary[i]);
            testTile = GameMap.findTileAtGridIndex(tilePos);
            if (testTile !== null)
            {
            	if (testTile.visible)
            	{
	            	if (testTile.type === tileTypes.river)
	            	{
	            		foundValidTile = true;
	            	}
	            }
	            else
	            {
	            	countClear++;
	            }
            }
            else
            {
            	countClear++;
            }
        }

        if (foundValidTile)
        {
        	GameMap.addRiverTile(GameMap.findTileAtGridIndex(startingPosition));
        }

        if (countClear === 6)
        {
        	GameMap.findTileAtGridIndex(startingPosition).visible = false;
        	foundValidTile = true;
        }
        return foundValidTile;
	},
	redoMapGeneration: function()
	{
		this.districtLineStarts = [];
		MainGame.startState(MainGame.currentState);

	}
};