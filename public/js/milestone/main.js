const Milestone = {};

Milestone.create = async (milestone) => {
  let response = await fetch("/milestone/create", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(milestone)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Milestone.update = async (milestone) => {
  let response = await fetch("/milestone/update", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(milestone)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Milestone.filter = async (milestone) => {
  let response = await fetch("/milestone/filter", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(milestone)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.milestones;
};

Milestone.delete = async (milestone_id) => {
  let response = await fetch(`/milestone/delete/${milestone_id}`, {
    method: "DELETE"
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.done;
};