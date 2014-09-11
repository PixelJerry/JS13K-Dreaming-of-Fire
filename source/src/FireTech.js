var iTxt = []; //Info text for each skill to be displayed on screen
iTxt[0] = "Clerics spawn is increased";
iTxt[1] = "Started fires will burn longer";
iTxt[2] = "Clerics spawn is greatly increased";
iTxt[3] = "Started fires will burn longer";
iTxt[4] = "Increased fire spread within districts";
iTxt[5] = "Increased fire spread between districts";
iTxt[6] = "Increased fire spread between districts";
iTxt[7] = "Increased fire spread within districts";
iTxt[8] = "Fires will be started more regularly";
iTxt[9] = "Started fires will burn longer";
iTxt[10] = "Followers spawn is increased";
iTxt[11] = "Started fires will burn longer";
iTxt[12] = "Fires will be started more regularly";
iTxt[13] = "Fires will be started more regularly";
iTxt[14] = "Zealots spawn is greatly increased";
iTxt[15] = "Zealots spawn is increased";

var FTElement = function(radius, centerX, centerY)
{
	this.visualHexa = new Hexagon(radius, centerX, centerY);
	this.gridPoint = new Point();
	this.indexNumber = null;
	this.baseColour = "";
	this.activeColour = "";
	this.chosenColour = "";
	this.selectable = false;
	this.selected = false;
	this.chosen = false;
	this.skillInfo = "";
};

FTElement.prototype = {
	setGridPoint: function(xPoint, yPoint)
	{
		this.gridPoint.x = xPoint;
		this.gridPoint.y = yPoint;
	},
	draw: function(canvasID)
	{
		this.visualHexa.draw(canvasID);
	},
};

