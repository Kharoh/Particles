const [canvas, ctx] = createCanvas()
let particles = []

const particleNumber = 200
const frequency = 10
let frame = 0
const maxFrame = 50

class Particle {
  constructor(canvas) {
    const random = Math.random()
    this.canvas = canvas;

    this.x = window.innerWidth / 2 + (Math.random() * window.innerWidth / 8 - Math.random() * window.innerWidth / 8)
    this.y = window.innerHeight / 2 + (Math.random() * window.innerHeight / 4 - Math.random() * window.innerHeight / 4)

    this.s = 0.8 + Math.random() * 0.6;
    this.a = Math.random() * 6

    this.w = window.innerWidth
    this.h = window.innerHeight
    this.radius = random * 5
    this.color = ["#f3abfd", "#8bc3f7", "#f8ed93", "#abfdb9"][Math.floor(Math.random() * 4)]
  }

  filterProximityParticles() {
    return particles.filter(particle => Math.abs(particle.x - this.x) && Math.abs(particle.x - this.x) < 250 && Math.abs(particle.y - this.y) && Math.abs(particle.y - this.y) < 250)
  }

  render() {
    this.canvas.beginPath();
    this.canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.canvas.lineWidth = 2;
    this.canvas.fillStyle = this.color;
    this.canvas.fill();
    this.canvas.closePath();
  }

  move() {
    const proximityParticles = this.filterProximityParticles()
    let attractedY = proximityParticles.reduce((acc, particle) => {
      return acc += particle.y
    }, this.y)
    attractedY /= proximityParticles.length + 1

    let attractedX = proximityParticles.reduce((acc, particle) => {
      return acc += particle.x
    }, this.x)
    attractedX /= proximityParticles.length + 1

    this.x += Math.cos(this.a) * this.s + (attractedX - this.x) * 0.05;
    this.y += Math.sin(this.a) * this.s + (attractedY - this.y) * 0.05;
    this.a += Math.random() * 0.8 - 0.4;

    if ((this.x < 0 || this.x > this.w - this.radius) || (this.y < 0 || this.y > this.h - this.radius))
      return false

    this.render()
    return true
  }
}

function createNewParticles(n) {
  /* Add the new particles */
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      particles.push(new Particle(ctx))
    }, frequency * i)
  }

  /* Return the length */
  return particles.length
}

function createCanvas() {
  /* Create the element */
  const canvas = document.createElement('canvas')

  /* Set the canvas width and height */
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  /* Append the element to the body */
  document.querySelector('body').append(canvas)

  /* Return the canvas and the context */
  return [canvas, canvas.getContext('2d')]
}

function clear() {
  /* Create the gradient */
  const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width)
  gradient.addColorStop(0, "rgba(18,18,18,0.1)")
  gradient.addColorStop(1, "rgba(18,18,18,0.1)")

  /* Add the gradient to the canvas */
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function update() {
  /* Clear the background */
  clear()

  /* Move the particles and remove the ones outside the board */
  particles = particles.filter(particle => particle.move())

  /* Recreate destroyed particles */
  if (particles.length && particles.length < particleNumber) createNewParticles(particleNumber - particles.length)

  /* Set the next update */
  frame++
  if (frame < maxFrame) requestAnimationFrame(update)
}

createNewParticles(particleNumber)
update()
