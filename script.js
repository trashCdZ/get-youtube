const REPO_URL = 'https://github.com/flowseal/zapret-discord-youtube'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const getCanvas = () => document.getElementById('particles')

const createParticle = (width, height) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  vx: (Math.random() - 0.5) * 0.35,
  vy: (Math.random() - 0.5) * 0.35,
  radius: Math.random() * 1.8 + 0.4,
  hue: Math.random() > 0.5 ? 218 : 262,
  alpha: Math.random() * 0.55 + 0.15
})

const resizeCanvas = (canvas) => {
  if (!canvas) return null
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(window.innerWidth * dpr)
  canvas.height = Math.floor(window.innerHeight * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

const initParticles = () => {
  const canvas = getCanvas()
  if (!canvas) return
  if (prefersReducedMotion()) return

  let ctx = resizeCanvas(canvas)
  if (!ctx) return

  const isMobile = window.innerWidth < 640
  let particles = Array.from({ length: isMobile ? 45 : 90 }, () =>
    createParticle(window.innerWidth, window.innerHeight)
  )

  const handleResize = () => {
    ctx = resizeCanvas(canvas)
    if (!ctx) return
    particles = Array.from({ length: window.innerWidth < 640 ? 45 : 90 }, () =>
      createParticle(window.innerWidth, window.innerHeight)
    )
  }

  window.addEventListener('resize', handleResize, { passive: true })

  const drawLinks = () => {
    if (!ctx) return
    for (let i = 0; i < particles.length; i++) {
      const first = particles[i]
      if (!first) continue
      for (let j = i + 1; j < particles.length; j++) {
        const second = particles[j]
        if (!second) continue
        const dx = first.x - second.x
        const dy = first.y - second.y
        const dist = Math.hypot(dx, dy)
        if (dist > 130) continue
        const opacity = (1 - dist / 130) * 0.16
        ctx.strokeStyle = `rgba(110, 160, 255, ${opacity})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(first.x, first.y)
        ctx.lineTo(second.x, second.y)
        ctx.stroke()
      }
    }
  }

  const tick = () => {
    if (!ctx) return
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    particles.forEach((item) => {
      item.x += item.vx
      item.y += item.vy

      if (item.x < -10) item.x = window.innerWidth + 10
      if (item.x > window.innerWidth + 10) item.x = -10
      if (item.y < -10) item.y = window.innerHeight + 10
      if (item.y > window.innerHeight + 10) item.y = -10

      ctx.beginPath()
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${item.hue}, 90%, 70%, ${item.alpha})`
      ctx.shadowColor = `hsla(${item.hue}, 90%, 65%, 0.8)`
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.shadowBlur = 0
    })

    drawLinks()
    requestAnimationFrame(tick)
  }

  tick()
}

const initReveal = () => {
  const nodes = document.querySelectorAll('.reveal')
  if (!nodes.length) return

  nodes.forEach((node) => {
    const delay = node.getAttribute('data-delay')
    if (delay) node.style.setProperty('--reveal-delay', `${delay}ms`)
  })

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  )

  nodes.forEach((node) => observer.observe(node))
}

const initHeader = () => {
  const header = document.getElementById('siteHeader')
  if (!header) return

  const handleScroll = () => {
    const scrolled = window.scrollY > 24
    header.classList.toggle('scrolled', scrolled)
  }

  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
}

const initMobileMenu = () => {
  const btn = document.getElementById('menuBtn')
  const menu = document.getElementById('mobileMenu')
  const iconOpen = document.getElementById('menuIconOpen')
  const iconClose = document.getElementById('menuIconClose')
  if (!btn || !menu) return

  const setOpen = (open) => {
    menu.classList.toggle('hidden', !open)
    btn.setAttribute('aria-expanded', String(open))
    btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню')
    if (iconOpen) iconOpen.classList.toggle('hidden', open)
    if (iconClose) iconClose.classList.toggle('hidden', !open)
  }

  const isOpen = () => !menu.classList.contains('hidden')

  const handleToggle = () => setOpen(!isOpen())
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(!isOpen())
    }
    if (event.key === 'Escape') setOpen(false)
  }

  btn.addEventListener('click', handleToggle)
  btn.addEventListener('keydown', handleKeyDown)

  menu.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => setOpen(false))
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false)
  })
}

