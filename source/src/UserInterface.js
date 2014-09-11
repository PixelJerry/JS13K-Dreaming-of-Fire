var UI = {
    news: [],
    newsLines: 2,
    timer: null,
    hours: 0,
    days: 0,
    
    areaToDisplay: "City",
    populationToDisplay: 0,
    deathsToDisplay: 0,
    destructionToDisplay: 0,
    followersToDisplay: {clerics: 0, zealots: 0},
    
    create: function(){
        this.newsLines = 2;
        this.news[0] = "Click in a district to place";
        this.news[1] = "your first cleric.";
    },
    renderTop: function(ctx){
        // Border
        ctx.strokeRect(5,5,490,95);

        // Date
        // Day
        ctx.textAlign="center";
        ctx.fillStyle = "rgb(196,189,223)";
        ctx.fillRect(10,10,55,85);
        ctx.fillStyle = "rgb(211,157,139)";
        ctx.fillRect(70,10,55,85);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.font = "normal 13pt Arial";
        ctx.fillText("DAY",37,30);
        ctx.fillText("HOUR",97,30);

        ctx.font = "normal 35pt Arial";
        ctx.fillText(this.days,37,80);
        ctx.fillText(this.hours,97,80);

        // news
        ctx.fillStyle = "rgb(187,203,242)";
        ctx.font = "normal 17.5pt Arial";
        if (this.newsLines === 1)
        {
            ctx.fillText(this.news[0],310,60);
        }
        else
        {
            ctx.fillText(this.news[0],310,45);
            ctx.fillText(this.news[1],310, 75);
        }
    },
    renderBottom: function(ctx){
        // Border
        ctx.strokeRect(5,455,490,100);

        ctx.textAlign="left";
        // Follower Info
        ctx.fillStyle = "rgb(238,236,185)";
        ctx.font = "bold 15pt Arial";
        ctx.fillText("Followers",15,480);
        ctx.font = "normal 13pt Arial";
        ctx.fillText("Clerics: " + this.followersToDisplay.clerics,15,505);
        ctx.fillText("Zealots: " + this.followersToDisplay.zealots,15,525);

        // Divider
        ctx.fillStyle = "rgb(183,134,170)";
        ctx.fillRect(135, 460, 1, 90);

        // Area Info
        ctx.fillStyle = "rgb(242,170,158)";
        ctx.font = "bold 15pt Arial";
        ctx.fillText(this.areaToDisplay,150,480);
        ctx.font = "normal 13pt Arial";
        ctx.fillText("Population: " + this.populationToDisplay,150,505);
        ctx.fillText("Deaths: " + this.deathsToDisplay,150,525);
        ctx.fillText("Destruction: " + this.destructionToDisplay,150,545);

        // Tech Button
        if ((Input.mousePosition.x > 370 && Input.mousePosition.x < 490 &&
            Input.mousePosition.y > 460 && Input.mousePosition.y < 550) && 
            !FireTech.show && !MainGame.gameOver)
        {
            ctx.fillStyle = "rgb(147,109,119)";
            ctx.fillRect(370,465,120,85);
            ctx.fillStyle = "rgb(229,199,207)";
            ctx.fillRect(370,460,120,86);
        }
        else
        {
            ctx.fillStyle = "rgb(109,72,80)";
            ctx.fillRect(370,465,120,85);
            ctx.fillStyle = "rgb(196,151,159)";
            ctx.fillRect(370,460,120,86);
        }

        ctx.fillStyle = "rgb(20,2,6)";
        ctx.font = "bold 18pt Arial";
        ctx.fillText("Influence",377,487);
        ctx.textAlign="center";
        ctx.font = "normal 16pt Arial";
        ctx.fillText("Points: " + FireTech.techPoints ,432,530);

    },
    render: function()
    {
        var ctx = document.getElementById(MainGame.currentState).getContext("2d");
        // Styles that wont change:
        ctx.strokeStyle = "rgb(183,134,170)";
        ctx.lineWidth = 1;

        this.renderTop(ctx);
        this.renderBottom(ctx);
    },
    displayEvent: function(newsEventLine1, newsEventLine2){
        this.newsLines = 1;
        this.news[0] = newsEventLine1;

        if (typeof newsEventLine2 !== "undefined")
        {
            this.newsLines = 2;
            this.news[1] = newsEventLine2;
        }
    },
    displayAreaInfo: function()
    {
        this.getAreaInfo();
    },
    getAreaInfo: function()
    {
        // look for selected region and give it's info
        // Only getting city info for now
        this.areaToDisplay = "City";
        this.populationToDisplay = GameMap.population;
        this.deathsToDisplay = GameMap.startingPopulation - GameMap.population;
        this.destructionToDisplay = GameMap.destruction;
        this.followersToDisplay = GameMap.numberOfFollowers;
        
        for (var district in GameMap.districts)
        {
            if (GameMap.districts[district].mouseOver)
            {
                this.areaToDisplay = GameMap.districts[district].name;
                this.populationToDisplay = GameMap.districts[district].population;
                this.deathsToDisplay = GameMap.districts[district].startingPopulation - GameMap.districts[district].population;
                this.destructionToDisplay = GameMap.districts[district].destruction;
                this.followersToDisplay = GameMap.districts[district].numberOfFollowers;
            }
        }
    },
    openTechTree: function(){
        if (!FireTech.show)
        {
            console.log("Open Tech Tree");
            FireTech.show = true;

            FireTech.open();
        }
    },
    updateCounter: function(){
        if (this.timer === null) 
        {
            this.timer = MainGame.timeNow();
        }
        else if(MainGame.timeNow() - this.timer >= GameMap.timePerHour)
        {
            this.timer = MainGame.timeNow();
            if (this.hours + 1 >= 24)
            {
                this.days++;
                this.hours = 0;
            }
            else
            {
                this.hours++;
            }
        }
    },
    deleteUI: function(){
        this.news = [];
        this.newsLines = 1;
        this.timer = null;
        this.hours = 0;
        this.days = 0;
    }
};