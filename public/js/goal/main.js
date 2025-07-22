const Goal = {};

Goal.create = async (goal) => {
  let response = await fetch("/goal/create", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Goal.update = async (goal) => {
  let response = await fetch("/goal/update", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Goal.filter = async (goal) => {
  let response = await fetch("/goal/filter", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.goals;
};

Goal.delete = async (goal_id) => {
  let response = await fetch(`/goal/delete/${goal_id}`, {
    method: "DELETE"
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.done;
};