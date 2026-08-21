// Remplace cette URL par celle générée par Render lors du déploiement
const API_URL = "https://aetherbot.onrender.com/api/status";

function copyIP() {
     const ipText = document.getElementById("server-ip").innerText;
     navigator.clipboard.writeText(ipText);
     const msg = document.getElementById("copy-message");
     msg.classList.add("show");
     setTimeout(() => msg.classList.remove("show"), 2000);
}

async function fetchServerStatus() {
     const indicator = document.getElementById("status-indicator");
     const statusText = document.getElementById("status-text");
     const playersCount = document.getElementById("players-count");
     const pingMs = document.getElementById("ping-ms");
     const playersList = document.getElementById("players-list");

     try {
          const response = await fetch(API_URL);
          const data = await response.json();

          if (data.online) {
               indicator.className = "status-indicator online";
               statusText.innerText = "Serveur en ligne";
               playersCount.innerText = `${data.players_online} / ${data.players_max}`;
               pingMs.innerText = `${data.ping_ms} ms`;

               playersList.innerHTML = "";
               if (data.players_list && data.players_list.length > 0) {
                    data.players_list.forEach(player => {
                         const li = document.createElement("li");
                         li.innerText = player;
                         playersList.appendChild(li);
                    });
               } else {
                    playersList.innerHTML = "<li>Aucun joueur en ligne</li>";
               }
          } else {
               throw new Error("Hors ligne");
          }
     } catch (error) {
          indicator.className = "status-indicator offline";
          statusText.innerText = "Serveur Hors ligne";
          playersCount.innerText = "- / -";
          pingMs.innerText = "- ms";
          playersList.innerHTML = "<li>Information indisponible</li>";
     }
}

function sendVote() {
     const pseudo = document.getElementById("vote-pseudo").value;
     const responseBox = document.getElementById("vote-response");

     if (!pseudo.trim()) {
          responseBox.style.color = "var(--danger-color)";
          responseBox.innerText = "Veuillez entrer un pseudo valide !";
          return;
     }

     responseBox.style.color = "var(--success-color)";
     responseBox.innerText = `Merci ${pseudo} ! Redirection vers la page de vote...`;

     // Redirection vers ton site de classement/vote
     setTimeout(() => {
          window.open("https://www.serveurs-minecraft.org", "_blank");
     }, 1500);
}

// Lancement automatique au chargement et actualisation toutes les 15 secondes
fetchServerStatus();
setInterval(fetchServerStatus, 15000);

// ---------------------------------------------------------------------
// Fond étoilé ambiant (décoratif, désactivé si "reduced motion")
// ---------------------------------------------------------------------
function initStarfield() {
     const canvas = document.getElementById("starfield");
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
     let stars = [];
     let width, height;

     function resize() {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
          const count = Math.floor((width * height) / 9000);
          stars = Array.from({ length: count }, () => ({
               x: Math.random() * width,
               y: Math.random() * height,
               r: Math.random() * 1.2 + 0.3,
               speed: Math.random() * 0.06 + 0.02,
               twinkle: Math.random() * Math.PI * 2,
               color: Math.random() > 0.85 ? "63,232,196" : "241,236,251"
          }));
     }

     function draw() {
          ctx.clearRect(0, 0, width, height);
          stars.forEach(s => {
               s.twinkle += 0.02;
               const alpha = 0.35 + Math.sin(s.twinkle) * 0.35;
               ctx.beginPath();
               ctx.fillStyle = `rgba(${s.color},${Math.max(alpha, 0.1)})`;
               ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
               ctx.fill();
               if (!prefersReducedMotion) {
                    s.y += s.speed;
                    if (s.y > height) s.y = 0;
               }
          });
          requestAnimationFrame(draw);
     }

     window.addEventListener("resize", resize);
     resize();
     draw();
}

// ---------------------------------------------------------------------
// Apparition en fondu des sections au scroll
// ---------------------------------------------------------------------
function initRevealOnScroll() {
     const targets = document.querySelectorAll(".reveal");
     if (!targets.length) return;

     if (!("IntersectionObserver" in window)) {
          targets.forEach(el => el.classList.add("in-view"));
          return;
     }

     const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
               if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
               }
          });
     }, { threshold: 0.15 });

     targets.forEach(el => observer.observe(el));
}

initStarfield();
initRevealOnScroll();