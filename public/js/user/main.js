const User = {};

User.find = async () => {
  let response = await fetch("/user/find", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

User.addXp = async (payload) => {
  let response = await fetch("/user/xp", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

function userRenderXp(xp) {
  const box = document.getElementById("user-xp-box");
  if (!box) { return; }

  const value = Number(xp);
  box.textContent = `${Number.isNaN(value) ? 0 : value} XP`;
}

function userApplyXpDelta(delta) {
  const box = document.getElementById("user-xp-box");
  const current = parseInt((box && box.textContent) || "0", 10) || 0;
  userRenderXp(current + Number(delta || 0));
}

async function userLoadXp() {
  const response = await API.response(User.find, {}, "none");
  if (!response) { return 0; }

  userRenderXp(response.xp);
  return Number(response.xp) || 0;
}
