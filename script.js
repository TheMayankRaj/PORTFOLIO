const body = document.body;
const loader = document.querySelector("[data-loader]");
const loaderBar = document.querySelector("[data-loader-bar]");
const loaderCount = document.querySelector("[data-loader-count]");
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const typingTarget = document.querySelector("[data-typing]");
const year = document.querySelector("[data-year]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorRing = document.querySelector("[data-cursor-ring]");
const particleCanvas = document.querySelector("[data-particles]");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll(".project-card");
const testimonialTrack = document.querySelector("[data-testimonial-track]");
const testimonialPrev = document.querySelector("[data-testimonial-prev]");
const testimonialNext = document.querySelector("[data-testimonial-next]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const toast = document.querySelector("[data-toast]");
const resumeButton = document.querySelector("[data-resume-button]");
const backTop = document.querySelector("[data-back-top]");

const roles = ["AI & Creative Portfolio"];
const themes = ["dark", "cyber", "matrix"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let roleIndex = 0;
let charIndex = 0;
let deleting = false;
let activeTestimonial = 0;
let particles = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let animationFrame = 0;

body.classList.add("is-loading");

if (year) {
  year.textContent = new Date().getFullYear();
}

function runLoader() {
  if (!loader || !loaderBar || !loaderCount) return;

  let progress = 0;
  const timer = window.setInterval(() => {
    progress = Math.min(progress + Math.ceil(Math.random() * 9), 100);
    loaderBar.style.width = `${progress}%`;
    loaderCount.textContent = `${progress}%`;

    if (progress >= 100) {
      window.clearInterval(timer);
      window.setTimeout(() => {
        loader.classList.add("is-hidden");
        body.classList.remove("is-loading");
      }, 360);
    }
  }, 70);
}

function updateScrollState() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

  if (scrollProgress) {
    scrollProgress.style.width = `${progress}%`;
  }

  if (header) {
    header.classList.toggle("has-scrolled", scrollTop > 16);
  }
}

function setupNavigation() {
  if (!navToggle || !nav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    }
  });
}

function setupActiveSections() {
  const sections = [...document.querySelectorAll(".section-observe")];
  const links = [...document.querySelectorAll(".site-nav a")];

  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 },
  );

  sections.forEach((section) => observer.observe(section));
}

function typeRoles() {
  if (!typingTarget || prefersReducedMotion || roles.length === 1) {
    if (typingTarget) typingTarget.textContent = roles[0];
    return;
  }

  const currentRole = roles[roleIndex];
  typingTarget.textContent = currentRole.slice(0, charIndex);

  if (!deleting && charIndex < currentRole.length) {
    charIndex += 1;
  } else if (!deleting) {
    deleting = true;
    window.setTimeout(typeRoles, 1200);
    return;
  } else if (charIndex > 0) {
    charIndex -= 1;
  } else {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }

  window.setTimeout(typeRoles, deleting ? 42 : 72);
}

function setupRevealsAndCounters() {
  const reveals = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll("[data-counter]");
  const skills = document.querySelectorAll(".skill-item");

  const animateCounter = (counter) => {
    if (counter.dataset.counted === "true") return;
    counter.dataset.counted = "true";

    const target = Number(counter.dataset.target || "0");
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = String(target);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        if (entry.target.matches("[data-counter]")) {
          animateCounter(entry.target);
        }

        if (entry.target.classList.contains("skill-item")) {
          entry.target.style.setProperty("--level", `${entry.target.dataset.skill || 0}%`);
        }
      });
    },
    { threshold: 0.18 },
  );

  reveals.forEach((element) => observer.observe(element));
  counters.forEach((counter) => observer.observe(counter));
  skills.forEach((skill) => observer.observe(skill));
}

function setupProjectFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";

      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      projectCards.forEach((card) => {
        const categories = card.dataset.category || "";
        card.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
      });
    });
  });
}

function setupTiltCards() {
  if (prefersReducedMotion) return;

  projectCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupTestimonials() {
  if (!testimonialTrack) return;

  const slides = [...testimonialTrack.querySelectorAll(".testimonial")];
  if (!slides.length) return;

  const showSlide = (index) => {
    activeTestimonial = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeTestimonial);
    });
  };

  testimonialPrev?.addEventListener("click", () => showSlide(activeTestimonial - 1));
  testimonialNext?.addEventListener("click", () => showSlide(activeTestimonial + 1));

  if (!prefersReducedMotion) {
    window.setInterval(() => showSlide(activeTestimonial + 1), 5200);
  }
}

function setupThemeToggle() {
  if (!themeToggle || !themeLabel) return;

  let index = 0;
  themeToggle.addEventListener("click", () => {
    index = (index + 1) % themes.length;
    const theme = themes[index];
    body.dataset.theme = theme;
    themeLabel.textContent = theme === "dark" ? "Dark" : theme === "cyber" ? "Cyber" : "Matrix";
    showToast(`Visual mode: ${themeLabel.textContent}`);
  });
}

function setupRipples() {
  document.querySelectorAll("[data-ripple]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const rect = element.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      element.append(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    });
  });
}

