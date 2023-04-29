window.addEventListener('click', function (e) {
  e.preventDefault();
  //canvas setup
  const mainpage = (document.querySelector('.txt').style.visibility = 'hidden');
  const canvas = document.querySelector('#canvas1');
  canvas.style.visibility = 'visible';
  const ctx = canvas.getContext('2d');
  canvas.width = 1200;
  canvas.height = 700;

  class InputHandler {
    constructor(game) {
      this.game = game;

      addEventListener('keydown', e => {
        if (
          (e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
          this.game.keys.indexOf(e.key) === -1
        ) {
          this.game.keys.push(e.key);
        } else if (e.key === ' ') {
          this.game.Player.shootTop();
        } else if (e.key === 'd') {
          this.game.debug = !this.game.debug;
        }
        console.log(this.game.keys);
      });
      addEventListener('keyup', e => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
        console.log(this.game.keys);
      });
    }
  }
  class SoundController {
    constructor() {
      this.powerUpSound = document.querySelector('#powerup');
      this.powerDownSound = document.querySelector('#powerdown');
      this.explosionSound = document.querySelector('#explosion');
      this.shotSound = document.querySelector('#shot');
      this.hitSound = document.querySelector('#hit');
    }
    powerUp() {
      this.powerUpSound.currentTime = 0;
      this.powerUpSound.play();
    }
    powerDown() {
      this.powerDownSound.currentTime = 0;
      this.powerDownSound.play();
    }
    explosion() {
      this.explosionSound.currentTime = 0;
      this.explosionSound.play();
    }
    shot() {
      this.shotSound.currentTime = 0;
      this.shotSound.play();
    }
    hit() {
      this.hitSound.currentTime = 0;
      this.hitSound.play();
    }
  }

  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 3;
      this.speed = 3;
      this.markedForDeletion = false;
      this.image = document.querySelector('#projectile');
    }
    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y);
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
      this.speedY = 0;
      this.maxSpeed = 10;
      this.Projectiles = [];
      this.image = document.querySelector('#player');
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;
    }
    update(deltaTime) {
      if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes('ArrowDown'))
        this.speedY = this.maxSpeed;
      else this.speedY = 0;
      this.y += this.speedY;
      // handle player boundaries
      if (this.y > this.game.height - this.height * 0.5)
        this.y = this.game.height - this.height * 0.5;
      else if (this.y < -this.height * 0.1) this.y = -this.height * 0.1;

      // handle projectiles
      this.Projectiles.forEach(projectile => {
        projectile.update();
      });
      this.Projectiles = this.Projectiles.filter(
        projectile => !projectile.markedForDeletion
      );
      // handle player animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
      // handle power up
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.frameY = 0;
          this.game.sound.powerDown();
        } else {
          this.powerUpTimer += deltaTime;
          this.frameY = 1;
          this.game.ammo += 0.1;
        }
      }
    }

    draw(context) {
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      this.Projectiles.forEach(projectile => {
        projectile.draw(context);
      });
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    shootTop() {
      if (this.game.ammo > 0) {
        this.Projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + -20)
        );
        this.game.ammo--;
      }
      this.game.sound.shot();
      if (this.powerUp) {
        this.shootMiddle();
      }
    }
    shootMiddle() {
      if (this.game.ammo > 0) {
        this.Projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 75)
        );
        this.game.ammo--;
      }
    }
    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;

      if (this.game.ammo < this.game.maxAmmo)
        this.game.ammo = this.game.maxAmmo;
      this.game.sound.powerUp();
    }
  }

  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.9 - 0.1;
      this.markedForDeletion = false;

      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }
    update() {
      this.x += this.speedX - this.game.speed;
      if (this.x + this.width < 0) this.markedForDeletion = true;
      // handle enemy animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else this.frameX = 0;
    }
    draw(context) {
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height);
        context.fillText(this.lives, this.x, this.y);
      }

      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      if (!this.game.debug) {
        context.font = '20px ccbiffbamboom';
      }
    }
  }

  class Enemy1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.querySelector('#enemy1');
      this.frameY = Math.floor(Math.random() * 1);
      this.lives = 5;
      this.score = this.lives;
    }
  }

  class Enemy2 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.querySelector('#enemy2');
      this.frameY = Math.floor(Math.random() * 1);
      this.lives = 6;
      this.score = this.lives;
    }
  }

  class SpecialEnemy extends Enemy {
    constructor(game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.querySelector('#special');
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 5;
      this.score = 15;
      this.type = 'special';
      this.speedX = Math.random() * -4.3 - 0.3;
    }
  }

  class Hive extends Enemy {
    constructor(game) {
      super(game);
      this.width = 400;
      this.height = 227;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.querySelector('#hive');
      this.frameY = 0;
      this.lives = 20;
      this.score = this.lives;
      this.type = 'hive';
      this.speedX = Math.random() * -1.5 - 0.1;
    }
  }

  class Rocks extends Enemy {
    constructor(game, x, y) {
      super(game);
      this.width = 115;
      this.height = 95;
      this.x = x;
      this.y = y;
      this.image = document.querySelector('#rocks');
      this.frameY = Math.floor(Math.random() * 5);
      this.lives = 3;
      this.score = this.lives;
      this.type = 'rocks';
      this.speedX = Math.random() * -4.2 - 0.5;
    }
  }

  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 700;
      this.x = 0;
      this.y = 0;
    }
    update() {
      if (this.x <= -this.width) this.x = 0;
      else this.x -= this.game.speed * this.speedModifier;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }

  class Background {
    constructor(game) {
      this.game = game;
      this.image1 = document.querySelector('#layer1');
      this.image2 = document.querySelector('#layer2');
      this.image3 = document.querySelector('#layer3');
      this.image4 = document.querySelector('#layer4');
      this.layer1 = new Layer(this.game, this.image1, 0.4);
      this.layer2 = new Layer(this.game, this.image2, 0.8);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 0);
      this.Layers = [this.layer1, this.layer2, this.layer3];
    }
    update() {
      this.Layers.forEach(layer => {
        layer.update();
      });
    }
    draw(context) {
      this.Layers.forEach(layer => {
        layer.draw(context);
      });
    }
  }

  class Explosion {
    constructor(game, x, y) {
      this.game = game;
      this.frameX = 0;
      this.spriteHeight = 200;
      this.spriteWidth = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = x - this.width * 0.5;
      this.y = y - this.height * 0.5;
      this.fps = 30; // frames per second (fps)
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.markedForDeletion = false;
      this.maxFrame = 8; // 8
    }
    update(deltaTime) {
      this.x -= this.game.speed;
      if (this.timer > this.interval) {
        this.frameX++;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
      if (this.frameX > this.maxFrame) this.markedForDeletion = true;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class smokeExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.querySelector('#smokeExplosion');
    }
  }

  class fireExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.querySelector('#fireExplosion');
    }
  }

  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = 'ccbiffbamboom';
      this.color = '#06FF00';
    }
    draw(context) {
      context.save();

      context.font = this.fontSize + 'px' + this.fontFamily;
      context.fillStyle = this.color;
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 2;
      context.shadowColor = '#FF0000';

      // score
      context.fillText(`SCORE:  ` + this.game.score, 20, 28);

      // game timer
      const formattedTime = (this.game.gameTime * 0.001).toFixed(2);
      context.fillText(`TIMER:  ` + formattedTime, 20, 88);
      // game over msg

      if (this.game.gameOver) {
        context.textAlign = 'center';
        let message1;
        let message2;
        if (this.game.score > this.game.winnigScore) {
          message1 = 'YOU  WIN!!! 🥇';
          message2 = 'Exceptional work';
        } else {
          message1 = 'YOU  LOSE!!! ';
          message2 = 'The worst loser ever  ';
        }
        context.font = '50px ' + this.fontFamily;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 35
        );
        context.font = '25px ' + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 35
        );
      }
      // ammo
      if (this.game.Player.powerUp) context.fillStyle = '#F900BF';
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 2;

      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 42, 3, 20);
      }
      context.restore();
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;

      this.background = new Background(this);
      this.Player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);

      this.sound = new SoundController(this);
      this.keys = [];
      this.enemies = [];
      this.explosions = [];
      this.enemiesTimer = 0;
      this.enemiesInterval = 2000;
      this.ammo = 20;
      this.maxAmmo = 50;
      this.ammoTimer = 0;
      this.ammoInterval = 350;
      this.gameOver = false;
      this.score = 0;
      this.winnigScore = 80;
      this.gameTime = 0;
      this.timeLimit = 35000;
      this.speed = 2;
      this.debug = false;
    }
    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime;
      if (this.gameTime > this.timeLimit) this.gameOver = true;
      this.background.update();
      this.background.layer4.update();

      this.Player.update(deltaTime);
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }
      this.explosions.forEach(explosion => explosion.update(deltaTime));
      this.explosions = this.explosions.filter(
        explosion => !explosion.markedForDeletion
      );
      this.enemies.forEach(enemy => {
        enemy.update();
        if (this.checkCollision(this.Player, enemy)) {
          enemy.markedForDeletion = true;
          this.addExplosion(enemy);
          this.sound.hit();

          if (enemy.type === 'special') this.Player.enterPowerUp();
          else if (!this.gameOver) this.score--;
        }
        this.Player.Projectiles.forEach(projectile => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;

            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              this.addExplosion(enemy);
              this.sound.explosion();
              if (enemy.type === 'hive') {
                for (let i = 0; i < 5; i++) {
                  this.enemies.push(
                    new Rocks(
                      this,
                      enemy.x + Math.random() * enemy.width,
                      enemy.y + Math.random() * enemy.height
                    )
                  );
                }
              }
              if (!this.gameOver) this.score += enemy.score;
              /*if (this.score > this.winnigScore) this.gameOver = true;*/
            }
          }
        });
      });
      this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
      if (this.enemiesTimer > this.enemiesInterval && !this.gameOver) {
        this.addEnemy();
        this.enemiesTimer = 0;
      } else {
        this.enemiesTimer += deltaTime;
      }
    }
    draw(context) {
      this.background.draw(context);

      this.Player.draw(context);

      this.enemies.forEach(enemy => {
        enemy.draw(context);
      });
      this.explosions.forEach(explosion => {
        explosion.draw(context);
      });
      this.background.layer4.draw(context);

      this.ui.draw(context);
    }
    addEnemy() {
      const randomEnemy = Math.random();
      if (randomEnemy < 0.3) this.enemies.push(new Enemy1(this));
      else if (randomEnemy < 0.6) this.enemies.push(new Enemy2(this));
      else if (randomEnemy < 0.7) this.enemies.push(new Hive(this));
      else this.enemies.push(new SpecialEnemy(this));
    }

    addExplosion(enemy) {
      const randomExplosion = Math.random();
      if (randomExplosion < 0.5) {
        this.explosions.push(
          new smokeExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
      } else {
        this.explosions.push(
          new fireExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
      }
    }

    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);

  let lastTime = 0;
  // animation loop
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(ctx);
    game.update(deltaTime);
    requestAnimationFrame(animate);
  }
  animate(0);
});
