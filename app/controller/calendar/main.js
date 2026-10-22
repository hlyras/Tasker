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
    xp_events: parseJsonField(row && row.xp_events, {}),
    version: Number(row && row.version) || 0
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

    if (existing) {
      const current = Number(existing.version) || 0;
      const base = Number(req.body.version);
      const incoming_schedule = parseJsonField(calendar.schedule, {});
      const stored_schedule = parseJsonField(existing.schedule, {});

      if (!Object.keys(incoming_schedule).length && Object.keys(stored_schedule).length) {
        return res.send({
          conflict: true,
          found: true,
          ...calendarPayload(existing)
        });
      }

      if (Number.isFinite(base) && base !== current) {
        return res.send({
          conflict: true,
          found: true,
          ...calendarPayload(existing)
        });
      }

      const result = await Calendar.updateIfVersion({
        id: existing.id,
        version: current,
        schedule: calendar.schedule,
        repeats: calendar.repeats,
        seeded_weeks: calendar.seeded_weeks,
        xp_events: calendar.xp_events
      });

      if (!result || !result.affectedRows) {
        const [fresh] = await Calendar.filter({
          strict_params: { keys: ["user_id"], values: [user_id] }
        });

        return res.send({
          conflict: true,
          found: Boolean(fresh),
          ...calendarPayload(fresh)
        });
      }

      return res.send({ done: true, version: current + 1 });
    }

    calendar.version = 1;
    const response = await calendar.create();

    if (response && response.err) {
      return res.send({ msg: response.err });
    }

    return res.send({ done: true, version: 1 });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao salvar o calendário."
    });
  }
};

module.exports = calendarController;
