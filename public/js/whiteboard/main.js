const Whiteboard = {};

Whiteboard.create = async (whiteboard) => {
  let response = await fetch("/whiteboard/create", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(whiteboard)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Whiteboard.update = async (whiteboard) => {
  let response = await fetch("/whiteboard/update", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(whiteboard)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Whiteboard.filter = async (whiteboard) => {
  let response = await fetch("/whiteboard/filter", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(whiteboard || {})
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.whiteboards;
};

Whiteboard.find = async (whiteboard_id) => {
  let response = await fetch("/whiteboard/find", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: whiteboard_id })
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.whiteboard;
};

Whiteboard.delete = async (whiteboard_id) => {
  let response = await fetch(`/whiteboard/delete/${whiteboard_id}`, {
    method: "DELETE"
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.done;
};
