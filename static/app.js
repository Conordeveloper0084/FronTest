async function loadDialogs() {
  const res = await fetch("/api/dialogs");
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
  const res = await fetch(`/api/messages/${dialogId}`);
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

loadDialogs();