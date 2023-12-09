// board
let board
let boardWidth = 700
let boardHeight = 900
let context

// mario
let marioWidth = 100
let marioHeight = 100
let marioX = 10
let marioY = 400
let marioImage

let mario = {
  x: marioX,
  y: marioY,
  width: marioWidth,
  height: marioHeight,
}

// shells
let shellArray = []
let shellWidth = 80
let shellHeight = 80
let shellX = boardWidth
let shellY = 820

let spikeShellImg
let greenShellImg

//physics
let velocityX = -2 //negative because we want to move left
let velocityY = 0 // drive speed
let gravity = 0.25 // downward pull
let placeShellsEnabled = true

let gameOver = false
let score = 0

window.onload = function () {
  board = document.getElementById('board')
  board.height = boardHeight
  board.width = boardWidth
  context = board.getContext('2d') //used for drawing on the board

  //draw mario
  // context.fillStyle = 'red'
  // context.fillRect(mario.x, mario.y, mario.width, mario.height)

  //load images
  marioImage = new Image()
  marioImage.src = '/img/mario.png'
  marioImage.onload = function () {
    context.drawImage(marioImage, mario.x, mario.y, mario.width, mario.height)
  }

  spikeShellImg = new Image()
  spikeShellImg.src = '/img/spike-shell.png'

  greenShellImg = new Image()
  greenShellImg.src = '/img/green-shell.png'

  requestAnimationFrame(update)
  setInterval(placeShells, 1500) //place shells every 1.5 seconds
  document.addEventListener('keydown', moveMario)
  document.addEventListener('keydown', function (e) {
    if (e.code === 'KeyS') {
      placeShellsEnabled = !placeShellsEnabled // Toggle the flag
    }
  })
}

// Save the score to local storage
function saveScore() {
  const highScore = localStorage.getItem('highScore')
  if (highScore === null || score > parseInt(highScore)) {
    localStorage.setItem('highScore', score.toString())
  }
}

// Retrieve the score from local storage
function getHighScore() {
  const highScore = localStorage.getItem('highScore')
  if (highScore === null) {
    return 0
  }
  return parseInt(highScore)
}

function update() {
  requestAnimationFrame(update)

  if (gameOver) {
    saveScore() // Save the score to local storage

    // Display the high score
    const highScore = getHighScore()
    context.fillStyle = 'black'
    context.font = '30px Impact'
    context.fillText(`High Score: ${highScore}`, 250, 300)

    return
  }
  context.clearRect(0, 0, board.width, board.height)

  // mario
  velocityY += gravity
  mario.y = Math.min(Math.max(mario.y + velocityY, 400), 800)
  context.drawImage(marioImage, mario.x, mario.y, mario.width, mario.height)

  // shells
  for (let i = 0; i < shellArray.length; i++) {
    let shell = shellArray[i]
    shell.x += velocityX

    // Check if the shell has been hit by Mario
    if (!shell.passed && mario.x > shell.x + shell.width) {
      score += 1
      shell.passed = true
    }

    // Check for collision
    if (detectCollision(mario, shell, 30)) {
      // Increase circle radius and stroke thickness
      shell.radius = shell.radius || 40
      shell.strokeThickness = shell.strokeThickness || 5

      shell.radius += 1 // Adjust as needed
      shell.strokeThickness += 0.5 // Adjust as needed

      context.beginPath()
      context.arc(
        shell.x + shell.width / 2,
        shell.y + shell.height / 2,
        shell.radius,
        0,
        2 * Math.PI
      )
      context.strokeStyle = 'red'
      context.lineWidth = shell.strokeThickness
      context.stroke()

      // Set gameOver when a collision occurs
      gameOver = true
    } else {
      // Draw the shell without a circle
      context.drawImage(shell.img, shell.x, shell.y, shell.width, shell.height)
    }

    // Clear Shells that are off the screen
    while (shellArray.length > 0 && shellArray[0].x < -shellWidth) {
      shellArray.shift() // remove first element from array
    }
  }

  // Score
  context.fillStyle = 'white'
  context.font = '45px sans-serif'
  context.fillText(score, 20, 50)

  // High Score
  const highScore = getHighScore()
  context.fillStyle = 'white'
  context.font = '25px sans-serif'
  context.fillText(`High Score:  ${highScore}`, 20, 100)

  if (gameOver) {
    context.fillStyle = 'black'
    context.font = '130px Impact'
    context.fillText('Game Over', 100, 200)
    context.font = '30px Impact'
    context.fillText('Press Space or ^ arrow to Restart', 120, 250)
  }
}

function placeShells() {
  if (gameOver) {
    return
  }

  // Check if placing shells is enabled
  if (!placeShellsEnabled) {
    return
  }

  let randomShellY = 400 + Math.random() * (820 - 400)

  let randomShell = Math.floor(Math.random() * 2)

  let shell

  if (randomShell < 0.5) {
    shell = {
      img: spikeShellImg,
      x: shellX,
      y: randomShellY,
      width: shellWidth,
      height: shellHeight,
      passed: false,
    }
  } else {
    shell = {
      img: greenShellImg,
      x: shellX,
      y: randomShellY,
      width: shellWidth,
      height: shellHeight,
      passed: false,
    }
  }

  shellArray.push(shell)
}

function moveMario(e) {
  if (e.code == 'Space' || e.code == 'ArrowUp' || e.code == 'KeyX') {
    // jump
    velocityY = -4

    // reset game

    if (gameOver) {
      mario.y = marioY
      mario.x = marioX
      shellArray = []
      gameOver = false
      score = 0
    }
  }
  if (e.code === 'ArrowDown') {
    mario.y += 10
  }
  if (e.code === 'ArrowLeft') {
    mario.x -= 20
  }
  if (e.code === 'ArrowRight') {
    mario.x += 20
  }
}

function detectCollision(a, b, margin) {
  return (
    a.x + margin < b.x + b.width &&
    a.x + a.width - margin > b.x &&
    a.y + margin < b.y + b.height &&
    a.y + a.height - margin > b.y
  )
}
