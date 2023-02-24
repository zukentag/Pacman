const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const score = document.querySelector("#score");

// Similar ----> canvas.width = window.innerWidth;
canvas.width = innerWidth;
canvas.height = innerHeight;

// Class For Boundary
class Boundary {
  // Static Property of Boundary Class
  static height = 40;
  static width = 40;

  //Passsing arguments in a constructor through a object. In this we do not need to remember the order in which argumenst are passed
  // Basic Structure of Boundary
  constructor({ position, image }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.image = image;
  }

  //   // Drawing an individual boundary (square)
  //   draw() {
  //     c.fillStyle = "blue";
  //     c.fillRect(this.position.x, this.position.y, this.width, this.height);
  //   }

  // Drawing an individual boundary (square)
  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

// Class For Player
class Player {
  //Basic Structure of Player
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.radians = 0.75;
    this.operRate = 0.12;
    this.rotation = 0;
  }

  // Used to draw a circle
  draw() {
    //for Rotation we use save() and restore as golbal functions to only make changes to enclosed and and not the whole canvas
    c.save();

    // Changes the center of canvast to center of player
    c.translate(this.position.x, this.position.y);
    c.rotate(this.rotation);
    // Changes the center of canvast to original
    c.translate(-this.position.x, -this.position.y);

    c.beginPath();
    // For Chop animation
    c.arc(
      this.position.x,
      this.position.y,
      this.radius,
      this.radians,
      Math.PI * 2 - this.radians
    );
    c.lineTo(this.position.x, this.position.y);
    c.fillStyle = "yellow";
    c.fill();
    c.closePath();

    c.restore();
  }

  // For Movement of player
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    //Chop Animation
    if (this.radians < 0 || this.radians > 0.75) {
      this.operRate = -this.operRate;
    }
    this.radians += this.operRate;
  }
}

// Class For Pellet
class Pellet {
  //Basic Structure of Pellet
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
  }

  // Used to draw a circle
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "black";
    c.fill();
    c.closePath();
  }
}

// Class For Ghost
class Ghost {
  static speed = 2.5;
  //Basic Structure of Ghost
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = color;
    this.prevCollisions = [];
    this.speed = 2.5;
    this.scared = false;
  }

  // Used to draw a circle
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.scared ? "blue" : this.color;
    c.fill();
    c.closePath();
  }

  // For Movement of player
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// Class For Power Up
class PowerUp {
  //Basic Structure of Pellet
  constructor({ position }) {
    this.position = position;
    this.radius = 10;
  }

  // Used to draw a circle
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "blue";
    c.fill();
    c.closePath();
  }
}
const boundaries = [];
const pellets = [];
const powerUps = [];
const ghosts = [
  new Ghost({
    position: {
      x: Boundary.width * 10 + Boundary.width / 2,
      y: Boundary.height * 5 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed, // Reference from Ghost Class
      y: 0,
    },
  }),
  new Ghost({
    position: {
      x: Boundary.width * 11 + Boundary.width / 2,
      y: Boundary.height * 7 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed, // Reference from Ghost Class
      y: 0,
    },
  }),
  new Ghost({
    position: {
      x: Boundary.width * 10 + Boundary.width / 2,
      y: Boundary.height * 7 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed, // Reference from Ghost Class
      y: 0,
    },
  }),
];

