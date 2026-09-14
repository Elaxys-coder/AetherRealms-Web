// Statut technique du serveur (en ligne / joueurs / version) via mcstatus.io
const MCSTATUS_API_URL = "https://api.mcstatus.io/v2/status/java/aetherrealms.servegame.com:26878";

// Liste des joueurs connectés (pseudos) via ton bot AetherBot sur Render
// Remplace cette URL par celle générée par Render lors du déploiement
const API_URL = "https://aetherbot.onrender.com/api/status";

// Widget public Discord (aucun token requis, juste le Guild ID)
const DISCORD_GUILD_ID = "1532906956195496016";
const DISCORD_WIDGET_URL = `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`;

function copyIP() {
     const ipText = document.getElementById("server-ip").innerText;
     navigator.clipboard.writeText(ipText);
     const msg = document.getElementById("copy-message");
     msg.classList.add("show");
     setTimeout(() => msg.classList.remove("show"), 2000);
}

function copyDiscordCommand() {
     navigator.clipboard.writeText("/discord link");
     const responseBox = document.getElementById("vote-response");
     // petit retour visuel discret via le bouton lui-même
     const btn = event.currentTarget;
     const original = btn.innerHTML;
     btn.innerHTML = '<i class="fa-solid fa-check"></i> Copié !';
     setTimeout(() => { btn.innerHTML = original; }, 1800);
}

function renderPlayerHead(pseudo) {
     // Têtes de skin via mc-heads.net, pas besoin de résoudre l'UUID nous-mêmes
     const safeName = encodeURIComponent(pseudo);
     return `<img class="player-head" src="https://mc-heads.net/avatar/${safeName}/24" alt="" loading="lazy">`;
}

// ---------------------------------------------------------------------
// Statut Minecraft (mcstatus.io pour l'état/joueurs, bot Render pour les pseudos)
// ---------------------------------------------------------------------
async function fetchServerStatus() {
     const indicator = document.getElementById("status-indicator");
     const statusText = document.getElementById("status-text");
     const playersCount = document.getElementById("players-count");
     const pingMs = document.getElementById("ping-ms");
     const playersList = document.getElementById("players-list");

     try {
          const started = performance.now();
          const response = await fetch(MCSTATUS_API_URL);
          const data = await response.json();
          const responseTime = Math.round(performance.now() - started);

          if (data.online) {
               indicator.className = "status-indicator online";
               statusText.innerText = "Serveur en ligne";
               playersCount.innerText = `${data.players.online} / ${data.players.max}`;
               // mcstatus.io ne renvoie pas de ping réseau réel : on affiche le temps de
               // réponse de la requête, à titre indicatif.
               pingMs.innerText = `~${responseTime} ms`;
          } else {
               throw new Error("Hors ligne");
          }
     } catch (error) {
          indicator.className = "status-indicator offline";
          statusText.innerText = "Serveur Hors ligne";
          playersCount.innerText = "- / -";
          pingMs.innerText = "- ms";
     }

     // La liste des pseudos vient de ton bot (AetherBot), indépendamment de mcstatus.io
     try {
          const botResponse = await fetch(API_URL);
          const botData = await botResponse.json();

          playersList.innerHTML = "";
          if (botData.online && botData.players_list && botData.players_list.length > 0) {
               botData.players_list.forEach(player => {
                    const li = document.createElement("li");
                    li.className = "player-chip";
                    li.innerHTML = `${renderPlayerHead(player)}<span>${player}</span>`;
                    playersList.appendChild(li);
               });
          } else {
               playersList.innerHTML = "<li>Aucun joueur en ligne</li>";
          }
     } catch (error) {
          playersList.innerHTML = "<li>Liste des joueurs indisponible</li>";
     }
}

// ---------------------------------------------------------------------
// Widget Discord (membres en ligne + invitation), 100% public, sans token
// ---------------------------------------------------------------------
async function fetchDiscordWidget() {
     const indicator = document.getElementById("discord-indicator");
     const statusText = document.getElementById("discord-status-text");
     const onlineCount = document.getElementById("discord-online-count");
     const membersList = document.getElementById("discord-members-list");
     const inviteBtn = document.getElementById("discord-invite-btn");

     try {
          const response = await fetch(DISCORD_WIDGET_URL);
          if (!response.ok) throw new Error("Widget Discord indisponible");
          const data = await response.json();

          indicator.className = "status-indicator online";
          statusText.innerText = "Discord connecté";
          onlineCount.innerText = data.presence_count ?? "-";

          if (data.instant_invite) {
               inviteBtn.href = data.instant_invite;
          }

          membersList.innerHTML = "";
          if (data.members && data.members.length > 0) {
               data.members.slice(0, 16).forEach(member => {
                    const li = document.createElement("li");
                    const avatar = member.avatar_url
                         ? `<img src="${member.avatar_url}" alt="">`
                         : "";
                    li.innerHTML = `${avatar}<span>${member.username}</span>`;
                    membersList.appendChild(li);
               });
          } else {
               membersList.innerHTML = "<li>Aucun membre affiché pour le moment</li>";
          }
     } catch (error) {
          indicator.className = "status-indicator offline";
          statusText.innerText = "Widget Discord indisponible";
          onlineCount.innerText = "-";
          membersList.innerHTML = "<li>Active le widget dans Discord si ce n'est pas déjà fait</li>";
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

     // Les annuaires de vote (Serveurs-Minecraft.org, etc.) seront branchés dès que
     // le nom de domaine sera en place. Pas de redirection pour le moment.
     responseBox.style.color = "var(--success-color)";
     responseBox.innerText = `Merci ${pseudo} ! Le vote sera bientôt activé, reviens vite.`;
}

// Lancement automatique au chargement et actualisation toutes les 15 secondes
fetchServerStatus();
setInterval(fetchServerStatus, 15000);

fetchDiscordWidget();
setInterval(fetchDiscordWidget, 30000);

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