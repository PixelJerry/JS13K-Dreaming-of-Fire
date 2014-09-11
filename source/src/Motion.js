var Motion = {
    animationLoop: function(objectToAnimate, valueToFadeTo, fadeFunction, endAction, time)
    {
        if (objectToAnimate.requestId)
        {
            window.cancelAnimationFrame(objectToAnimate.requestId);
            objectToAnimate.requestId = undefined;
        }

        objectToAnimate.animating = true;

        var start = null;

        function step()
        {
            var progress;

            if (start === null)
            {
                start = MainGame.timeNow();
            }
            progress = MainGame.timeNow() - start;

            // ANIMATION IN HERE
            fadeFunction();

            if (progress < time)
            {
                // Animation incomplete
                objectToAnimate.requestId = requestAnimation(step);
            }
            else
            {
                // Animation complete
                objectToAnimate.animating = false;
                objectToAnimate[endAction](valueToFadeTo);
                window.cancelAnimationFrame(objectToAnimate.requestId);
                objectToAnimate.requestId = undefined;
            }
        }

        objectToAnimate.requestId = requestAnimation(step);
    },
    fadeTileColourTo: function(tileToFade, colourToFadeTo, time)
    {
        if (typeof time === "undefined")
        {
            time = 400;
        }

        var adjustmentRGB = rgbStringToInt(tileToFade.getFill());
        var startRGB = rgbStringToInt(tileToFade.getFill());
        var endRGB = rgbStringToInt(colourToFadeTo);

        function colourFade()
        {
            adjustmentRGB.r += Math.round(Motion.adjustValue(startRGB.r, endRGB.r, time));
            adjustmentRGB.g += Math.round(Motion.adjustValue(startRGB.g, endRGB.g, time));
            adjustmentRGB.b += Math.round(Motion.adjustValue(startRGB.b, endRGB.b, time));
            
            tileToFade.setFill(rgbIntToString(adjustmentRGB));
        }
        
        this.animationLoop(tileToFade, colourToFadeTo, colourFade, "setFill", time);
    },
    adjustValue: function(startValue, endValue, time)
    {
        return (endValue - startValue) * (MainGame.lastFrameTime / time);
    }
};