const db = require('../../../config/connection');
const lib = require('jarmlib');

const User = function () {
  this.id;
  this.email;
  this.name;
  this.origin;

  this.create = () => {
    if (!this.email) { return { err: "É necessário informar o email" }; }
    if (!this.name) { return { err: "É necessário informar o nome" }; }
    if (!this.origin) { return { err: "É necessário informar a origem" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.save(obj, 'cms_tasker.user');

    return db(query, values);
  };

  this.update = () => {
    if (!this.id) { return { err: "O id da tarefa é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.update(obj, 'cms_tasker.user', 'id');

    return db(query, values);
  };
};

User.filter = ({ props, inners, params, strict_params, order_params }) => {
  let { query, values } = new lib.Query().select()
    .props(props)
    .table("cms_tasker.user")
    .inners(inners)
    .params(params)
    .strictParams(strict_params)
    .order(order_params).build();
  return db(query, values);
};

module.exports = User;