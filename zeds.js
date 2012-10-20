var Zeds = function() {
    var z = this;  // reference to the Game
    z.canvas = document.getElementById('board');
    z.ctx = z.canvas.getContext("2d");
    z.canvas.width = 600;
    z.canvas.height = 400;

    var Agent = function(x,y) {
        this.x = x;
        this.y = y;
        this.width = this.height = 10;

        this.hunger = 100;

        this.strength = 2;
        this.health = 10;
        this.movement_speed = 10;
        this.attack_speed = 10;
        this.intelligence = 1;
        this.color = "#eee";
    };

    Agent.prototype.draw = function() {
        var half_w = this.width / 2;
        var half_h = this.height / 2;
        z.ctx.fillStyle = this.color;
        z.ctx.fillRect(this.x-half_w, this.y-half_h,
                       this.width, this.height);

    };

    var Squirrel = function(x,y) {
        Agent.call(this,x,y);
        this.color = "#994";
    };
    Squirrel.prototype = new Agent();

    var Zombie = function(x,y) {
        Agent.call(this,x,y);
        this.color = "#488";
    };
    Zombie.prototype = new Agent();


    z.start = function() {
        //background
        z.ctx.fillStyle = "#332";
        z.ctx.fillRect(0,0,z.canvas.width,z.canvas.height);
        z.agents = [];
        z.agents.push(new Agent(30,30));
        z.agents.push(new Squirrel(10,10));
        z.agents.push(new Zombie(300,100));
        for(var i in z.agents){
            var a = z.agents[i];
            a.draw();
        }
    };

    return z;
};
