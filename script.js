window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';


class Player {
    constructor(game) {
        this.game = game;
        this.collisionX = this.game.width * 0.5;
        this.collisionY = this.game.height * 0.5;
        this.collisionRadius = 30;
        this.speedX = 0;
        this.speedY = 0;
        this.dx = 0; //distance between mouse and player X axis
        this.dy = 0; //distance between mouse and player Y axis
        this.speedModfier = 5;
        this.image = document.getElementById('bull');
        this.spriteWidth = 255;
        this.spriteHeight = 255;
        this.width = this.spriteWidth;
        this.height = this.spriteHeight;
        this.spriteX = this.collisionX - this.width * 0.5;
        this.spriteY = this.collisionY - this.height * 0.5;
        this.frameX = 2;
        this.frameY = 1;
    }

    draw(context) {
        context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
        context.beginPath();
        context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
        context.save(); //save-restore block
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();

        context.beginPath();
        context.moveTo(this.collisionX, this.collisionY);
        if (game.mouse.pressed) {
            context.lineTo(this.game.mouse.x, this.game.mouse.y);
        } else {
            context.lineTo(this.collisionX, this.collisionY);
        }
       
        context.stroke();
        
    }

    update() {
        if (this.game.mouse.pressed) {

        //sprite animation
        this.dx = this.game.mouse.x - this.collisionX;
        this.dy = this.game.mouse.y - this.collisionY;
 
        const angle = Math.atan2(this.dy, this.dx);
        console.log(angle)
        if (angle < -2.74 || angle > 2.74) this.frameY = 6;
        else if (angle < -1.96) this.frameY = 7;
        else if (angle < -1.17) this.frameY = 0;
        else if (angle < -0.39) this.frameY = 1;
        else if (angle < 0.39) this.frameY = 2;
        else if (angle < 1.17) this.frameY = 3;
        else if (angle < 1.96) this.frameY = 4;
        else if (angle < 2.74) this.frameY = 5;
        const distance = Math.hypot(this.dy, this.dx);
        
        if (distance > this.speedModfier) { //prevent shaking on char stop
            this.speedX = this.dx / distance || 0;
            this.speedY = this.dy / distance || 0;
        } else {
            this.speedX = 0;
            this.speedY = 0;
        }
        
        this.collisionX += this.speedX * this.speedModfier;
        this.collisionY += this.speedY * this.speedModfier;
        this.spriteX = this.collisionX - this.width * 0.5;
        this.spriteY = this.collisionY - this.height * 0.5 - 100;

        //collision with obstacles
        this.game.obsticles.forEach(obstacle => {
            let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle);
            if (collision) {
                const unit_x = dx / distance;
                const unit_y = dy / distance;
                this.collisionX = obstacle.collisionX + sumOfRadii * unit_x;
                this.collisionY = obstacle.collisionY + sumOfRadii * unit_y;
            }
        })
        }
    }
}

class Obstacle{
    constructor(game) {
        this.game = game;
        this.collisionX = Math.random() * this.game.width;
        this.collisionY = Math.random() * this.game.height;
        this.collisionRadius = 60;
        this.image = document.getElementById('obstacles');
        this.spriteWidth = 250;
        this.spriteHeight = 250;
        this.width = this.spriteWidth;
        this.height = this.spriteHeight;
        this.spriteX = this.collisionX - this.width * 0.5;
        this.spriteY = this.collisionY - this.height * 0.5 - 70;
        this.frameX = Math.floor(Math.random() * 4);
        this.frameY = Math.floor(Math.random() * 3);
    }

    draw(context) {
        context.drawImage(this.image, this.spriteWidth * this.frameX, this.spriteHeight * this.frameY, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
        context.beginPath();
        context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
        context.save(); //save-restore block
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();

    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.player = new Player(this);
        this.numberOfObsticles = 10;
        this.topMargin = 260;
        this.obsticles = [];
        this.mouse = {
            x: this.width * 0.5, //default values
            y: this.height * 0.5,
            pressed: false
        }
        //offset is on the target element/node in html element
        canvas.addEventListener('mousedown', e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
  
            this.mouse.pressed = true;
        });

        canvas.addEventListener('mouseup', e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
            this.mouse.pressed = false;
        });

        
        canvas.addEventListener('mousemove', e => {

            if (this.mouse.pressed) {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
            }

        });
    }

    render(context) {
        this.player.draw(context);
        this.player.update();
        this.obsticles.forEach(obs => obs.draw(context))
    }

    checkCollision(a, b) {
        const dx = a.collisionX - b.collisionX;
        const dy = a.collisionY - b.collisionY;
        const distance = Math.hypot(dy, dx);
        const sumOfRadius = a.collisionRadius + b.collisionRadius;
        return [(distance < sumOfRadius), distance, sumOfRadius, dx, dy];
    }

    initObsticles() {
        let attempts = 0;
        while (this.obsticles.length < this.numberOfObsticles && attempts < 500) {
            let testObsticale = new Obstacle(this);
            let drawObsticle = true;
            this.obsticles.forEach(obstical => {
                const dx = testObsticale.collisionX - obstical.collisionX;
                const dy = testObsticale.collisionY - obstical.collisionY;
                const distance = Math.hypot(dy, dx);
                const distanceBuffer = 100;
                if (distance <= obstical.collisionRadius + testObsticale.collisionRadius + distanceBuffer) {
                    drawObsticle = false;
                }
            })

            let drawHorisontalLeft = testObsticale.spriteX > 0;
            let drawHorisontalRight = testObsticale.spriteX < this.width - testObsticale.width;
            let drawVerticalTop = testObsticale.collisionY > this.topMargin + testObsticale.collisionRadius * 2;
            let drawVerticalBottom = testObsticale.collisionY < this.height - testObsticale.collisionRadius * 2;
            if (drawObsticle && drawHorisontalLeft && drawHorisontalRight && drawVerticalTop && drawVerticalBottom) {
                this.obsticles.push(testObsticale);
            }
            attempts++;

        }

    }
}

    const game = new Game(canvas); //create game obj
    game.initObsticles();
    console.log(game)

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate); //update animation frame
    }

    animate(); //calling of the function itself

})