const player = new Player({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: 0,
    y: 0,
  },
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastkey = "";
let tmpScore = 0;

// Basic Structure of game Boundary
const map = [
  [
    "1",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "2",
  ],
  [
    "|",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    "b",
    ".",
    "[",
    "7",
    "]",
    ".",
    "[",
    "]",
    ".",
    "b",
    ".",
    "[",
    "]",
    ".",
    "[",
    "7",
    "]",
    ".",
    "b",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    ".",
    ".",
    ".",
    "_",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    "_",
    ".",
    ".",
    ".",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    "[",
    "]",
    ".",
    ".",
    ".",
    "b",
    ".",
    "1",
    "-",
    ".",
    "-",
    "2",
    ".",
    "b",
    ".",
    ".",
    ".",
    "[",
    "]",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    ".",
    ".",
    ".",
    "^",
    "p",
    ".",
    ".",
    "|",
    ".",
    ".",
    ".",
    "|",
    ".",
    ".",
    ".",
    "^",
    ".",
    ".",
    ".",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    "b",
    ".",
    "[",
    "+",
    "]",
    ".",
    "[",
    "+",
    ".",
    "b",
    ".",
    "+",
    "]",
    ".",
    "[",
    "+",
    "]",
    ".",
    "b",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    ".",
    ".",
    ".",
    "_",
    ".",
    ".",
    ".",
    "|",
    ".",
    ".",
    ".",
    "|",
    ".",
    ".",
    ".",
    "_",
    ".",
    ".",
    ".",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    "[",
    "]",
    ".",
    ".",
    ".",
    "b",
    ".",
    "4",
    "-",
    ".",
    "-",
    "3",
    ".",
    "b",
    ".",
    ".",
    ".",
    "[",
    "]",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    ".",
    ".",
    ".",
    "^",
    ".",
    ".",
    ".",
    ".",
    ".",
    "p",
    ".",
    ".",
    ".",
    ".",
    ".",
    "^",
    ".",
    ".",
    ".",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    "b",
    ".",
    "[",
    "5",
    "]",
    ".",
    "[",
    "]",
    ".",
    "b",
    ".",
    "[",
    "]",
    ".",
    "[",
    "5",
    "]",
    ".",
    "b",
    ".",
    "|",
  ],
  [
    "|",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    ".",
    "p",
    "|",
  ],
  [
    "4",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "3",
  ],
];

// Create Different html image element of differnt boundary elements
function createImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeHorizontal.png"),
          })
        );
        break;
      case "|":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeVertical.png"),
          })
        );
        break;
      case "1":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner1.png"),
          })
        );
        break;
      case "2":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner2.png"),
          })
        );
        break;
      case "3":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner3.png"),
          })
        );
        break;
      case "4":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner4.png"),
          })
        );
        break;
      case "b":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/block.png"),
          })
        );
        break;
      case "[":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capLeft.png"),
          })
        );
        break;
      case "]":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capRight.png"),
          })
        );
        break;
      case "_":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capBottom.png"),
          })
        );
        break;
      case "^":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capTop.png"),
          })
        );
        break;
      case "+":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeCross.png"),
          })
        );
        break;
      case "5":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorTop.png"),
          })
        );
        break;
      case "6":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorRight.png"),
          })
        );
        break;
      case "7":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorBottom.png"),
          })
        );
        break;
      case "8":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeConnectorLeft.png"),
          })
        );
        break;
      case ".":
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
          })
        );
        break;
      case "p":
        powerUps.push(
          new PowerUp({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
          })
        );
        break;
    }
  });
});

// Check Collision between circle and rectangle boundary
function checkColissionWithBoundary({ circle, rectangle }) {
  // Empty space between circle boundary and square boundary
  const padding = Boundary.width / 2 - circle.radius - 1;
  return (
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x - padding &&
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y - padding &&
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  );
}

function toggleScreen(id, toggle) {
  let element = document.getElementById(id);
  let display = toggle ? "block" : "none";
  element.style.display = display;
}

// To stop Animation
let animationID;

