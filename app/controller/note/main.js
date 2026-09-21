const lib = require('jarmlib');

const Note = require("./../../model/note/main");

const noteController = {};

noteController.create = async (req, res) => {
  let note = new Note();
  note.datetime = lib.date.timestamp.generate();
  note.content = (req.body.content || "").trim();
  note.status = "Ativo";
  note.sort_order = req.body.sort_order ?? 0;

  if (!note.content) {
    return res.send({ msg: "A anotação não pode ser vazia." });
  }

  try {
    let note_response = await note.create();
    if (note_response.err) {
      return res.send({ msg: note_response.err });
    }

    note.id = note_response.insertId;

    return res.send({ done: "Anotação salva.", note });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao salvar a anotação."
    });
  }
};

noteController.update = async (req, res) => {
  let note = new Note();
  note.id = req.body.id;

  if (!note.id) {
    return res.send({ msg: "O id da anotação é inválido." });
  }

  if (req.body.content !== undefined) {
    note.content = (req.body.content || "").trim();
    if (!note.content) {
      return res.send({ msg: "A anotação não pode ser vazia." });
    }
  }

  if (req.body.status !== undefined) {
    if (req.body.status !== "Ativo" && req.body.status !== "Inativo") {
      return res.send({ msg: "O status da anotação é inválido." });
    }
    note.status = req.body.status;
  }

  if (req.body.sort_order !== undefined) {
    note.sort_order = req.body.sort_order;
  }

  if (note.content === undefined && note.status === undefined && note.sort_order === undefined) {
    return res.send({ msg: "Nenhuma alteração informada." });
  }

  try {
    let note_response = await note.update();
    if (note_response.err) {
      return res.send({ msg: note_response.err });
    }

    return res.send({ done: "Anotação atualizada." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao atualizar a anotação."
    });
  }
};

noteController.filter = async (req, res) => {
  let note_options = {
    strict_params: { keys: [], values: [] },
    order_params: [['sort_order', 'asc'], ['id', 'desc']]
  };

  lib.Query.fillParam("note.status", req.body.status, note_options.strict_params);

  try {
    let notes = await Note.filter(note_options);

    return res.send({ notes });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao filtrar as anotações."
    });
  }
};

noteController.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.send({ msg: "O id da anotação é inválido." });
    }

    if (isNaN(req.params.id)) {
      return res.send({ msg: "O id da anotação deve ser um número." });
    }

    await Note.delete(req.params.id);

    return res.send({ done: "Anotação excluída." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao excluir a anotação."
    });
  }
};

module.exports = noteController;
