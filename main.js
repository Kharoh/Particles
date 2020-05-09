const width = document.querySelector('body').clientWidth
const height = document.querySelector('body').clientHeight
let isAttachedToMouse = true
let [posX, posY] = [width / 2, height / 2]

const [canvas, ctx] = createCanvas()
let particles = []
let currentParticleAmount = 0
const particleNumber = 400

const globalSpeed = 0.4

const frequency = 10
let attractivity = 6 / 100 * globalSpeed
const temperature = 20 * globalSpeed
const directionModifier = 4 / globalSpeed

const maxFrame = -1
let frame = 0

class Particle {
  constructor(canvas) {
    const random = Math.random()
    this.canvas = canvas;

    this.x = width / 2 + (Math.random() * width / 8 - Math.random() * width / 8)
    this.y = height / 2 + (Math.random() * height / 4 - Math.random() * height / 4)

    this.speed = (0.8 + Math.random() * 0.6) * temperature;
    this.direction = Math.random() * Math.PI * 2
    this.attractiveness = Math.random() * 1 // how much the particule attracts other particules, negative means it repulses
    this.attractedness = Math.random() * 2 // how much the particule is attracted to other particules

    this.radius = random * 5
    this.color = ["#f3abfd", "#8bc3f7", "#f8ed93", "#abfdb9"][Math.floor(Math.random() * 4)]
  }

  filterProximityParticles() {
    return particles.filter(particle => Math.abs(particle.x - this.x) && Math.abs(particle.x - this.x) < 1000 && Math.abs(particle.y - this.y) && Math.abs(particle.y - this.y) < 1000)
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
    const totalAttractiveness = proximityParticles.reduce((acc, particle) => particle.attractiveness > 0 ? acc += particle.attractiveness : acc, 0)
    const totalRepulsiveness = proximityParticles.reduce((acc, particle) => particle.attractiveness < 0 ? acc += particle.attractiveness : acc, 0)

    const effectiveAttractivity = attractivity > 0 ? attractivity : 0

    /* Create a pondered mean between all the neighbour particles positions and their attractiveness */
    const [attractedX, attractedY] = proximityParticles
      .reduce(([accX, accY], particle) => {
        return particle.attractiveness > 0 ?
          [
            accX += particle.x * particle.attractiveness,
            accY += particle.y * particle.attractiveness
          ]
          : [accX, accY]
      }, [this.x + posX * particleNumber / 6, this.y + posY * particleNumber / 6])
      .map((attracted, index) => {
        attracted /= totalAttractiveness + 1 + particleNumber / 6
        if (index === 0) return attracted - this.x
        if (index === 1) return attracted - this.y
      })

    this.x += Math.cos(this.direction) * this.speed
      + attractedX * effectiveAttractivity
    this.y += Math.sin(this.direction) * this.speed
      + attractedY * effectiveAttractivity

    this.direction += Math.random() * Math.PI / directionModifier - Math.PI / (directionModifier * 2);

    if ((this.x < 0 || this.x > width - this.radius) || (this.y < 0 || this.y > height - this.radius)) {
      currentParticleAmount -= 1
      return false
    }

    this.render()
    return true
  }
}

function createNewParticles() {
  const particlesToBeGenerated = particleNumber - currentParticleAmount

  /* Add the new particles */
  for (let i = 0; i < particlesToBeGenerated; i++) {
    currentParticleAmount++
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
  canvas.width = width
  canvas.height = height

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
  createNewParticles()

  /* Set the next update */
  frame++
  if (maxFrame === -1 || frame < maxFrame) requestAnimationFrame(update)
}

createNewParticles(particleNumber)
update()

window.addEventListener('wheel', event => {
  attractivity += Math.sign(event.deltaY) / 100
})

function mousemoveHandler(event) {
  posX = event.pageX
  posY = event.pageY
}

window.addEventListener('mousemove', mousemoveHandler)

window.addEventListener('click', event => {
  if (isAttachedToMouse) {
    window.removeEventListener('mousemove', mousemoveHandler)
    posX = width / 2
    posY = height / 2
    isAttachedToMouse = !isAttachedToMouse
  }

  else {
    posX = event.pageX
    posY = event.pageY
    window.addEventListener('mousemove', mousemoveHandler)
    isAttachedToMouse = !isAttachedToMouse
  }
})
