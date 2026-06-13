const Subtask = {};

Subtask.create = async (subtask) => {
  let response = await fetch("/subtask/create", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subtask)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Subtask.update = async (subtask) => {
  let response = await fetch("/subtask/update", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subtask)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Subtask.filter = async (subtask) => {
  let response = await fetch("/subtask/filter", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subtask)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.subtasks;
};

Subtask.reorder = async (data) => {
  let response = await fetch("/subtask/reorder", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Subtask.delete = async (subtask_id) => {
  let response = await fetch(`/subtask/delete/${subtask_id}`, {
    method: "DELETE"
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.done;
};
