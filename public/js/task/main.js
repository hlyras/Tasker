const Task = {};

Task.create = async (task) => {
  let response = await fetch("/task/create", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Task.update = async (task) => {
  let response = await fetch("/task/update", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Task.filter = async (task) => {
  let response = await fetch("/task/filter", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.tasks;
};

Task.delete = async (task_id) => {
  let response = await fetch(`/task/delete/${task_id}`, {
    method: "DELETE"
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.done;
};