const initParallaxTilt = () => {
  if (prefersReducedMotion()) return
  const visual = document.getElementById('heroVisual')
  const card = visual?.querySelector('.tilt')
  if (!visual || !card) return
  if (window.matchMedia('(pointer: coarse)').matches) return

  let frame = 0

  const handleMove = (event) => {
    const rect = visual.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5

    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      card.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${py * -7}deg) translateZ(0)`
    })
  }

  const handleLeave = () => {
    cancelAnimationFrame(frame)
    card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)'
  }

  visual.addEventListener('mousemove', handleMove)
  visual.addEventListener('mouseleave', handleLeave)
}

const initCopyLink = () => {
  const btn = document.getElementById('copyLinkBtn')
  const label = document.getElementById('copyLinkLabel')
  if (!btn || !label) return

  const setLabel = (text) => {
    label.textContent = text
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REPO_URL)
      setLabel('Скопировано ✓')
    } catch {
      window.open(REPO_URL, '_blank', 'noopener')
      return
    }
    window.setTimeout(() => setLabel('Скопировать ссылку'), 2200)
  }

  btn.addEventListener('click', handleCopy)
}

const initYear = () => {
  const year = document.getElementById('year')
  if (!year) return
  year.textContent = String(new Date().getFullYear())
}

const initSnakeGame = () => {
  const canvas = document.getElementById('snakeCanvas')
  const wrap = document.getElementById('snakeWrap')
  const overlay = document.getElementById('snakeOverlay')
  const overlayTitle = document.getElementById('snakeOverlayTitle')
  const overlayText = document.getElementById('snakeOverlayText')
  const startBtn = document.getElementById('snakeStartBtn')
  const startPauseBtn = document.getElementById('snakeStartPauseBtn')
  const restartBtn = document.getElementById('snakeRestartBtn')
  const pauseMiniBtn = document.getElementById('snakePauseMiniBtn')
  const scoreNode = document.getElementById('snakeScore')
  const bestNode = document.getElementById('snakeBest')
  const statusNode = document.getElementById('snakeStatus')
  if (!canvas || !wrap || !overlay) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const COLS = 20
  const ROWS = 20
  const BEST_KEY = 'snake-best-score-v1'
  const MIN_INTERVAL = 65
  const SWIPE_THRESHOLD = 24

  const vectors = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  }

  const isOpposite = (first, second) => first.x + second.x === 0 && first.y + second.y === 0

  let snakeCells = []
  let foodCell = { x: 14, y: 14 }
  let currentDir = vectors.right
  let pendingDirs = []
  let scoreValue = 0
  let eatenCount = 0
  let baseInterval = 130
  let currentInterval = 130
  let loopId = 0
  let isRunning = false
  let isPaused = false
  let isOver = false
  let bestValue = 0

  try {
    const stored = window.localStorage.getItem(BEST_KEY)
    if (stored) bestValue = Number.parseInt(stored, 10) || 0
  } catch {
    bestValue = 0
  }

  const updateScoreUI = () => {
    if (scoreNode) scoreNode.textContent = String(scoreValue)
    if (bestNode) bestNode.textContent = String(bestValue)
  }

  const setStatus = (text) => {
    if (!statusNode) return
    statusNode.textContent = text
  }

  const showOverlay = (title, text, button) => {
    if (overlayTitle && title) overlayTitle.textContent = title
    if (overlayText && text) overlayText.textContent = text
    if (startBtn && button) startBtn.textContent = button
    overlay.classList.remove('hidden-overlay')
  }

  const hideOverlay = () => {
    overlay.classList.add('hidden-overlay')
  }

  const resizeSnakeCanvas = () => {
    const size = wrap.clientWidth
    if (!size) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.style.height = `${size}px`
    canvas.width = Math.floor(size * dpr)
    canvas.height = Math.floor(size * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawSnakeFrame(Date.now())
  }

  const getEmptyCell = () => {
    const occupied = new Set(snakeCells.map((cell) => `${cell.x}:${cell.y}`))
    const freeCells = []
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!occupied.has(`${x}:${y}`)) freeCells.push({ x, y })
      }
    }
    if (!freeCells.length) return null
    const randomIndex = Math.floor(Math.random() * freeCells.length)
    return freeCells[randomIndex]
  }

  const placeFood = () => {
    const next = getEmptyCell()
    if (!next) return false
    foodCell = next
    return true
  }

  const resetSnakeState = () => {
    const centerY = Math.floor(ROWS / 2)
    snakeCells = [
      { x: 7, y: centerY },
      { x: 6, y: centerY },
      { x: 5, y: centerY }
    ]
    currentDir = vectors.right
    pendingDirs = []
    scoreValue = 0
    eatenCount = 0
    currentInterval = baseInterval
    isPaused = false
    isOver = false
    placeFood()
    updateScoreUI()
    drawSnakeFrame(Date.now())
  }

  const drawSnakeFrame = (now) => {
    const size = wrap.clientWidth
    if (!size) return
    const cell = size / COLS
    ctx.clearRect(0, 0, size, size)

    ctx.fillStyle = '#0A0F22'
    ctx.fillRect(0, 0, size, size)

    ctx.strokeStyle = 'rgba(120, 150, 255, 0.08)'
    ctx.lineWidth = 1
    for (let i = 1; i < COLS; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cell, 0)
      ctx.lineTo(i * cell, size)
      ctx.stroke()
    }
    for (let j = 1; j < ROWS; j++) {
      ctx.beginPath()
      ctx.moveTo(0, j * cell)
      ctx.lineTo(size, j * cell)
      ctx.stroke()
    }

    const pulse = 1 + Math.sin(now / 280) * 0.12
    const foodX = foodCell.x * cell + cell / 2
    const foodY = foodCell.y * cell + cell / 2
    const foodR = (cell * 0.32) * pulse
    ctx.save()
    ctx.shadowColor = 'rgba(52, 255, 150, 0.9)'
    ctx.shadowBlur = 16
    ctx.fillStyle = '#34FF96'
    ctx.beginPath()
    ctx.arc(foodX, foodY, foodR, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.beginPath()
    ctx.arc(foodX - foodR * 0.3, foodY - foodR * 0.3, foodR * 0.28, 0, Math.PI * 2)
    ctx.fill()

    for (let idx = snakeCells.length - 1; idx >= 0; idx--) {
      const part = snakeCells[idx]
      if (!part) continue
      const isHead = idx === 0
      const pad = isHead ? 1 : 2
      const px = part.x * cell + pad
      const py = part.y * cell + pad
      const pw = cell - pad * 2
      const radius = isHead ? 7 : 5
      ctx.save()
      if (isHead) {
        ctx.shadowColor = 'rgba(110, 170, 255, 0.9)'
        ctx.shadowBlur = 14
        ctx.fillStyle = '#7EB4FF'
      } else {
        const blend = idx / Math.max(snakeCells.length - 1, 1)
        ctx.fillStyle = blend > 0.5 ? '#8A5CFF' : '#4F8CFF'
        ctx.globalAlpha = 1 - blend * 0.35
      }
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath()
        ctx.roundRect(px, py, pw, pw, radius)
        ctx.fill()
      } else {
        ctx.fillRect(px, py, pw, pw)
      }
      ctx.restore()
    }

  }

  const stopSnakeLoop = () => {
    if (loopId) window.clearInterval(loopId)
    loopId = 0
  }

  const startSnakeLoop = () => {
    stopSnakeLoop()
    loopId = window.setInterval(() => {
      stepSnakeGame()
    }, currentInterval)
  }

  const saveBestIfNeeded = () => {
    if (scoreValue <= bestValue) return
    bestValue = scoreValue
    updateScoreUI()
    try {
      window.localStorage.setItem(BEST_KEY, String(bestValue))
    } catch {
      return
    }
  }

  const handleSnakeGameOver = () => {
    isRunning = false
    isOver = true
    stopSnakeLoop()
    saveBestIfNeeded()
    setStatus('игра окончена')
    showOverlay('💥 Столкновение', `Очки: ${scoreValue} • Рекорд: ${bestValue}`, 'Играть снова')
  }

  const stepSnakeGame = () => {
    if (!isRunning || isPaused || isOver) return
    if (pendingDirs.length) {
      const next = pendingDirs.shift()
      if (next && !isOpposite(next, currentDir)) currentDir = next
    }
    const head = snakeCells[0]
    if (!head) return
    const nextHead = { x: head.x + currentDir.x, y: head.y + currentDir.y }
    const hitWall = nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= COLS || nextHead.y >= ROWS
    if (hitWall) {
      handleSnakeGameOver()
      return
    }
    const hitSelf = snakeCells.some((cell, index) => {
      if (index === snakeCells.length - 1 && !(nextHead.x === foodCell.x && nextHead.y === foodCell.y)) return false
      return cell.x === nextHead.x && cell.y === nextHead.y
    })
    if (hitSelf) {
      handleSnakeGameOver()
      return
    }
    snakeCells.unshift(nextHead)
    const ateFood = nextHead.x === foodCell.x && nextHead.y === foodCell.y
    if (ateFood) {
      scoreValue += 10
      eatenCount += 1
      currentInterval = Math.max(MIN_INTERVAL, baseInterval - eatenCount * 3)
      startSnakeLoop()
      updateScoreUI()
      setStatus(`очки ${scoreValue} • скорость ${currentInterval}мс`)
      const hasPlace = placeFood()
      if (!hasPlace) {
        saveBestIfNeeded()
        setStatus('победа! поле заполнено')
        showOverlay('🏆 Победа!', `Очки: ${scoreValue}`, 'Сыграть ещё')
        isRunning = false
        isOver = true
        stopSnakeLoop()
        return
      }
    } else {
      snakeCells.pop()
    }
    drawSnakeFrame(Date.now())
  }

  const queueSnakeDirection = (dirName) => {
    const vector = vectors[dirName]
    if (!vector) return
    const last = pendingDirs.length ? pendingDirs[pendingDirs.length - 1] : currentDir
    if (!last) return
    if (vector.x === last.x && vector.y === last.y) return
    if (isOpposite(vector, last)) return
    if (pendingDirs.length >= 3) return
    pendingDirs.push(vector)
    if (!isRunning && !isOver) {
      handleSnakeStart()
      return
    }
    if (isOver) return
    if (isPaused) handleSnakeResume()
  }

  const handleSnakeStart = () => {
    resetSnakeState()
    isRunning = true
    isPaused = false
    isOver = false
    hideOverlay()
    setStatus(`очки 0 • скорость ${currentInterval}мс`)
    startSnakeLoop()
    try {
      canvas.focus({ preventScroll: true })
    } catch {
      canvas.focus()
    }
  }

  const handleSnakePause = () => {
    if (!isRunning || isOver) return
    isPaused = true
    setStatus('пауза')
    showOverlay('⏸ Пауза', `Очки: ${scoreValue}. Продолжим?`, 'Продолжить')
  }

  const handleSnakeResume = () => {
    if (!isRunning || isOver) return
    isPaused = false
    hideOverlay()
    setStatus(`очки ${scoreValue} • скорость ${currentInterval}мс`)
    try {
      canvas.focus({ preventScroll: true })
    } catch {
      canvas.focus()
    }
  }

  const handleStartPauseToggle = () => {
    if (!isRunning || isOver) {
      handleSnakeStart()
      return
    }
    if (isPaused) {
      handleSnakeResume()
      return
    }
    handleSnakePause()
  }

  const handleRestart = () => {
    handleSnakeStart()
  }

  const handleKeyDown = (event) => {
    const key = event.key
    const active = document.activeElement
    const hasFocus = active === canvas || wrap.contains(active)
    if (!isRunning && !hasFocus) return
    if (!hasFocus && !isRunning) return
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight' || key === ' ') {
      const inGame = hasFocus || isRunning
      if (inGame) event.preventDefault()
    }
    if (!hasFocus && isRunning) {
      const isArrow = key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight'
      if (!isArrow) return
    }
    if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === 'ц' || key === 'Ц') {
      queueSnakeDirection('up')
      return
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S' || key === 'ы' || key === 'Ы') {
      queueSnakeDirection('down')
      return
    }
    if (key === 'ArrowLeft' || key === 'a' || key === 'A' || key === 'ф' || key === 'Ф') {
      queueSnakeDirection('left')
      return
    }
    if (key === 'ArrowRight' || key === 'd' || key === 'D' || key === 'в' || key === 'В') {
      queueSnakeDirection('right')
      return
    }
    if (key === ' ' || key === 'Enter') {
      const active = document.activeElement
      if (active === canvas) {
        event.preventDefault()
        if (isOver) {
          handleSnakeStart()
          return
        }
        handleStartPauseToggle()
      }
    }
    if (key === 'Escape' && isRunning && !isPaused && !isOver) handleSnakePause()
  }

  let touchStartX = 0
  let touchStartY = 0
  let touchActive = false

  const handleTouchStart = (event) => {
    if (!event.touches || !event.touches.length) return
    const touch = event.touches[0]
    if (!touch) return
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    touchActive = true
  }

  const handleTouchMove = (event) => {
    if (!touchActive) return
    event.preventDefault()
    if (!event.touches || !event.touches.length) return
    const touch = event.touches[0]
    if (!touch) return
    const dx = touch.clientX - touchStartX
    const dy = touch.clientY - touchStartY
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return
    if (Math.abs(dx) > Math.abs(dy)) {
      queueSnakeDirection(dx > 0 ? 'right' : 'left')
    } else {
      queueSnakeDirection(dy > 0 ? 'down' : 'up')
    }
    touchStartX = touch.clientX
    touchStartY = touch.clientY
  }

  const handleTouchEnd = () => {
    touchActive = false
  }

  const handleTapToStart = () => {
    if (!isRunning || isOver) handleSnakeStart()
  }

  const syncSpeedButtons = () => {
    const buttons = document.querySelectorAll('.snake-speed-btn')
    buttons.forEach((btn) => {
      const value = Number(btn.getAttribute('data-snake-speed'))
      const isActive = value === baseInterval
      btn.setAttribute('aria-pressed', String(isActive))
      if (isActive) {
        btn.classList.remove('glass-soft')
      } else {
        btn.classList.add('glass-soft')
      }
    })
  }

  if (startBtn) startBtn.addEventListener('click', () => {
    if (isOver || !isRunning) {
      handleSnakeStart()
      return
    }
    if (isPaused) {
      handleSnakeResume()
      return
    }
  })
  if (startPauseBtn) startPauseBtn.addEventListener('click', handleStartPauseToggle)
  if (restartBtn) restartBtn.addEventListener('click', handleRestart)
  if (pauseMiniBtn) pauseMiniBtn.addEventListener('click', handleStartPauseToggle)

  document.querySelectorAll('[data-snake-dir]').forEach((btn) => {
    const dirName = btn.getAttribute('data-snake-dir')
    if (!dirName) return
    btn.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      queueSnakeDirection(dirName)
    })
  })

  document.querySelectorAll('.snake-speed-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = Number(btn.getAttribute('data-snake-speed'))
      if (!value) return
      baseInterval = value
      currentInterval = Math.max(MIN_INTERVAL, baseInterval - eatenCount * 3)
      syncSpeedButtons()
      setStatus(`скорость ${currentInterval}мс`)
      if (isRunning && !isPaused && !isOver) startSnakeLoop()
    })
  })

  canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
  canvas.addEventListener('touchend', handleTouchEnd, { passive: true })
  canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true })
  wrap.addEventListener('touchmove', (event) => {
    if (touchActive) event.preventDefault()
  }, { passive: false })

  canvas.addEventListener('click', handleTapToStart)
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRunning && !isPaused && !isOver) handleSnakePause()
  })
  window.addEventListener('resize', resizeSnakeCanvas, { passive: true })

  updateScoreUI()
  syncSpeedButtons()
  resetSnakeState()
  isRunning = false
  showOverlay('🐍 Готов?', 'Собирай энергию, не врезайся в стены и в себя', 'Играть')
  setStatus('нажми старт')
  resizeSnakeCanvas()
}

const init = () => {
  initParticles()
  initReveal()
  initHeader()
  initMobileMenu()
  initParallaxTilt()
  initCopyLink()
  initYear()
  initSnakeGame()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
