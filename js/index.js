class Component {
  constructor(source, x, y, width, height) {
    this.source = source;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.xVelocity = 0;
    this.yVelocity = 0;
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
    if(game.start) {
      game.clear();
      game.reset();
      road.draw();
      car.draw();
    }
  },
  clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },
  endGame(player, obstacles) {
    const end = obstacles.some(obstacle => player.collisionCheck(obstacle));
    if(end) {
      return true;
    }
  },
  points: 0,
  score(road) {
    const points = game.points;
    ctx.font = 'bold 20px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${points}`, 50, road.bottom() - 30);
  },
  gameOver() {
    ctx.font = 'bold 20px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`GAME OVER`, 50, road.bottom() - 40);
    ctx.fillText(`Score: ${game.points}`, 50, road.bottom() - 20);
  },
  frames: 0,
  level: 2,
  maxLevel: 8,
  levelUpCount : 0,
  start: true,
  reset() {
    obstacles = [];
    game.frames = 0;
    game.points = 0;
    game.level = 2;
    game.levelUpCount = 0;
    car = new Component('./images/car.png', canvas.width / 2 - 25, canvas.height - 150, 50, 100);
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

  if(game.frames % 120 === 0) {
    game.frames = 0;

    let obstacle = new Obstacle();
    game.points += 1 * (game.level - 1);

    game.levelUpCount++;
    if(game.levelUpCount === 4) {
      game.levelUpCount = 0;
      if(game.level < game.maxLevel) {
        game.level++;
      }
      if(game.level === Math.floor(game.maxLevel / 2)) {
        car.xVelocity += 4;
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

const gameLoop = () => {
  //game.clear();

  if(controller.left) {
    if(car.x > 40) {
      car.xVelocity -= 5;
      car.newPos();
      car.xVelocity = 0;
    }
  }
  if(controller.right) {
    if(car.x < road.width - 90) {
      car.xVelocity += 5;
      car.newPos();
      car.xVelocity = 0;
    }
  }

  if(game.endGame(car, obstacles)) {
    window.cancelAnimationFrame(request);
    game.gameOver();
    game.start = true;
    return;
  }

  road.draw();
  car.draw();
  updateObstacles();
  game.score(road);

  request = requestAnimationFrame(gameLoop);
};

window.onload = () => {
  document.addEventListener('keydown', controller.keyListener);
  document.addEventListener('keyup', controller.keyListener);

  document.getElementById('start-button').onclick = () => {
    game.startGame(car, road);
    if(game.start) {
      request = requestAnimationFrame(gameLoop);
      game.start = false;
    }
  };
};