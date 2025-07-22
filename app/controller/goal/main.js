const lib = require('jarmlib');

const Goal = require("./../../model/goal/main");

const goalController = {};

goalController.create = async (req, res) => {
  let goal = new Goal();
  goal.datetime = lib.date.timestamp.generate();
  goal.description = req.body.description;

  try {
    let goal_response = await goal.create();
    if (goal_response.err) {
      return res.send({ msg: goal_response.err });
    }

    goal.id = goal_response.insertId;

    return res.send({ done: "Objetivo cadastrado.", goal });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar o objetivo."
    });
  }
};

goalController.update = async (req, res) => {
  let goal = new Goal();
  goal.id = req.body.id;
  goal.description = req.body.description;
  goal.status = req.body.status;

  try {
    let goal_response = await goal.update();
    if (goal_response.err) {
      return res.send({ msg: goal_response.err });
    }

    return res.send({ done: "Objetivo atualizado." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar o objetivo."
    });
  }
};

goalController.filter = async (req, res) => {
  try {
    let goals = await Goal.filter({ order: [['id', 'desc']] });

    return res.send({ goals });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar o objetivo."
    });
  }
};

goalController.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.send({ msg: "O id do objetivo é inválido." });
    }

    if (isNaN(req.params.id)) {
      return res.send({ msg: "O id do objetivo deve ser um número." });
    }

    let response = await Goal.delete({
      strict_params: {
        keys: ['id'], values: [req.params.id]
      }
    });

    return res.send({ done: "Objetivo excluído." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar o objetivo."
    });
  }
};

module.exports = goalController;