var StartMenu = {
	canvasElement: null,

	create: function() {
		console.log("Creating the Start Menu");
		this.canvasElement = document.getElementById(MainGame.currentState);
	},
	onClick: function()
	{
		if (Input.mousePosition.x > 115 && Input.mousePosition.x < 375 &&
		    Input.mousePosition.y > 285 && Input.mousePosition.y < 385)
    	{
    		MainGame.startState("city");
    	}
	},
	render: function()
	{
		var ctx = this.canvasElement.getContext("2d");
		// Background
		var radialGradiant = ctx.createRadialGradient(250, 560, 25, 250, 560, 600);
		radialGradiant.addColorStop(0,"rgb(255,203,102)");
		radialGradiant.addColorStop(0.4,"rgb(231,60,6)");
		radialGradiant.addColorStop(1,"rgb(18,13,3)");

		ctx.fillStyle = radialGradiant;
		ctx.fillRect(0,0,500,560);

		//Start button
		ctx.fillStyle = "rgb(18,13,3)";
		ctx.fillRect(115,287,260,100);
		if (Input.mousePosition.x > 115 && Input.mousePosition.x < 375 &&
		    Input.mousePosition.y > 285 && Input.mousePosition.y < 385)
		{
			ctx.fillStyle = "rgb(97,17,8)";
		}
		else
		{
			ctx.fillStyle = "rgb(58,23,8)";
		}
		ctx.fillRect(115,282,260,100);

		ctx.font = "bold 51pt Arial";
		ctx.textAlign="center";
		ctx.fillStyle = "rgb(25,25,25)";
		ctx.fillText("Ignite",250,347);
		ctx.font = "bold 50pt Arial";
		ctx.fillStyle = "rgb(255,158,62)";
		ctx.fillText("Ignite",250,350);

		// Credits
		ctx.fillStyle = "rgb(18,13,3)";
		ctx.font = "normal 15pt Arial";
		ctx.fillText("Jeremy de Reuck - Programming and Art",245,505);
		ctx.fillText("Janke van Jaarsveld - Game Design",245,535);

		// Heading
		// ctx.fillStyle = "rgb(20,20,20)";
		// ctx.font = "bold 60pt Arial";
		// ctx.fillText("Dreaming of",245,90);
		// ctx.font = "bold 90pt Arial";
		// ctx.fillText("FIRE",245,215);

		ctx.fillStyle = "rgb(255,158,62)";
		ctx.shadowColor = "rgb(18,13,3)";
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = -30;
		ctx.shadowBlur = 60;
		ctx.font = "bold 60pt Arial";
		ctx.fillText("Dreaming of",245,85);
		ctx.font = "bold 90pt Arial";
		ctx.fillText("FIRE",245,210);

		ctx.fillStyle = "rgb(255,158,62)";
		ctx.shadowColor = "rgb(18,13,3)";
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 20;
		ctx.font = "bold 60pt Arial";
		ctx.fillText("Dreaming of",245,85);
		ctx.font = "bold 90pt Arial";
		ctx.fillText("FIRE",245,210);
	}
};