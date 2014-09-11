var Game = function(documetElement)
{
    this.stageWidth = 500;
    this.stageHeight = 560;
    this.elementID = documetElement;
    
    this.currentState = null;
    this.states = [];
    
    this.lastUpdate = new Date().getTime();
    this.lastFrameTime = 1000 / 60;
    this.secondTimer = null;

    this.gameStarted = false;
    this.gameOver = false;
    
    this.onGameCreationRun();
};

Game.prototype = {
    onGameCreationRun : function()
    {
        console.log ("Getting everything ready behind the scenes");
        
        document.getElementById("GameHere").style.width = this.stageWidth.toString() + "px";
        document.getElementById("GameHere").style.height = this.stageHeight.toString() + "px";
        
        Input.addKeyboardListeners();
    },
    create : function(){
        this.gameOver = false;
        // Bakcground image that will not change will be drawn on this layer
        if (document.getElementById("mainBackground") === null)
        {
            createCanvas(this.stageWidth, this.stageHeight, "mainBackground", this.elementID);
        }
        // Render the background on this canvas
        if (document.getElementById("background") === null)
        {
            createCanvas(this.stageWidth, this.stageHeight, "background", this.elementID);
        }

        // Main Game Rendered here
        createCanvas(this.stageWidth, this.stageHeight, this.currentState, this.elementID);
        
        this.states[this.currentState].create();
        if (!this.gameStarted)
        {
            GameLoop();
            this.gameStarted = true;
        }
    },
    input : function(){
        if (typeof this.states[this.currentState].input === 'function')
        {
            this.states[this.currentState].input();
        }
    },
    update : function(){
        this.calculateLastFrameTime();
        if (typeof this.states[this.currentState].update === 'function')
        {
            this.states[this.currentState].update();
        }
    },
    render : function(){
        // Clearing the prev frame
        document.getElementById(this.currentState).width = this.stageWidth;
        
        // Rendering the current scene
        if (typeof this.states[this.currentState].render === 'function')
        {
            this.states[this.currentState].render();
        }

        GameMap.animateRiver();
    },
    deleteState: function()
    {
        deleteCanvas(this.currentState);
        deleteCanvas("background");
        deleteCanvas("mainBackground");

        if (typeof this.states[this.currentState] !== "undefined") // will be on first run
        {
            if (typeof this.states[this.currentState].deleteState === 'function')
            {
                this.states[this.currentState].deleteState();
            }
        }
    },
    addState : function (stateName, state)
    {
        for (var index in this.states)
        {
            if (index === stateName)
            {
                console.log ("ERROR: State " + index + " already added to the game.");
                return;
            }
        }
        
        this.states[stateName] = state;
    },
    startState : function(stateName){
        for (var state in this.states)
        {
            if (state === stateName)
            {
                console.log ("Starting " + state + " game state.");
                
                Input.removeMouseListeners(this.currentState);
                this.deleteState();
                this.currentState = stateName;
                this.create();
                Input.addMouseListeners(this.currentState);
                
                return;
            }
        }
        
        console.log (stateName + " is not a game state, or it is the current state.");
    },
    clearBackground: function()
    {
        document.getElementById("background").width = this.stageWidth;
    },
    calculateLastFrameTime: function()
    {
        var timeNow = new Date().getTime();
        this.lastFrameTime = timeNow - this.lastUpdate;
        if (this.lastFrameTime > 1000)
        {
            this.lastFrameTime = 60 / 1; //Just incase the player leaves the game open while in another tab
        }
        this.lastUpdate = timeNow;
    },
    timeNow: function()
    {
        return this.lastUpdate;
    }
};