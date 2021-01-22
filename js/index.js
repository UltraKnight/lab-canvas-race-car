class Component {
  constructor(source, x, y, width, height) {
    this.source = source;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.boost = 0;
  }

  draw(source = this.source, x = this.x, y = this.y, width = this.width, height = this.height) {
    let image = new Image();
    image.src = source;
    image.onload = () => { ctx.drawImage(image, x, y, width, height); };
  }

  newPos() {
    this.x += this.xVelocity;
  }

  left() { return this.x; }
  right() { return this.x + this.width; }
  top() { return this.y; }
  bottom() { return this.y + this.height; }

  
  collisionCheck(obstacle) {
    return !(this.bottom() < obstacle.top() ||
    this.top() > obstacle.bottom() ||
    this.right() < obstacle.left() ||
    this.left() > obstacle.right());
  }
}

class Obstacle extends Component {
  constructor() {
    let minW = 30;
    let maxW = road.width - car.width - 150;
    let height = 20;
    let width = Math.floor(Math.random() * (maxW - minW + 1) + minW);
    let x = Math.floor(Math.random() * (road.width - 20 - width) + 10);

    super('', x, road.top(), width, height);
  }

  create(x = this.x, y = this.y, w = this.width, h = this.height) {
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, w, h);
  }
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let car = new Component('./images/car.png', canvas.width / 2 - 25, canvas.height - 150, 50, 100);
let road = new Component('./images/road.png', 0, 0, canvas.width, canvas.height);
let obstacles = [];
let request;

const game = {
  startGame: function(car, road) {
      window.cancelAnimationFrame(request);
      game.clear();
      game.reset();
      road.draw();
      car.draw();
      request = requestAnimationFrame(gameLoop);
    },
  clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },
  endGame(player, obstacles) {
    const end = obstacles.some(obstacle => player.collisionCheck(obstacle));
    if(end) {
      if(game.points > game.hiPoints) {
        game.hiPoints = game.points;
      }
      return true;
    }
  },
  points: 0,
  hiPoints: 0,
  score(road) {
    const points = game.points;
    ctx.font = 'bold 20px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${points}`, 50, road.bottom() - 30);
  },
  highScore(road) {
    const points = game.hiPoints;
    ctx.font = 'bold 20px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`Best Score: ${points}`, road.right() - 200, road.bottom() - 30);
  },
  gameOver() {
    ctx.font = 'bold 20px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`GAME OVER`, 50, road.bottom() - 40);
    ctx.fillText(`Score: ${game.points}`, 50, road.bottom() - 20);
  },
  frames: 0,
  level: 1,
  maxLevel: 8,
  levelUpCount : 0,
  reset(level = 2, boost = 0) {
    obstacles = [];
    game.frames = 0;
    game.points = 0;
    game.level = level;
    game.levelUpCount = 0;
    car = new Component('./images/car.png', canvas.width / 2 - 25, canvas.height - 150, 50, 100);
    car.boost = boost;
  }
};

function updateObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].yVelocity = game.level;
    obstacles[i].y += obstacles[i].yVelocity;
    obstacles[i].create(obstacles[i].x, obstacles[i].y);

    if(obstacles[i].top() > road.bottom()) {
      obstacles.splice(i, 1);
    }
  }

  game.frames++;
  
  if(game.frames % 5 === 0) {
    roadY *= -1;
  }

  if(game.frames % 120 === 0) {
    game.frames = 0;
    let obstacle = new Obstacle();
    game.points += 1 * (game.level - 1);

    game.levelUpCount++;
    if(game.levelUpCount === 4) {
      game.frames += 20;
      game.levelUpCount = 0;
      if(game.level < game.maxLevel) {
        game.level++;
      } else {
        game.frames += 50;
      }
      if(game.level === Math.floor(game.maxLevel / 2)) {
        car.boost += 4;
      }
    }
    obstacle.create();
    obstacles.push(obstacle);
  }
}

const controller = {
  left: false,
  right: false,
  keyListener(e) {
    let state = (e.type === 'keydown') ? true : false;
    switch (e.code) {
      case 'ArrowLeft':
        controller.left = state;
        break;
    
      case 'ArrowRight':
        controller.right = state;
        break;
    }
  }
};
let roadY = 10;
const gameLoop = () => {
  //game.clear();

  if(controller.left) {        
    if(car.x > 40) {
      car.xVelocity -= 5 + car.boost;
      car.newPos();
      car.xVelocity = 0;
    }
  }
  if(controller.right) {
    if(car.x < road.width - 90) {
      car.xVelocity += 5 + car.boost;
      car.newPos();
      car.xVelocity = 0;
    }
  }

  if(game.endGame(car, obstacles)) {
    window.cancelAnimationFrame(request);
    game.gameOver();
    return;
  }
  
  road.draw(this.source, this.x, roadY);
  car.draw();
  updateObstacles();
  game.score(road);
  game.highScore(road);

  request = requestAnimationFrame(gameLoop);
};

window.onload = () => {
  document.addEventListener('keydown', controller.keyListener);
  document.addEventListener('keyup', controller.keyListener);

  document.getElementById('start-button').onclick = () => {
    game.startGame(car, road);
  };
};