// Animation Loop
function animate() {
  //toggle
  this.toggleScreen("startScreen", false);
  this.toggleScreen("canvas", true);
  // console.log(animationID);
  // Funtion Thats keep repeating on loop
  animationID = requestAnimationFrame(animate);
  // console.log(animationID);

  //To clear out previos state animation
  c.clearRect(0, 0, canvas.width, canvas.height);

  // if 'w is pressed move upwards
  if (keys.w.pressed && lastkey === "w") {
    //check all boundary to see if colllision is not hapenning and then move upward
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        checkColissionWithBoundary({
          circle: {
            //inorder to update property within player we use spread(...) operator to update velocity property within player
            ...player,
            velocity: {
              x: 0,
              y: -5,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = -5;
      }
    }
  } else if (keys.a.pressed && lastkey === "a") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        checkColissionWithBoundary({
          circle: {
            ...player,
            velocity: {
              x: -5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = -5;
      }
    }
  } else if (keys.s.pressed && lastkey === "s") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        checkColissionWithBoundary({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: 5,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = 5;
      }
    }
  } else if (keys.d.pressed && lastkey === "d") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        checkColissionWithBoundary({
          circle: {
            ...player,
            velocity: {
              x: 5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = 5;
      }
    }
  }

  // Draw  Power Ups
  // we need to ise a backward for loop in order to prevent flash as pellets are shifted while removing them from splice() method

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.draw();

    // Collision btw player and Powerup
    if (
      Math.hypot(
        powerUp.position.x - player.position.x,
        powerUp.position.y - player.position.y
      ) <
      powerUp.radius + player.radius
    ) {
      powerUps.splice(i, 1);

      // Make Ghost Scared
      ghosts.forEach((ghost) => {
        ghost.scared = true;
        setTimeout(() => {
          ghost.scared = false;
        }, 5000);
      });
    }
  }

  // Draw all Pellets
  // we need to ise a backward for loop in order to prevent flash as pellets are shifted while removing them from splice() method

  for (let i = pellets.length - 1; i >= 0; i--) {
    const pellet = pellets[i];
    pellet.draw();

    //Check Colission between player and pellet(circle and circel)
    if (
      Math.hypot(
        pellet.position.x - player.position.x,
        pellet.position.y - player.position.y
      ) <
      pellet.radius + player.radius
    ) {
      pellets.splice(i, 1); //The splice() method adds and/or removes array elements. The splice() method overwrites the original array.Syntax array.splice(index, howmanyToRemove, item1, ....., itemX)
      tmpScore += 10;
      score.innerHTML = tmpScore;
    }
  }

  // Collision detection btw ghost and player
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const ghost = ghosts[i];
    if (
      Math.hypot(
        ghost.position.x - player.position.x,
        ghost.position.y - player.position.y
      ) <
      ghost.radius + player.radius
    ) {
      if (ghost.scared) {
        ghosts.splice(i, 1);
      } else {
        cancelAnimationFrame(animationID);
        // playSound("wrong");
        swal({
          title: "Opps! You Lost ",
          text: "Score:" + score.innerHTML,
          icon: "warning",
          button: "Retry!",
        }).then(function () {
          window.location.reload(true);
          animate();
          // c.clearRect(0, 0, canvas.width, canvas.height);
          // animate();
        });
      }
    }
  }

  //Win Condition
  if (pellets.length === 0) {
    cancelAnimationFrame(animationID);
    swal({
      title: "Victory!",
      text: "High Score:" + score.innerHTML,
      icon: "success",
      button: "Retry!",
    }).then(function () {
      window.location.reload(true);
    });
  }

  boundaries.forEach((boundary) => {
    //Creating Boundary
    boundary.draw();

    //#########################
    //Collision Detection : Loop through every boundary and check if their is a colition btw any boundary and player
    if (
      checkColissionWithBoundary({
        circle: player,
        rectangle: boundary,
      })
    ) {
      player.velocity.y = 0;
      player.velocity.x = 0;
    }
    //########################
  });

  // Creating Player
  player.update();

  ghosts.forEach((ghost) => {
    ghost.update();

    const collisions = [];
    boundaries.forEach((boundary) => {
      if (
        !collisions.includes("right") &&
        checkColissionWithBoundary({
          circle: {
            ...ghost,
            velocity: {
              x: ghost.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("right");
      }
      if (
        !collisions.includes("left") &&
        checkColissionWithBoundary({
          circle: {
            ...ghost,
            velocity: {
              x: -ghost.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("left");
      }
      if (
        !collisions.includes("up") &&
        checkColissionWithBoundary({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: -ghost.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("up");
      }
      if (
        !collisions.includes("down") &&
        checkColissionWithBoundary({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: ghost.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("down");
      }
    });
    if (collisions.length > ghost.prevCollisions.length)
      ghost.prevCollisions = collisions;

    if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
      // console.log(collisions);
      // console.log(ghost.prevCollisions);
      // console.log("12");

      if (ghost.velocity.x > 0) {
        ghost.prevCollisions.push("right");
      } else if (ghost.velocity.x < 0) {
        ghost.prevCollisions.push("left");
      } else if (ghost.velocity.y > 0) {
        ghost.prevCollisions.push("down");
      } else if (ghost.velocity.y < 0) {
        ghost.prevCollisions.push("up");
      }
      const pathWays = ghost.prevCollisions.filter((collision) => {
        return !collisions.includes(collision);
      });

      // console.log({ pathWays });

      const direction = pathWays[Math.floor(Math.random() * pathWays.length)];

      // console.log(direction);

      switch (direction) {
        case "right":
          ghost.velocity.x = ghost.speed;
          ghost.velocity.y = 0;

          break;
        case "left":
          ghost.velocity.x = -ghost.speed;
          ghost.velocity.y = 0;
          break;
        case "up":
          ghost.velocity.y = -ghost.speed;
          ghost.velocity.x = 0;
          break;
        case "down":
          ghost.velocity.y = ghost.speed;
          ghost.velocity.x = 0;
          break;
      }
      ghost.prevCollisions = [];
    }
  });

  // Assigning Rotation Value to Player

  if (player.velocity.x > 0) player.rotation = 0;
  else if (player.velocity.x < 0) player.rotation = Math.PI;
  else if (player.velocity.y > 0) player.rotation = Math.PI / 2;
  else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5;
}

// Event Listner for keydown
addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = true;
      lastkey = "w";
      break;

    case "a":
      keys.a.pressed = true;
      lastkey = "a";
      break;

    case "s":
      keys.s.pressed = true;
      lastkey = "s";
      break;

    case "d":
      keys.d.pressed = true;
      lastkey = "d";
      break;
  }
});

// Event Listner for keyup
addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = false;
      break;

    case "a":
      keys.a.pressed = false;
      break;

    case "s":
      keys.s.pressed = false;
      break;

    case "d":
      keys.d.pressed = false;
      break;
  }
});

// Start Screen -> Start Game
function startGame() {
  animate();
}
