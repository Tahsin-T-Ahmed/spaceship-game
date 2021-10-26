class Ship {
    constructor(health, speed, gun, boost, type) {
        this.health = health;
        this.speed = speed;
        this.gun = gun;
        this.boost = boost;
        this.type = type;
        this.fuelLimit = 100;
        this.fuel = this.fuelLimit;
        this.maxHealth = health;
        this.velocity = this.speed;
        this.isMoving = {
            x: false,
            y: false
        };
    } //end Ship constructor
} //end Ship class

class Bullet {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.size = width/40;
        this.done = false;
    } //end Bullet constructor
    
    show() {
        fill(0,255,0);
        ellipse(this.x, this.y, this.size * player.gun);

        this.y -= height/16;

        //SETUP BULLET FOR TERMINATION
        if (this.y <= 0) {
            this.done = true;
        }
    } //end Bullet.show()
} //end Bullet class

class Player {
    constructor(ship) {
        for (let prop in ship) {
            this[prop] = ship[prop];
        }
    } //end Player constructor
} //end Player class

class Consumable {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = width/20;
        this.pulseSpeed = 1;
        this.color = {
            r: 255,
            g: 255,
            b: 255
        };
        this.done = false;
    } //end Consumable constructor

    isWithinRange() {
        if ( dist(this.x, this.y, player.x, player.y) <= (this.size/2 + player.width) ) {
            this.done = true;
            return true;
        } else {
            return false;
        }
    }

    show() {
        this.setColor();
        fill(
            this.color.r,
            this.color.g,
            this.color.b
        );
        noStroke();
        ellipse(this.x, this.y, this.size);

        this.y += 10;

        this.size += this.pulseSpeed;

        if (this.size >= width/15 || this.size <= width/20) {
            this.pulseSpeed *= -1;
        }
        
        //SETUP CONSUMPTION BY PLAYER
        if (this.isWithinRange()) {
            this.applyBuff();
        }

    } //end Consumable.show()
} //end Consumable class

class GunBuff extends Consumable {
    setColor() {
        this.color = {
            r: 0,
            g: 255,
            b: 0
        };
    } //end GunBuff.setColor()

    applyBuff() {
        player.gun++;
    } //end GunBuff.applyBuff()
} //end GunBuff class

class SpeedBuff extends Consumable {
    setColor() {
        this.color = {
            r: 0,
            g: 0,
            b: 255
        };
    } //end SpeedBuff.setColor()

    applyBuff() {
        player.boost++;
    } //end SpeedBuff.applyBuff()
} //end SpeedBuff class

class HealBuff extends Consumable {
    setColor() {
        this.color = {
            r: 255,
            g: 0,
            b: 0
        };
    } //end HealBuff.setColor()

    applyBuff() {
        if (player.maxHealth - player.health >= 2) {
            player.health += 2;
        } else {
            player.health = player.maxHealth;
        }
    } //end HealBuff
} //end HealBuff class

let asteroid = {
    chance: 1,
    chanceIncrement: 0.00001,
    speed: 1,
    speedIncrement: 0.0001,
};

class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = asteroid.size;
        this.health = 5;
        this.color = {
            r: 255,
            g: 255,
            b: 255
        };
        this.damage = 2;
        this.done = false;
    } //end Obstacle constructor
    
    detectBullets() {
        for (var i=0; i < player.bullets.length; i++) {
            if (dist(this.x, this.y, player.bullets[i].x, player.bullets[i].y) <= (this.size/2 + player.bullets[i].size/2)) {
                this.health -= player.bullets[i].damage;
                player.bullets[i].done = true;
            }
        }
    } //end Obstacle.detectBullets()

    detectPlayer() {
        if (dist(this.x, this.y, player.x, player.y) <= (this.size/2 + player.width)) {
            player.health -= this.damage;
            this.done = true;
        }
    }

    show() {
        fill(
            this.color.r,
            this.color.g,
            this.color.b
        );
        noStroke();

        ellipse(this.x, this.y, this.size);
        this.y += asteroid.speed;

        //INCREASE DIFFICULTY
        //INCREASE ASTEROID CHANCE
        //INCREASE ASTEROID SPEED
        asteroid.speed += asteroid.chanceIncrement;
        asteroid.chance += asteroid.speedIncrement;


        this.detectBullets();
        this.detectPlayer();

        if (this.health <= 0) {
            this.done = true;
        }
    } //end Obstacle.show()
} //end Obstacle class

let obstacles = [];

let roster = [
    new Ship(5, 5, 0, 0, "Standard"),
    new Ship(3, 5, 1, 0, "Blaster"),
    new Ship(5, 3, 0, 1, "Blazer")
];
  
let menu = {},
    player,
    playerScore = 0,
    isPlaying = false;

