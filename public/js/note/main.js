const Note = {};

Note.create = async (note) => {
  let response = await fetch("/note/create", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Note.update = async (note) => {
  let response = await fetch("/note/update", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Note.filter = async (note) => {
  let response = await fetch("/note/filter", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.notes;
};

Note.delete = async (note_id) => {
  let response = await fetch(`/note/delete/${note_id}`, {
    method: "DELETE"
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response.done;
};
