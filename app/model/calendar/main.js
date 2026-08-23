const db = require('../../../config/connection');
const lib = require('jarmlib');

const Calendar = function () {
  this.id;
  this.user_id;
  this.schedule;
  this.repeats;
  this.seeded_weeks;
  this.xp_events;

  this.create = () => {
    if (!this.user_id) { return { err: "O usuário do calendário é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.save(obj, 'cms_tasker.calendar');

    return db(query, values);
  };

  this.update = () => {
    if (!this.id) { return { err: "O id do calendário é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.update(obj, 'cms_tasker.calendar', 'id');

    return db(query, values);
  };
};

Calendar.filter = ({ props, inners, params, strict_params, order_params }) => {
  let { query, values } = new lib.Query().select()
    .props(props)
    .table("cms_tasker.calendar")
    .inners(inners)
    .params(params)
    .strictParams(strict_params)
    .order(order_params).build();
  return db(query, values);
};

module.exports = Calendar;
