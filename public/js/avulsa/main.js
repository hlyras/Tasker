const Avulsa = {};

Avulsa.create = async (avulsa_task) => {
  let response = await fetch("/avulsa/create", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(avulsa_task)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Avulsa.update = async (avulsa_task) => {
  let response = await fetch("/avulsa/update", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(avulsa_task)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Avulsa.filter = async (avulsa_task) => {
  let response = await fetch("/avulsa/filter", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(avulsa_task)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.avulsa_tasks;
};

Avulsa.delete = async (avulsa_task_id) => {
  let response = await fetch(`/avulsa/delete/${avulsa_task_id}`, {
    method: "DELETE"
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.done;
};
