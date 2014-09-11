var Input = {
    mouseOffset: new Point(0, 0),
    mousePosition: new Point(0, 0),
    mouseHexaGridPos: new Point(0, 0),
    mouseOver: false,
    createInput: function() {
        console.log("Creating input.");

        this.addMouseListeners(MainGame.currentState);
    },
    addMouseListeners: function(canvasID)
    {
        console.log ("Adding mouse listiners to " + canvasID);
        if (canvasID === null || document.getElementById(canvasID) === null)
        {
            return;
        }

        document.getElementById(canvasID).addEventListener('click', this.onClick, false);
        document.getElementById(canvasID).addEventListener('mouseover', this.onMouseOver, false);
        document.getElementById(canvasID).addEventListener('mouseout', this.onMouseOut, false);
        document.getElementById(canvasID).addEventListener('mousemove', this.updateMousePosition, false);
    },
    removeMouseListeners: function(canvasID)
    {
        console.log ("Removing mouse event listiners from " + canvasID);
        if (canvasID === null || document.getElementById(canvasID) === null)
        {
            return;
        }
        
        document.getElementById(canvasID).removeEventListener('click', this.onClick, false);
        document.getElementById(canvasID).removeEventListener('mouseover', this.onMouseOver, false);
        document.getElementById(canvasID).removeEventListener('mouseout', this.onMouseOut, false);
        document.getElementById(canvasID).removeEventListener('mousemove', this.updateMousePosition, false);
    },
    addKeyboardListeners: function()
    {
        document.addEventListener('keyup', this.keyUp, false);

    },
    removeKeyboardListeners: function()
    {
        document.removeEventListener('keyup', this.keyUp, false);

    },
    onClick: function(event){
        if (typeof MainGame.states[MainGame.currentState].onClick !== "undefined")
        {
            MainGame.states[MainGame.currentState].onClick();
        }
    },
    updateMousePosition: function(event){
        if (Input.mouseOver)
        {
            Input.mousePosition.x = event.clientX  - Input.mouseOffset.x;
            Input.mousePosition.y = event.clientY - Input.mouseOffset.y;
            Input.mouseHexaGridPos = HexagonalGridSystem.pixelCoordToGridCoord(Input.mousePosition, GameMap.gridCenter);
        }
    },
    onMouseOver: function(){
        Input.mouseOver = true;
        Input.calculateOffset();
    },
    onMouseOut: function(){
        Input.mouseOver = false;
    },
    calculateOffset: function(){
        this.mouseOffset.x = document.getElementById(MainGame.currentState).offsetLeft;
        this.mouseOffset.y = document.getElementById(MainGame.currentState).offsetTop;
    },
    keyUp: function(event)
    {
        console.log ("Keycode: " + event.keyCode);
        if (event.keyCode === 27) // Esc Key
        {
            console.log ("Esc key released");
            if (FireTech.show)
            {
                FireTech.close();
            }
            else
            {
                MainGame.startState("mainMenu");
            }
        }
    }
};