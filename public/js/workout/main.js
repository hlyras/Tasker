const Workout = {};

Workout.create = async (session) => {
  let response = await fetch("/workout/create", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Workout.update = async (session) => {
  let response = await fetch("/workout/update", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Workout.filter = async (session) => {
  let response = await fetch("/workout/filter", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.sessions;
};

Workout.delete = async (session_id) => {
  let response = await fetch(`/workout/delete/${session_id}`, {
    method: "DELETE"
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.done;
};
