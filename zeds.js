var Zeds = function() {
    var z = this;  // reference to the Game
    z.canvas = document.getElementById('board');
    z.ctx = z.canvas.getContext("2d");
    z.canvas.width = 600;
    z.canvas.height = 400;
    z.FPS = 10;

    var Agent = function(x,y) {
        this.x = x;
        this.y = y;
        this.width = this.height = 10;

        this.hunger = 100;
        this.hunger_decay = 1;

        this.strength = 2;
        this.health = 10;
        this.movement_speed = 10;
        this.attack_speed = 10;
        this.intelligence = 1;
        this.color = "#eee";

        this.next_action = this.no_action;
    };

    Agent.prototype.draw = function() {
        var half_w = this.width / 2;
        var half_h = this.height / 2;
        z.ctx.fillStyle = this.color;
        z.ctx.fillRect(this.x-half_w, this.y-half_h,
                       this.width, this.height);

    };

    Agent.prototype.take_turn = function() {
        this.apply_hunger();
        this.setup_next_action();
    };

    Agent.prototype.apply_hunger = function() {
        this.hunger -= this.hunger_decay;
    };

    Agent.prototype.setup_next_action = function() {
        if (this.hunger <= 0) {
            this.next_action = this.death;
        }
    };

    Agent.prototype.no_action = function() {
        return this;
    };

    Agent.prototype.death = function() {
        return new Dead(this);
    }


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

    var Mushroom = function(x,y) {
        mushroom = this;
        Agent.call(this,x,y);
        this.width = this.height = 10;
        this.hunger_decay = -5;
        var default_mushroom_color = "#ddd";
        this.color = default_mushroom_color;
        this.setup_next_action = function() {
            if (this.hunger < 10) {
                this.color = "#f00";
            }
            else {
                this.color = default_mushroom_color;
            }
            if (this.hunger >= 200) {
                this.next_action = this.reproduce;
            }
            if (this.hunger > 250) {
                console.log("uh oh");
            }
        };

        this.reproduce = function() {

            this.hunger = 1;
            var x = Math.random() * z.canvas.width;
            var y = Math.random() * z.canvas.height;
            var m = new Mushroom(x,y);

            // prevent new mushroom from getting added
            // to the game if it's near another
            var there_is_nearby_fungus = false;

            var fungus_agents = _.filter(z.agents, function(a){
                return a instanceof Mushroom;
            });

            there_is_nearby_fungus = _.any(fungus_agents, function(fung){
                var too_close = 100;
                var x_d, y_d, distance;
                x_d = (m.x - fung.x);
                x_d = x_d * x_d;
                y_d = (m.y - fung.y);
                y_d = y_d * y_d;
                distance = Math.sqrt(x_d * y_d);
                return distance < too_close;
            });

            if(!there_is_nearby_fungus){
                z.agents.push(m);
            }

            return this;
        };
    };
    Mushroom.prototype = new Agent();

    var Dead = function(original) {
        console.log(original + " died!");
        this.x = original.x;
        this.y = original.y;
        this.width = original.width;
        this.height = original.height;

        this.death = function () {
            // delete
        }

        this.color = "#444";
    };
    Dead.prototype = new Agent();


    z.draw_environment = function() {
        z.ctx.fillStyle = "#332";
        z.ctx.fillRect(0,0,z.canvas.width,z.canvas.height);
    };

    z.game_loop = function() {
        z.ctx.clearRect(0,0,z.canvas.width,z.canvas.height);
        z.draw_environment();
        for(var i in z.agents) {
            z.agents[i].draw();
            z.agents[i].take_turn();
            z.agents[i] = z.agents[i].next_action();
        }
        // garbage collect
        z.agents = _.filter(z.agents,function(a){ return a; });
    };

    z.start = function() {
        //background
        z.agents = [];
        z.agents.push(new Mushroom(30,30));
        z.agents.push(new Squirrel(100,100));
        //z.agents.push(new Squirrel(10,10));
        //z.agents.push(new Zombie(300,100));
        z.loop = setInterval(z.game_loop, 1000 / z.FPS);
    };

    z.stop = function() {
        clearInterval(z.loop);
    };

    return z;
};