let HUD = {
    showHealth: function() {
        noStroke();
        fill(255, 0, 0);
        rect(
            0,
            height-player.height*2,
            width/10 * player.health,
            player.height
        );
    }, //end HUD.showHealth()

    showFuel: function() {
        noStroke();
        fill(0,0,255);
        rect(
          0,
          height - player.height,
          width/200 * player.fuel,
          player.height  
        );
    }, //end HUD.showFuel()

    showScore: function() {
        noStroke();
        fill(0);
        rect(
            width/2,
            height - player.height,
            width/2,
            player.height
        );

        fill(255);
        textAlign(CENTER);
        text(
            parseInt(playerScore),
            width/2,
            height - player.height,
            width/2,
            player.height
        );
    },
    
    display: function() {
        this.showHealth();
        this.showFuel();
        this.showScore();
    } //end HUD.display()
}; //end HUD

let consumables = [];

function setup() {
    createCanvas(400,600);

    menu.textSize = height/15;

    menu.charButtons = [];
    for (let i=0; i < roster.length; i++) {
        menu.charButtons[i] = {
            x: width/6 + ((width/3) * i),
            y: height/3 * 1.5,
            diameter: width/5,
            rep: roster[i],

            show: function() {
                //GENERATE BUTTON
                if ( dist(mouseX, mouseY, this.x, this.y) <= this.diameter/2 ) {
                    fill(200, 0, 0);                    
                    this.active = true;
                } else {
                    fill(0);
                    this.active = false;
                }

                textSize(menu.textSize / 1.5);
                text(this.rep.type, this.x, this.y-this.diameter);

                ellipse(this.x, this.y, this.diameter);

                //DISPLAY LEVEL
                text(`Lv: ${this.rep.health+this.rep.speed+this.rep.gun+this.rep.boost}`, this.x, this.y+this.diameter);

                //DISPLAY STATS
                let statIterator = 1;
                for (var stat in this.rep) {
                    if (stat != 'type') {
                        textSize(menu.textSize / 2);
                        text(
                            `${stat}: ${this.rep[stat]}`.toUpperCase(),
                            this.x,
                            this.y + (this.diameter + this.diameter/2 * statIterator)
                        );
                    }

                    statIterator++;
                } //end for in
                
            } //end charButtons.show()
        } //end charButtons
    } //end for loop

    menu.show = function(playerScore = 0) {
        background(200);
        noStroke();

        //CENTER ALL MENU TEXT
        textAlign(CENTER);

        //IF PLAYER SCORE EXISTS, SHOW IT
        if (playerScore != 0) {
            textSize(this.textSize);
            fill(150, 0, 0);
            text(
                'Score: ' + parseInt(playerScore),
                (width/2),
                height/5
            );
        }

        //SHOW CHARACTER BUTTONS
        for (let b=0; b < this.charButtons.length; b++) {
            this.charButtons[b].show();
        }
    }; //end menu.show()
} //end setup()

