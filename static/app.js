let SESSION = localStorage.getItem("session");

async function connect() {
  const session = document.getElementById("sessionInput").value;

  const res = await fetch("/connect", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ session })
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("status").innerText = data.detail || "Xato";
    return;
  }

  localStorage.setItem("session", session);
  SESSION = session;

  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  loadDialogs();
}

async function loadDialogs() {
  const res = await fetch("/dialogs", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ session: SESSION })
  });

  const dialogs = await res.json();
  const list = document.getElementById("dialogs");
  list.innerHTML = "";

  dialogs.forEach(d => {
    const li = document.createElement("li");
    li.innerText = d.name;
    li.onclick = () => loadMessages(d.id);
    list.appendChild(li);
  });
}

async function loadMessages(dialogId) {
  const res = await fetch(`/messages/${dialogId}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ session: SESSION })
  });

  const msgs = await res.json();
  const box = document.getElementById("messages");
  box.innerHTML = "";

  msgs.forEach(m => {
    const div = document.createElement("div");
    div.className = "message " + (m.out ? "out" : "in");
    div.innerText = m.text;
    box.appendChild(div);
  });
}

// auto-login
if (SESSION) {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  loadDialogs();
}