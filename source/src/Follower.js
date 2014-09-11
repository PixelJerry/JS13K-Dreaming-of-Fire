var Follower = function(newClass)
{
	this.fireClass = newClass;
	this.alive = true;
};

Follower.prototype = {
	kill: function()
	{
		this.alive = false;
	}
};