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

const init = () => {
  initParticles()
  initReveal()
  initHeader()
  initMobileMenu()
  initParallaxTilt()
  initCopyLink()
  initYear()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
