const db = require('../../../config/connection');
const lib = require('jarmlib');

const Whiteboard = function () {
  this.id;
  this.datetime;
  this.name;
  this.description;
  this.canvas;

  this.create = () => {
    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.save(obj, 'cms_tasker.whiteboard');

    return db(query, values);
  };

  this.update = () => {
    if (!this.id) { return { err: "O id do quadro é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.update(obj, 'cms_tasker.whiteboard', 'id');

    return db(query, values);
  };
};

Whiteboard.filter = ({ props, inners, params, strict_params, order_params }) => {
  let { query, values } = new lib.Query().select()
    .props(props)
    .table("cms_tasker.whiteboard")
    .inners(inners)
    .params(params)
    .strictParams(strict_params)
    .order(order_params).build();
  return db(query, values);
};

Whiteboard.delete = async (id) => {
  let query = `DELETE FROM cms_tasker.whiteboard WHERE id = ?;`;
  return db(query, [id]);
};

module.exports = Whiteboard;