function mouseClicked() {
    //WHEN MOUSE IS CLICKED

    if (false == isPlaying) {
        //CHECK FOR SELECTED CHARACTER
        for (let btn in menu.charButtons) {
            if (menu.charButtons[btn].active == true) {
                //GOT CHARACTER
                //CHARACTER CLICKED -- CLICKED CHARACTER
                
                //IN CASE OF RESPAWN, RESET ALL STATS AND VARIABLES
                //SET SCORE TO ZERO, IN CASE PLAYER IS RESPAWNING
                playerScore = 1;
                consumables = [];

                //SETUP OBSTACLES
                asteroid.size = width/8;
                asteroid.columns = [];

                //RESET OBSTACLES
                obstacles = [];

                for (var c=0; c < 8; c++) {
                    asteroid.columns[c] = (width/8 * c) + asteroid.size/2;
                }

                console.log(asteroid.columns);

                //SETUP PLAYER FOR LAUNCH
                player = new Player(menu.charButtons[btn].rep);
                player.x = width/2;
                player.y = height/5*4;
                player.width = width/20;
                player.height = height/20;

                //SET PLAYER COLORS
                switch(player.type) {
                    case 'Blaster':
                        player.color = {
                            body: {
                                r: 210,
                                g: 150,
                                b: 0,
                            },

                            bound: {
                                r: 0,
                                g: 250,
                                b: 0
                            }
                        };
                        break;

                    case 'Blazer':
                        player.color = {
                            body: {
                                r: 210,
                                g: 210,
                                b: 0,
                            },

                            bound: {
                                r: 255,
                                g: 0,
                                b: 0,
                            }
                        };
                        break;

                    default:
                        player.color = {
                            body: {
                                r: 255,
                                g: 255,
                                b: 255,
                            },

                            bound: {
                                r: 150,
                                g: 150,
                                b: 150,
                            }
                        };
                } //end switch

                player.show = function() {
                    //DISPLAY PLAYER
                    fill(
                        player.color.body.r,
                        player.color.body.g,
                        player.color.body.b
                    ); //SPACESHIP COLOR
                    noStroke();
                    triangle(
                        player.x, player.y-player.height/2, //SPACESHIP TIP
                        player.x-player.width/2, player.y+player.height/2, //SPACESHIP LEFT WING
                        player.x+player.width/2, player.y+player.height/2 //SPACESHIP RIGHT WING
                    );

                    //DISPLAY PLAYER BOUND
                    noFill();
                    stroke(
                        player.color.bound.r,
                        player.color.bound.g,
                        player.color.bound.b
                    );
                    ellipse(player.x, player.y, player.height + player.width);
                };
                
                player.bullets = [];

                player.play = function() {

                    //LOCOMOTION

                    //PRESSED 'W' KEY
                    if (keyIsDown(87) && player.y-(player.height+player.width)/2 > 0) {
                        player.y -= player.velocity;
                        player.isMoving.y = true;
                    }
                    //PRESSED 'S' KEY
                    else if (keyIsDown(83) && player.y+(player.height+player.width)/2 < height-player.height*2) {
                        player.y += player.velocity;
                        player.isMoving.y = true;
                    } 
                    else {
                        player.isMoving.y = false;
                    }
                
                    //PRESSED 'D' KEY
                    if (keyIsDown(68) && player.x+(player.height+player.width)/2 < width) {
                        player.x += player.velocity;
                        player.isMoving.x = true;
                    }
                    //PRESSED 'A' KEY
                    else if (keyIsDown(65) && player.x-(player.height+player.width)/2 > 0) {
                        player.x -= player.velocity;
                        player.isMoving.x = true;
                    }
                    else {
                        player.isMoving.x = false;
                    }
                    
                    //PRESSED 'SHIFT' KEY -- WHILE PLAYER IS MOVING
                    //ENABLE BOOST
                    if (keyIsDown(SHIFT) && (player.isMoving.x || player.isMoving.y) && player.fuel) {
                        if (player.boost) {
                            player.velocity = player.speed + 4;
                        }

                        if (1 == player.boost) {
                            player.fuel--;
                        }
                    } else {
                        player.velocity = player.speed;
                    }

                    //REGEN FUEL
                    //IF PLAYER IS NOT BOOSTING AND FUEL IS BELOW LIMIT
                    //IF PLAYER VELOCITY IS EQUAL TO BASE SPEED
                    if (player.velocity == player.speed && player.fuel < player.fuelLimit) {
                        if (player.fuel != 0 || !keyIsDown(SHIFT)) {
                            player.fuel++;
                        }
                    }
                } //end player.play()

                //LAUNCH GAME
                isPlaying = true;
            } //end if
        } //end for in
    }
} //end mouseClicked()

function showAll(array) {
    for (var i=0; i < array.length; i++) {
        array[i].show();

        if (array[i].done) {
            array.splice(i, 1);
        }
    }
} //end showAll()

function PlayGame() {
    background(0);
    player.show();
    player.play();
    playerScore += 0.1;

    //SHOW PLAYER BULLETS
    showAll(player.bullets);

    //SETUP CONSUMABLES
    //SETUP HEALBUFF
    if (random(100) < 0.1) {
        consumables.push(new HealBuff(random(width), 0));
    }

    if (random(100) < 0.1) {
        consumables.push(new SpeedBuff(random(width), 0));
    }

    if (random(100) < 0.1) {
        consumables.push(new GunBuff(random(width), 0));
    }

    //SHOW CONSUMABLES
    showAll(consumables);

    //SHOW OBSTACLES
    if (random(100) < asteroid.chance) {
        obstacles.push(new Obstacle(
            random(asteroid.columns),
            0,
            asteroid.speed
        )
    );
    }
    showAll(obstacles);
    
    HUD.display();

    if (player.health <= 0) {
        isPlaying = false;
    }
} //end PlayGame()

function keyPressed() {

    //WHEN IN-GAME
    if (isPlaying) {
        
        //IF COMMA IS PRESSED (REGISTER ONCE -- AS TAP)
        if (188 == keyCode) {

            //IF PLAYER HAS "GUN" AND NO BULLETS ARE ON SCREEN
            if (player.gun && 0 == player.bullets.length) {
                //SHOOT BULLET
                player.bullets.push(new Bullet(player.x, player.y, player.gun));
            } //end BULLET / GUN CONDITION
        } //end COMMA KEYCODE

        if (UP_ARROW == keyCode) {
            consumables.push(new GunBuff(width/2, 0));
        }

        if (LEFT_ARROW == keyCode) {
            consumables.push(new SpeedBuff(width/4, 0));
        }

        if (RIGHT_ARROW == keyCode) {
            consumables.push(new HealBuff(width/4 * 3, 0));
        }

        if (DOWN_ARROW == keyCode) {
            obstacles.push(new Obstacle(width/2, 0));
        }

        if (ESCAPE == keyCode) {
            isPlaying = false;
        }
        
    } //end isPlaying condition
} //end keyPressed()

function draw() {

    if (false == isPlaying) {
        menu.show(playerScore);
    } else {
        PlayGame();
    }
} //end draw()