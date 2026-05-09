(function () {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-menu-toggle]");

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 18);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  document.querySelectorAll(".glow-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("click", () => item.classList.toggle("open"));
  });

  const canvas = document.querySelector("[data-stars]");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.offsetWidth * dpr);
      canvas.height = Math.floor(canvas.offsetHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.min(150, Math.floor(canvas.offsetWidth / 8)) }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: Math.random() * 1.8 + 0.4,
        s: Math.random() * 0.28 + 0.05
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.fillStyle = Math.random() > 0.18 ? "rgba(255,255,255,.82)" : "rgba(15,239,253,.9)";
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduce) {
          star.y += star.s;
          if (star.y > canvas.offsetHeight) star.y = 0;
        }
      });
      if (!reduce) requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
  }

  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const cards = Array.from(carousel.querySelectorAll(".phone-card"));
    let index = 0;
    function render() {
      cards.forEach((card, i) => {
        card.classList.toggle("active", i === index);
        card.classList.toggle("prev", i === (index + cards.length - 1) % cards.length);
        card.classList.toggle("next", i === (index + 1) % cards.length);
      });
    }
    document.querySelector("[data-carousel-prev]")?.addEventListener("click", () => {
      index = (index + cards.length - 1) % cards.length;
      render();
    });
    document.querySelector("[data-carousel-next]")?.addEventListener("click", () => {
      index = (index + 1) % cards.length;
      render();
    });
    render();
  }

  const range = document.querySelector("[data-gift-range]");
  const box = document.querySelector("[data-gift-box]");
  const unlocked = document.querySelector("[data-unlocked]");
  if (range && box && unlocked) {
    range.addEventListener("input", () => {
      const open = Number(range.value) > 82;
      box.classList.toggle("open", open);
      unlocked.classList.toggle("show", open);
    });
  }

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const button = form.querySelector("button");
      if (button) {
        button.textContent = "Enviado";
        setTimeout(() => { button.textContent = "Enviar diagnóstico"; }, 1800);
      }
    });
  });
})();
