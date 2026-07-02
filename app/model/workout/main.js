const db = require('../../../config/connection');
const lib = require('jarmlib');

const WorkoutSession = function () {
  this.id;
  this.datetime;
  this.name;
  this.status;

  this.create = () => {
    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.save(obj, 'cms_tasker.workout_session');

    return db(query, values);
  };

  this.update = () => {
    if (!this.id) { return { err: "O id da sessão de treino é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.update(obj, 'cms_tasker.workout_session', 'id');

    return db(query, values);
  };
};

WorkoutSession.filter = ({ props, inners, params, strict_params, order_params }) => {
  let { query, values } = new lib.Query().select()
    .props(props)
    .table("cms_tasker.workout_session")
    .inners(inners)
    .params(params)
    .strictParams(strict_params)
    .order(order_params).build();
  return db(query, values);
};

WorkoutSession.delete = async (id) => {
  let query = `DELETE FROM cms_tasker.workout_session WHERE id = ?;`;
  return db(query, [id]);
};

const WorkoutExercise = function () {
  this.id;
  this.session_id;
  this.name;
  this.reps;
  this.km;
  this.sort_order;

  this.create = () => {
    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.save(obj, 'cms_tasker.workout_exercise');

    return db(query, values);
  };

  this.update = () => {
    if (!this.id) { return { err: "O id do exercício é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.update(obj, 'cms_tasker.workout_exercise', 'id');

    return db(query, values);
  };
};

WorkoutExercise.filter = ({ props, inners, params, strict_params, order_params }) => {
  let { query, values } = new lib.Query().select()
    .props(props)
    .table("cms_tasker.workout_exercise")
    .inners(inners)
    .params(params)
    .strictParams(strict_params)
    .order(order_params).build();
  return db(query, values);
};

WorkoutExercise.deleteBySession = async (session_id) => {
  let query = `DELETE FROM cms_tasker.workout_exercise WHERE session_id = ?;`;
  return db(query, [session_id]);
};

WorkoutExercise.filterBySessionIds = async (session_ids) => {
  if (!session_ids.length) { return []; }

  const placeholders = session_ids.map(() => "?").join(", ");
  const query = `SELECT * FROM cms_tasker.workout_exercise WHERE session_id IN (${placeholders}) ORDER BY sort_order ASC, id ASC;`;

  return db(query, session_ids);
};

module.exports = { WorkoutSession, WorkoutExercise };
