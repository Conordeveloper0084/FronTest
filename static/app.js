let SESSION = null;

async function login() {
  const session = document.getElementById("sessionInput").value.trim();
  const status = document.getElementById("loginStatus");

  if (!session) {
    status.innerText = "Session kiriting";
    return;
  }

  status.innerText = "Ulanmoqda...";

  const res = await fetch("/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session })
  });

  if (!res.ok) {
    status.innerText = "❌ Session noto‘g‘ri yoki band";
    return;
  }

  const data = await res.json();
  SESSION = session;

  status.innerText = "✅ Ulandi: @" + data.username;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("appBox").style.display = "flex";

  loadDialogs();
}

async function loadDialogs() {
  const res = await fetch("/dialogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
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