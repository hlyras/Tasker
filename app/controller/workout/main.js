const lib = require('jarmlib');

const { WorkoutSession, WorkoutExercise } = require("./../../model/workout/main");

const workoutController = {};

function normalizeExercises(exercises) {
  if (!Array.isArray(exercises)) { return []; }

  return exercises
    .map((exercise, index) => {
      const name = (exercise.name || "").trim();
      if (!name) { return null; }

      const measure_type = exercise.measure_type === "km" ? "km" : "reps";
      const value = parseFloat(exercise.value);

      if (Number.isNaN(value) || value <= 0) { return null; }

      return {
        name,
        reps: measure_type === "reps" ? Math.round(value) : null,
        km: measure_type === "km" ? value : null,
        sort_order: exercise.sort_order ?? index + 1
      };
    })
    .filter(Boolean);
}

async function attachExercises(sessions) {
  if (!sessions.length) { return sessions; }

  const session_ids = sessions.map(session => session.id);
  const exercises = await WorkoutExercise.filterBySessionIds(session_ids);

  const exercises_by_session = new Map();

  exercises.forEach(exercise => {
    if (!exercises_by_session.has(exercise.session_id)) {
      exercises_by_session.set(exercise.session_id, []);
    }
    exercises_by_session.get(exercise.session_id).push(exercise);
  });

  return sessions.map(session => ({
    ...session,
    exercises: exercises_by_session.get(session.id) || []
  }));
}

workoutController.create = async (req, res) => {
  const name = (req.body.name || "").trim();
  const exercises = normalizeExercises(req.body.exercises);

  if (!name) {
    return res.send({ msg: "O nome da sessão de treino é obrigatório." });
  }

  if (!exercises.length) {
    return res.send({ msg: "Adicione pelo menos um exercício." });
  }

  try {
    const session = new WorkoutSession();
    session.datetime = lib.date.timestamp.generate();
    session.name = name;
    session.status = "Pendente";

    const session_response = await session.create();
    if (session_response.err) {
      return res.send({ msg: session_response.err });
    }

    session.id = session_response.insertId;

    for (const exercise_data of exercises) {
      const exercise = new WorkoutExercise();
      exercise.session_id = session.id;
      exercise.name = exercise_data.name;
      exercise.reps = exercise_data.reps;
      exercise.km = exercise_data.km;
      exercise.sort_order = exercise_data.sort_order;
      await exercise.create();
    }

    const [session_with_exercises] = await attachExercises([session]);

    return res.send({ done: "Sessão de treino criada.", session: session_with_exercises });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao criar a sessão de treino."
    });
  }
};

workoutController.update = async (req, res) => {
  const session = new WorkoutSession();
  session.id = req.body.id;

  if (!session.id) {
    return res.send({ msg: "O id da sessão de treino é inválido." });
  }

  if (req.body.name !== undefined) {
    session.name = (req.body.name || "").trim();
    if (!session.name) {
      return res.send({ msg: "O nome da sessão de treino é obrigatório." });
    }
  }

  if (req.body.status !== undefined) {
    session.status = req.body.status;
  }

  try {
    if (req.body.name !== undefined || req.body.status !== undefined) {
      const session_response = await session.update();
      if (session_response.err) {
        return res.send({ msg: session_response.err });
      }
    }

    if (req.body.exercises !== undefined) {
      const exercises = normalizeExercises(req.body.exercises);
      if (!exercises.length) {
        return res.send({ msg: "Adicione pelo menos um exercício." });
      }

      await WorkoutExercise.deleteBySession(session.id);

      for (const exercise_data of exercises) {
        const exercise = new WorkoutExercise();
        exercise.session_id = session.id;
        exercise.name = exercise_data.name;
        exercise.reps = exercise_data.reps;
        exercise.km = exercise_data.km;
        exercise.sort_order = exercise_data.sort_order;
        await exercise.create();
      }
    }

    return res.send({ done: "Sessão de treino atualizada." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao atualizar a sessão de treino."
    });
  }
};

workoutController.filter = async (req, res) => {
  const session_options = {
    strict_params: { keys: [], values: [] },
    order_params: [['datetime', 'desc'], ['id', 'desc']]
  };

  lib.Query.fillParam("workout_session.status", req.body.status, session_options.strict_params);

  try {
    let sessions = await WorkoutSession.filter(session_options);
    sessions = await attachExercises(sessions);

    return res.send({ sessions });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao filtrar as sessões de treino."
    });
  }
};

workoutController.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.send({ msg: "O id da sessão de treino é inválido." });
    }

    if (isNaN(req.params.id)) {
      return res.send({ msg: "O id da sessão de treino deve ser um número." });
    }

    await WorkoutSession.delete(req.params.id);

    return res.send({ done: "Sessão de treino excluída." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao excluir a sessão de treino."
    });
  }
};

module.exports = workoutController;
