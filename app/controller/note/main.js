const lib = require('jarmlib');

const Note = require("./../../model/note/main");

const noteController = {};

noteController.create = async (req, res) => {
  let note = new Note();
  note.datetime = lib.date.timestamp.generate();
  note.content = (req.body.content || "").trim();

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
  note.content = (req.body.content || "").trim();

  if (!note.content) {
    return res.send({ msg: "A anotação não pode ser vazia." });
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
  try {
    let notes = await Note.filter({ order: [['datetime', 'desc'], ['id', 'desc']] });

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
