const db = require('../../../config/connection');
const lib = require('jarmlib');

const AvulsaTask = function () {
  this.id;
  this.datetime;
  this.description;
  this.status;
  this.recurrence_type;

  this.create = () => {
    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.save(obj, 'cms_tasker.avulsa_task');

    return db(query, values);
  };

  this.update = () => {
    if (!this.id) { return { err: "O id da tarefa avulsa é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.update(obj, 'cms_tasker.avulsa_task', 'id');

    return db(query, values);
  };
};

AvulsaTask.filter = ({ props, inners, params, strict_params, order_params }) => {
  let { query, values } = new lib.Query().select()
    .props(props)
    .table("cms_tasker.avulsa_task")
    .inners(inners)
    .params(params)
    .strictParams(strict_params)
    .order(order_params).build();
  return db(query, values);
};

AvulsaTask.delete = async (id) => {
  let query = `DELETE FROM cms_tasker.avulsa_task WHERE id = ?;`;
  return db(query, [id]);
};

module.exports = AvulsaTask;
