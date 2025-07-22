const db = require('../../../config/connection');
const lib = require('jarmlib');

const Goal = function () {
  this.id;
  this.datetime;
  this.description;

  this.create = () => {
    // if (!this.name) { return { err: "É necessário informar seu nome" }; }
    // if (this.phone.length < 14) { return { err: "O Telefone informado é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.save(obj, 'cms_tasker.goal');

    return db(query, values);
  };

  this.update = () => {
    if (!this.id) { return { err: "O id do usuário é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.update(obj, 'cms_tasker.goal', 'id');

    return db(query, values);
  };
};

Goal.filter = ({ props, inners, params, strict_params, order_params }) => {
  let { query, values } = new lib.Query().select()
    .props(props)
    .table("cms_tasker.goal")
    .inners(inners)
    .params(params)
    .strictParams(strict_params)
    .order(order_params).build();
  return db(query, values);
};

Goal.delete = ({ inners, params, strict_params }) => {
  let { query, values } = new lib.Query().delete()
    .table("cms_tasker.goal")
    .inners(inners)
    .params(params)
    .strictParams(strict_params).build();
  return db(query, values);
};

module.exports = Goal;