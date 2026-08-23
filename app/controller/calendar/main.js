const User = require("./../../model/user/main");
const Calendar = require("./../../model/calendar/main");

const calendarController = {};

async function resolveUserId(req) {
  if (req.user && req.user.id) { return req.user.id; }

  try {
    const users = await User.filter({
      strict_params: { keys: [], values: [] },
      order_params: [['id', 'asc']]
    });
    return users && users[0] ? users[0].id : null;
  } catch (error) {
    return null;
  }
}

function parseJsonField(value, fallback) {
  if (value && typeof value === "object") { return value; }

  try {
    const parsed = JSON.parse(value || "");
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function stringifyJsonField(value, fallback) {
  if (typeof value === "string") {
    try {
      JSON.parse(value);
      return value;
    } catch (error) {
      return JSON.stringify(fallback);
    }
  }

  try {
    return JSON.stringify(value ?? fallback);
  } catch (error) {
    return JSON.stringify(fallback);
  }
}

function calendarPayload(row) {
  return {
    schedule: parseJsonField(row && row.schedule, {}),
    repeats: parseJsonField(row && row.repeats, {}),
    seeded_weeks: parseJsonField(row && row.seeded_weeks, []),
    xp_events: parseJsonField(row && row.xp_events, {})
  };
}

calendarController.find = async (req, res) => {
  const user_id = await resolveUserId(req);
  if (!user_id) {
    return res.send({ skipped: true, found: false, ...calendarPayload(null) });
  }

  try {
    const [row] = await Calendar.filter({
      strict_params: { keys: ["user_id"], values: [user_id] }
    });

    return res.send({
      found: Boolean(row),
      ...calendarPayload(row)
    });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao buscar o calendário."
    });
  }
};

calendarController.save = async (req, res) => {
  const user_id = await resolveUserId(req);
  if (!user_id) {
    return res.send({ skipped: true });
  }

  const calendar = new Calendar();
  calendar.user_id = user_id;
  calendar.schedule = stringifyJsonField(req.body.schedule, {});
  calendar.repeats = stringifyJsonField(req.body.repeats, {});
  calendar.seeded_weeks = stringifyJsonField(req.body.seeded_weeks, []);
  calendar.xp_events = stringifyJsonField(req.body.xp_events, {});

  try {
    const [existing] = await Calendar.filter({
      strict_params: { keys: ["user_id"], values: [user_id] }
    });

    let response;
    if (existing) {
      calendar.id = existing.id;
      response = await calendar.update();
    } else {
      response = await calendar.create();
    }

    if (response && response.err) {
      return res.send({ msg: response.err });
    }

    return res.send({ done: true });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao salvar o calendário."
    });
  }
};

module.exports = calendarController;
