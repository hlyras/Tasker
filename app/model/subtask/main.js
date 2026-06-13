const db = require('../../../config/connection');
const lib = require('jarmlib');

const Subtask = function () {
  this.id;

  this.create = () => {
    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.save(obj, 'cms_tasker.subtask');

    return db(query, values);
  };

  this.update = () => {
    if (!this.id) { return { err: "O id da subtarefa é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.update(obj, 'cms_tasker.subtask', 'id');

    return db(query, values);
  };
};

Subtask.filter = ({ props, inners, params, strict_params, order_params }) => {
  let { query, values } = new lib.Query().select()
    .props(props)
    .table("cms_tasker.subtask")
    .inners(inners)
    .params(params)
    .strictParams(strict_params)
    .order(order_params).build();
  return db(query, values);
};

Subtask.delete = async (id) => {
  let query = `DELETE FROM cms_tasker.subtask WHERE id = ?;`;
  return db(query, [id]);
};

module.exports = Subtask;
