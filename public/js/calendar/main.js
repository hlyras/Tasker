const Calendar = {};

Calendar.find = async () => {
  let response = await fetch("/calendar/find", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};

Calendar.save = async (payload) => {
  let response = await fetch("/calendar/save", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  response = await response.json();

  if (API.verifyResponse(response)) { return false; };

  return response;
};
