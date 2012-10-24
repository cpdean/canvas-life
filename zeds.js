var Zeds = function() {
    var z = this;  // reference to the Game
    z.canvas = document.getElementById('board');
    z.ctx = z.canvas.getContext("2d");
    z.canvas.width = 600;
    z.canvas.height = 400;
    z.FPS = 5;

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

    Agent.prototype.distance = function(otherAgent) {
        var x_d, y_d;
        x_d = (this.x - otherAgent.x);
        x_d = x_d * x_d;
        y_d = (this.y- otherAgent.y);
        y_d = y_d * y_d;
        var d = Math.abs(x_d + y_d);
        return Math.sqrt(d);
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
        var squirrel = this;
        Agent.call(this,x,y);
        this.color = "#994";
        this.setup_next_action = function() {
            //Squirrels are pretty food driven...
 
            // ARE YOU GON DIE??
            if (this.hunger <= 0) {
                this.next_action = this.death;
            }

            // CAN YOU EAT???
            var food = z.mushrooms();
            var touching_food = _.filter(food, function(f) {
                var touch_distance = squirrel.width;
                return touch_distance >= squirrel.distance(f);
            });
            if (touching_food.length > 0) {
                // return a function that will eat the food
                this.next_action = this.next_eat(touching_food[0]);
            }

            // WHERE IS NEAREST FOOD???
            var sorted_foods = _.sortBy(food, function(f) {
                return squirrel.distance(f);
            });
            
            if (sorted_foods.length > 0) {
                // return a function to move to the nearest food
                this.next_action = this.move_to(food[0]);
            }
            else {
                this.next_action = this.no_action;
            }

        };

        this.next_eat = function(food_agent) {
            // eat the food, removing it from the game
            return this;
        };

        this.move_to = function(food_agent) {
            // returns a function that updates the position of
            // this agent, moving it as close as possible to
            // the food agent
            var new_x,new_y;
            function vector_to(food) {
                return {x :  food.x - squirrel.x,
                        y :  food.y - squirrel.y};
            }

            function scalar_multiply(vector,scalar) {
                var v = {};
                v.x = vector.x * scalar;
                v.y = vector.y * scalar;
                return v;
            }

            function get_magnitude(vector){
                var origin = new Agent(0,0);
                var to = new Agent(vector.x,vector.y);
                return origin.distance(to);
                //lol
            }

            function get_unit_vector(vector) {
                var v = {};
                var m = get_magnitude(vector);
                m = 1/m;
                return scalar_multiply(vector, m);
            }

            function apply_vector(agent, movement) {
                agent.x += movement.x;
                agent.y += movement.y;
            }

            var vector_to_food = vector_to(food_agent);
            var normalized = get_unit_vector(vector_to_food);
            var movement = scalar_multiply(normalized, this.movement_speed);

            return function() {
                //actually update position
                apply_vector(squirrel, normalized);
                return squirrel;
            };
        };

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
        this.width = this.height = 6;
        this.hunger_decay = -20;
        var default_mushroom_color = "#ddd";
        this.color = default_mushroom_color;

        this.setup_next_action = function() {
            if (this.hunger < 30) {
                this.color = "#f00";
            }
            else {
                this.color = default_mushroom_color;
            }
            if (this.hunger >= 200) {
                this.next_action = this.reproduce;
            }
            else {
                this.next_action = this.no_action;
            }
        };


        this.reproduce = function() {

            this.hunger = 1;
            return this; //neuter
            var x = Math.random() * z.canvas.width;
            var y = Math.random() * z.canvas.height;
            var m = new Mushroom(x,y);

            // prevent new mushroom from getting added
            // to the game if it's near another
            var there_is_nearby_fungus = false;

            var fungus_agents = z.mushrooms();

            there_is_nearby_fungus = _.any(fungus_agents, function(fung){
                var too_close = 100;
                dist = m.distance(fung);
                return dist < too_close;
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

    z.mushrooms = function() {
        return _.filter(z.agents, function(a){
            return a instanceof Mushroom;
        });
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
        z.agents.push(new Squirrel(30,100));
        //z.agents.push(new Squirrel(10,10));
        //z.agents.push(new Zombie(300,100));
        z.loop = setInterval(z.game_loop, 1000 / z.FPS);
    };

    z.stop = function() {
        clearInterval(z.loop);
    };

    return z;
};
