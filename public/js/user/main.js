const User = {};

User.find = async () => {
  let response = await fetch("/user/find", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.user;
};