var FireTech = {
	show: false,
	techPoints: 0,
	techPointsSpent: 0,
	selectedElement: false,
	tier1: [0, 15],
	tier2: [1,2,13,14],
	tier3: [3,4,5,10,11,12],
	tier4: [6,7,8,9],

	mouseHexaGridPos: new Point(0, 0),

	followerSpawnMod: 0,
	clericSpawnMod: 0,
	followerMoveMod: 0,

	fireProcMod: 0,

	fuelModifierMod: 0,
	tileSpreadMod: 0,
	districtSpreadMod: 0,

	canvasElement: null,

	canCrossRiver: false,
	canTravel: false,
	travleChance: 0.05,

	startingPoint: new Point(84,200),
	hexaRadius: 35,
	hexaElements: [],
	numberOfHexaElements: 0,
	elementsCreated: false,

	globalSpreadResistanceMod: 0.01,

	hoverColour: "rgb(83,53,86)",
	slectedColour: "rgb(169,126,175)",

	create: function()
	{
		// create and hide the tech tree
		createCanvas(500, 560, "TechTree", MainGame.elementID);
		this.canvasElement = document.getElementById("TechTree");

		this.canvasElement.style.backgroundColor = "rgba(20,7,16,0.9)";

		// Create the hexagons
		if (!this.elementsCreated)
		{
			console.log ("Creating the Tech Tree hexagons");
			var placePos = new Point();
			var element = 0;
			for (var i = 0; i <= 6; i++) // rows
			{
				if (i < 4)
				{
					for (var j = -i; j <= 0 ; j++) // cols
					{
						if (i === 3)
						{
							this.addHexaElement(new Point(i, j), "rgb(91,67,0)", "rgb(255,194,0)", "rgb(255,237,178)");
						}
						else
						{
							this.addHexaElement(new Point(i, j), "rgb(0,65,109)", "rgb(24,121,199)", "rgb(185,215,238)");
						}
					}
				}
				else if (i < 7)
				{
					for (var j = -i + (i - 3); j <= -(i - 3) ; j++) // cols
					{
						this.addHexaElement(new Point(i, j), "rgb(107,0,10)", "rgb(255,52,63)", "rgb(255,194,197)");
					}
				}
			}

			this.attachInfo();
		}
	},
	addHexaElement: function(gridPoint, baseCol, activeCol, chosenCol)
	{
		var placePos = new Point();
		placePos = HexagonalGridSystem.externalGridCoordToPixelCoord(new Point(gridPoint.x, gridPoint.y), this.startingPoint, this.hexaRadius + 2);
		this.hexaElements[this.numberOfHexaElements] = new FTElement(this.hexaRadius, placePos.x, placePos.y);
		this.hexaElements[this.numberOfHexaElements].setGridPoint(gridPoint.x, gridPoint.y);
		
		this.hexaElements[this.numberOfHexaElements].indexNumber = this.numberOfHexaElements;
		this.hexaElements[this.numberOfHexaElements].baseColour = baseCol;
		this.hexaElements[this.numberOfHexaElements].activeColour = activeCol;
		this.hexaElements[this.numberOfHexaElements].chosenColour = chosenCol;
		this.hexaElements[this.numberOfHexaElements].visualHexa.setFill(this.hexaElements[this.numberOfHexaElements].baseColour);
		this.numberOfHexaElements++;
	},
	update: function()
	{
		if (this.show)
		{

			this.mouseHexaGridPos = HexagonalGridSystem.externalPixelCoordToGridCoord(Input.mousePosition, this.startingPoint, this.hexaRadius + 2);

			for (var ele in this.hexaElements)
		    {
		    	if (!this.hexaElements[ele].chosen)
		    	{
		    		this.hexaElements[ele].selectable = false;
		    	}
		    	else
		    	{
		    		this.hexaElements[ele].selectable = true;
		    	}

		    	if (!this.hexaElements[ele].selected)
		    	{
		    		this.hexaElements[ele].visualHexa.setFill(this.hexaElements[ele].baseColour);
		    	}
		    }

			if (this.techPoints > 0)
			{
				var tier = "tier" + (this.techPointsSpent + 1).toString();

				for (var index in this[tier])
				{
					if (!this.hexaElements[this[tier][index]].selected)
					{
					this.hexaElements[this[tier][index]].visualHexa.setFill(this.hexaElements[this[tier][index]].activeColour);
					this.hexaElements[this[tier][index]].selectable = true;
					}
				}
			}

			for (var ele in this.hexaElements)
		    {
		    	if (this.hexaElements[ele].chosen && this.hexaElements[ele].selected)
		    	{
		    		this.hexaElements[ele].visualHexa.setFill("rgb(255,255,255)");
		    	}
		    	else if (this.hexaElements[ele].chosen)
		    	{
		    		this.hexaElements[ele].visualHexa.setFill(this.hexaElements[ele].chosenColour);
		    	}

		    	if (this.hexaElements[ele].gridPoint.x === this.mouseHexaGridPos.x &&
		    		this.hexaElements[ele].gridPoint.y === this.mouseHexaGridPos.y)
		    	{
		    		if (this.hexaElements[ele].visualHexa.getFill() === this.hexaElements[ele].activeColour &&
		    			!this.hexaElements[ele].selected)
		    		{
		    			this.hexaElements[ele].visualHexa.setFill(this.hoverColour);
		    		}
		    		else if (this.hexaElements[ele].chosen && !this.hexaElements[ele].selected)
		    		{
		    			this.hexaElements[ele].visualHexa.setFill(this.hoverColour);
		    		}
		    	}
		    }
		}
	},
	render: function()
	{
		if (this.show)
		{
			var ctx = this.canvasElement.getContext("2d");

			this.canvasElement.width = 500; // Clearing the canvas
			// Display the canvas
			for (var hexa in this.hexaElements)
			{
				this.hexaElements[hexa].draw("TechTree");
			}

			// Close Button
			if (Input.mousePosition.x > 10 && Input.mousePosition.x < 245 &&
			    Input.mousePosition.y > 475 && Input.mousePosition.y < 550)
			{
			    ctx.fillStyle = "rgb(147,109,119)";
			    ctx.fillRect(10,480,235,70);
			    ctx.fillStyle = "rgb(229,199,207)";
			    ctx.fillRect(10,475,235,70);
			}
			else
			{
			    ctx.fillStyle = "rgb(109,72,80)";
			    ctx.fillRect(10,480,235,70);
			    ctx.fillStyle = "rgb(196,151,159)";
			    ctx.fillRect(10,475,235,70);
			}

			// Select button
			if (!this.selectedElement)
			{
				ctx.fillStyle = "rgb(195,195,195)";
			    ctx.fillRect(255,475,235,75);
			}
			else if (Input.mousePosition.x > 255 && Input.mousePosition.x < 490 &&
			    Input.mousePosition.y > 475 && Input.mousePosition.y < 550)
			{
			    ctx.fillStyle = "rgb(147,109,119)";
			    ctx.fillRect(255,480,235,70);
			    ctx.fillStyle = "rgb(229,199,207)";
			    ctx.fillRect(255,475,235,70);
			}
			else
			{
			    ctx.fillStyle = "rgb(109,72,80)";
			    ctx.fillRect(255,480,235,70);
			    ctx.fillStyle = "rgb(196,151,159)";
			    ctx.fillRect(255,475,235,70);
			}
			ctx.textAlign="center";
			ctx.fillStyle = "rgb(20,2,6)";
			ctx.font = "bold 19pt Arial";
			ctx.fillText("Close",120,519);
			ctx.fillText("Assign Skill",375,519);

			ctx.fillStyle = "rgb(185,215,238)";
			for (var ele in this.hexaElements)
			{
				if (this.hexaElements[ele].selected)
				{
					ctx.fillText(this.hexaElements[ele].skillInfo,250,380);
				}
			}

			ctx.font = "normal 16pt Arial";

			if (this.techPoints > 0 && this.selectedElement)
			{
				if (this.techPointsSpent === 1)
				{
					ctx.fillText("Followers will now move between districts",250,415);
				}
				else if (this.techPointsSpent === 3)
				{
					ctx.fillText("Followers will now be able to cross the river",250,415);
				}
			}

			ctx.fillText("Available Influence Points: " + this.techPoints,250,45);

			this.elementsCreated = true;
		}
	},
	open: function()
	{
		this.create();

		// remove and add mouse event listners
		Input.removeMouseListeners(MainGame.currentState);
		Input.addMouseListeners("TechTree");
	},
	close: function()
	{
		this.hideMenu();
	},
	selectTech: function()
	{
    	if (Input.mousePosition.x > 46 && Input.mousePosition.x < 452 &&
		Input.mousePosition.y > 72 && Input.mousePosition.y < 328)
    	{
    		this.selectedElement = false;

    		for (var ele in this.hexaElements)
    		{
	        	if (this.hexaElements[ele].selected)
	        	{
	        		this.hexaElements[ele].selected = false;
	        	}
	        	else if (this.hexaElements[ele].gridPoint.x === this.mouseHexaGridPos.x &&
	        		this.hexaElements[ele].gridPoint.y === this.mouseHexaGridPos.y &&
	        		this.hexaElements[ele].selectable)
	        	{
	        		this.hexaElements[ele].selected = true;
	        		this.hexaElements[ele].visualHexa.setFill(this.slectedColour);
	        		if (!this.hexaElements[ele].chosen)
	        		{
	        			this.selectedElement = true;
	        		}
	        	}
	        }
        }
	},
	assignSkill: function(number)
	{
		switch (number)
		{
			//Tier 1
			case 0:
				console.log("Skill 1");
				this.clericSpawnMod += 0.175;
				this.followerSpawnMod += 0.1;
				break;
			//Tier 2
			case 1:
				console.log("Skill 2");
				this.fuelModifierMod += 0.1;
				this.canTravel = true;
				break;
			case 2:
				console.log("Skill 3");
				this.clericSpawnMod += 0.225;
				this.followerSpawnMod += 0.2;
				this.canTravel = true;
				break;
			//Tier 3
			case 3:
				console.log("Skill 4");
				this.fuelModifierMod += 0.2;
				break;
			case 4:
				console.log("Skill 5");
				this.tileSpreadMod += 0.1;
				break;
			case 5:
				console.log("Skill 6");
				this.districtSpreadMod += 0.1;
				break;
			//Tier 4
			case 6:
				console.log("Skill 7");
				this.canCrossRiver = true;
				this.districtSpreadMod += 0.2;
				break;
			case 7:
				console.log("Skill 8");
				this.canCrossRiver = true;
				this.tileSpreadMod += 0.2;
				break;
			case 8:
				console.log("Skill 9");
				this.canCrossRiver = true;
				this.fireProcMod += 0.2;
				break;
			case 9:
				console.log("Skill 10");
				this.canCrossRiver = true;
				this.fuelModifierMod += 0.2;
				break;
			//Tier 3
			case 10:
				console.log("Skill 11");
				this.clericSpawnMod -= 0.225;
				this.followerSpawnMod += 0.1;
				break;
			case 11:
				console.log("Skill 12");
				this.followerSpawnMod += 0.2;
				break;
			case 12:
				console.log("Skill 13");
				this.fireProcMod += 0.15;
				break;
			//Tier 2
			case 13:
				console.log("Skill 14");
				this.fireProcMod += 0.1;
				this.canTravel = true;
				break;
			case 14:
				console.log("Skill 15");
				this.clericSpawnMod -= 0.225;
				this.followerSpawnMod += 0.2;
				this.canTravel = true;
				break;
			case 15:
			//Tier 1
				console.log("Skill 16");
				this.clericSpawnMod -= 0.175;
				this.followerSpawnMod += 0.1;
				break;
			default:
				console.log ("invalid nubmer: " + number);
		}
	},
	attachInfo: function()
	{
		for (var i = 0; i < 16; i++)
		{
			this.hexaElements[i].skillInfo = iTxt[i];
		}
	},
	allocatePoints: function()
	{
		switch (this.techPointsSpent + this.techPoints)
		{
			case 0:
				// give first point
				if (GameMap.destruction >= 5)
				{
					UI.displayEvent("First infulence point unlocked!","Click the influence button.");
					this.techPoints++;
				}
				break;
			case 1:
				// give second point
				if (GameMap.destruction >= 35)
				{
					this.techPoints++;
				}
				break;
			case 2:
				// give third point
				if (GameMap.destruction >= 150)
				{
					this.techPoints++;
				}
				break;
			case 3:
				// give fourth point
				if (GameMap.destruction >= 1000)
				{
					this.techPoints++;
				}
				break;
		}
	},
	hideMenu: function()
	{
		// remove and add mouse event listners
		Input.removeMouseListeners("TechTree");
		Input.addMouseListeners(MainGame.currentState);

		deleteCanvas("TechTree");
		this.canvasElement = null;

		this.show = false;
	},
	deleteMenu: function()
	{
		this.hideMenu();

		this.followerSpawnMod = 0;
		this.clericSpawnMod = 0;

		this.fireProcMod = 0;

		this.fuelModifierMod = 0;
		this.tileSpreadMod = 0;
		this.districtSpreadMod = 0;

		this.canCrossRiver = false;

		this.hexaElements = [];
		this.numberOfHexaElements = 0;
		this.elementsCreated = false;

		this.techPoints = 0;
		this.techPointsSpent = 0;
		this.selectedElement = false;

		this.canTravel = false;
	},
    onClick: function(event){
    	FireTech.selectTech();

    	if (Input.mousePosition.x > 10 && Input.mousePosition.x < 245 &&
    	    Input.mousePosition.y > 475 && Input.mousePosition.y < 550)
    	{
    		this.close();
    	}
    	else if (Input.mousePosition.x > 255 && Input.mousePosition.x < 490 &&
			    Input.mousePosition.y > 475 && Input.mousePosition.y < 550 &&
			this.selectedElement)
    	{
    		for (var ele in this.hexaElements)
    		{
    			if (this.hexaElements[ele].selected &&
    				!this.hexaElements[ele].chosen)
    			{
    				this.hexaElements[ele].selected = false;
    				this.hexaElements[ele].chosen = true;
    				this.assignSkill(this.hexaElements[ele].indexNumber);
    				this.selectedElement = false;
    				this.techPoints--;
    				this.techPointsSpent++;
    			}
    		}
    	}
    }
};