function setupMagneticButtons() {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

function setupCursor() {
  if (!cursorDot || !cursorRing || window.matchMedia("(pointer: coarse)").matches || prefersReducedMotion) return;

  body.classList.add("cursor-active");

  window.addEventListener("pointermove", (event) => {
    mouse = { x: event.clientX, y: event.clientY };
    cursorDot.style.left = `${mouse.x}px`;
    cursorDot.style.top = `${mouse.y}px`;
  });

  const moveRing = () => {
    const currentX = Number(cursorRing.dataset.x || mouse.x);
    const currentY = Number(cursorRing.dataset.y || mouse.y);
    const nextX = currentX + (mouse.x - currentX) * 0.18;
    const nextY = currentY + (mouse.y - currentY) * 0.18;
    cursorRing.dataset.x = String(nextX);
    cursorRing.dataset.y = String(nextY);
    cursorRing.style.left = `${nextX}px`;
    cursorRing.style.top = `${nextY}px`;
    requestAnimationFrame(moveRing);
  };

  moveRing();

  document.querySelectorAll("a, button, input, textarea, video").forEach((element) => {
    element.addEventListener("pointerenter", () => body.classList.add("cursor-hover"));
    element.addEventListener("pointerleave", () => body.classList.remove("cursor-hover"));
  });
}

function setupParticles() {
  if (!particleCanvas || prefersReducedMotion) return;

  const context = particleCanvas.getContext("2d");
  if (!context) return;

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = Math.floor(window.innerWidth * pixelRatio);
    particleCanvas.height = Math.floor(window.innerHeight * pixelRatio);
    particleCanvas.style.width = `${window.innerWidth}px`;
    particleCanvas.style.height = `${window.innerHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = Math.min(Math.floor(window.innerWidth / 18), 90);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.8 + 0.6,
    }));
  };

  const draw = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = "rgba(0, 212, 255, 0.82)";
    context.strokeStyle = "rgba(0, 212, 255, 0.12)";
    context.lineWidth = 1;

    particles.forEach((particle, index) => {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distanceToMouse = Math.hypot(dx, dy);

      if (distanceToMouse < 160) {
        particle.x -= dx * 0.002;
        particle.y -= dy * 0.002;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
      if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const distance = Math.hypot(particle.x - next.x, particle.y - next.y);
        if (distance < 118) {
          context.globalAlpha = 1 - distance / 118;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.stroke();
          context.globalAlpha = 1;
        }
      }
    });

    animationFrame = requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
}

function setupContactForm() {
  if (!contactForm || !formStatus) return;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = [...contactForm.querySelectorAll("input, textarea")];
    const invalidFields = fields.filter((field) => !field.checkValidity());

    fields.forEach((field) => field.classList.toggle("is-invalid", invalidFields.includes(field)));

    if (invalidFields.length) {
      formStatus.textContent = "Please complete every field with valid details.";
      formStatus.style.color = "var(--danger)";
      invalidFields[0].focus();
      return;
    }

    const data = new FormData(contactForm);
    const body = `${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`;
    const url = "https://mail.google.com/mail/?view=cm&fs=1&to=aayushraj3.4.2004@gmail.com"
      + `&su=${encodeURIComponent(data.get("subject"))}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener");
    formStatus.textContent = "Opening Gmail with your message ready to send.";
    formStatus.style.color = "var(--success)";
    contactForm.reset();
    showToast("Opening Gmail…");
  });
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function setupUtilityActions() {
  resumeButton?.addEventListener("click", () => {
    const resumeText = [
      "Mayank Raj",
      "AI & Data Science Student | Creative Technologist",
      "",
      "Profile",
      "B.Sc. Artificial Intelligence & Data Science student building practical AI, data, web, design, photography, and video projects.",
      "",
      "Core Skills",
      "Python, Machine Learning, SQL, Power BI, HTML, CSS, JavaScript, Generative AI, Graphic Design, Photography, Video Editing",
      "",
      "Featured Focus",
      "AI workflows, data analytics, creative media production, polished portfolio design, and client-ready digital content.",
      "",
      "Contact",
      "Email: aayushraj3.4.2004@gmail.com",
      "GitHub: https://github.com/TheMayankRaj",
      "LinkedIn: https://linkedin.com/in/mayank-raj",
    ].join("\n");

    const resumeBlob = new Blob([resumeText], { type: "text/plain" });
    const resumeUrl = URL.createObjectURL(resumeBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = resumeUrl;
    downloadLink.download = "Mayank-Raj-Resume.txt";
    downloadLink.click();
    URL.revokeObjectURL(resumeUrl);
    showToast("Resume download started.");
  });

  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function init() {
  runLoader();
  setupNavigation();
  setupActiveSections();
  setupRevealsAndCounters();
  setupProjectFilters();
  setupTiltCards();
  setupTestimonials();
  setupThemeToggle();
  setupRipples();
  setupMagneticButtons();
  setupCursor();
  setupParticles();
  setupContactForm();
  setupUtilityActions();
  typeRoles();
  updateScrollState();
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));

init();
