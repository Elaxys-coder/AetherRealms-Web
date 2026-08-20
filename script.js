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

     // Redirection vers ton site de classement/vote de ton choix
     setTimeout(() => {
          window.open("https://www.serveurs-minecraft.org", "_blank");
     }, 1500);
}

fetchServerStatus();
setInterval(fetchServerStatus, 15000);