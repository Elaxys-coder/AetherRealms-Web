// Remplace par l'URL fournie par Render une fois ton bot déployé
const API_URL = "https://aetherbot.onrender.com/api/status";

async function fetchServerStatus() {
     try {
          const response = await fetch(API_URL);
          const data = await response.json();

          const indicator = document.getElementById("status-indicator");
          const statusText = document.getElementById("status-text");
          const playerCount = document.getElementById("player-count");
          const pingDisplay = document.getElementById("ping-display");

          if (data.online) {
               indicator.className = "indicator online";
               statusText.innerText = "Serveur En Ligne";
               playerCount.innerText = `Joueurs en ligne : ${data.players_online}/${data.players_max}`;
               pingDisplay.innerText = `Ping : ${data.ping_ms} ms`;
          } else {
               indicator.className = "indicator offline";
               statusText.innerText = "Serveur Hors Ligne";
               playerCount.innerText = "Joueurs en ligne : 0/0";
               pingDisplay.innerText = "Ping : -- ms";
          }
     } catch (error) {
          console.error("Erreur de récupération du statut :", error);
          document.getElementById("status-indicator").className = "indicator offline";
          document.getElementById("status-text").innerText = "Erreur de connexion";
     }
}

function copyServerIP() {
     const ipText = document.getElementById("server-ip").innerText;
     navigator.clipboard.writeText(ipText).then(() => {
          const toast = document.getElementById("toast");
          toast.className = "toast show";
          setTimeout(() => {
               toast.className = toast.className.replace("toast show", "toast");
          }, 2500);
     });
}

// Actualisation automatique toutes les 15 secondes
fetchServerStatus();
setInterval(fetchServerStatus, 15000);