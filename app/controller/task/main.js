const lib = require('jarmlib');

const Task = require("./../../model/task/main");

const taskController = {};

taskController.create = async (req, res) => {
  let task = new Task();
  task.datetime = lib.date.timestamp.generate();
  task.milestone_id = req.body.milestone_id;
  task.description = req.body.description;

  try {
    let task_response = await task.create();
    if (task_response.err) {
      return res.send({ msg: task_response.err });
    }
    task.id = task_response.insertId;

    return res.send({ done: "Tarefa cadastrada.", task });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar a tarefa."
    });
  }
};

taskController.update = async (req, res) => {
  let task = new Task();
  task.id = req.body.id;
  task.milestone_id = req.body.milestone_id;
  task.description = req.body.description;
  task.status = req.body.status;

  try {
    let task_response = await task.update();
    if (task_response.err) {
      return res.send({ msg: task_response.err });
    }

    return res.send({ done: "Tarefa atualizada." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar a tarefa."
    });
  }
};

taskController.filter = async (req, res) => {
  let task_options = {
    strict_params: { keys: [], values: [] },
    order: [['id', 'desc']]
  };

  lib.Query.fillParam("task.status", req.body.status, task_options.strict_params);

  try {
    let tasks = await Task.filter(task_options);

    return res.send({ tasks });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar a tarefa."
    });
  }
};

taskController.delete = async (req, res) => {
  try {
    let response = await Task.delete({
      strict_params: {
        keys: ['id'], values: [req.params.id]
      }
    });

    return res.send({ done: "Tarefa excluída." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar a tarefa."
    });
  }
};

module.exports = taskController;