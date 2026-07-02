const db = require('../../../config/connection');
const lib = require('jarmlib');

const Note = function () {
  this.id;
  this.datetime;
  this.content;

  this.create = () => {
    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.save(obj, 'cms_tasker.note');

    return db(query, values);
  };

  this.update = () => {
    if (!this.id) { return { err: "O id da anotação é inválido" }; }

    let obj = lib.convertTo.object(this);
    let { query, values } = lib.Query.update(obj, 'cms_tasker.note', 'id');

    return db(query, values);
  };
};

Note.filter = ({ props, inners, params, strict_params, order_params }) => {
  let { query, values } = new lib.Query().select()
    .props(props)
    .table("cms_tasker.note")
    .inners(inners)
    .params(params)
    .strictParams(strict_params)
    .order(order_params).build();
  return db(query, values);
};

Note.delete = async (id) => {
  let query = `DELETE FROM cms_tasker.note WHERE id = ?;`;
  return db(query, [id]);
};

module.exports = Note;
