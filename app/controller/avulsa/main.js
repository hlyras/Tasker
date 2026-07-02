const lib = require('jarmlib');

const AvulsaTask = require("./../../model/avulsa/main");

const avulsaController = {};

avulsaController.create = async (req, res) => {
  const task = new AvulsaTask();
  task.datetime = lib.date.timestamp.generate();
  task.description = (req.body.description || "").trim();
  task.status = "Pendente";
  task.recurrence_type = req.body.recurrence_type === "Recorrente" ? "Recorrente" : "Unica";

  if (!task.description) {
    return res.send({ msg: "A descrição da tarefa avulsa é obrigatória." });
  }

  try {
    const task_response = await task.create();
    if (task_response.err) {
      return res.send({ msg: task_response.err });
    }

    task.id = task_response.insertId;

    return res.send({ done: "Tarefa avulsa criada.", avulsa_task: task });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao criar a tarefa avulsa."
    });
  }
};

avulsaController.update = async (req, res) => {
  const task = new AvulsaTask();
  task.id = req.body.id;

  if (req.body.description !== undefined) {
    task.description = (req.body.description || "").trim();
    if (!task.description) {
      return res.send({ msg: "A descrição da tarefa avulsa é obrigatória." });
    }
  }

  if (req.body.status !== undefined) {
    task.status = req.body.status;
  }

  if (req.body.recurrence_type !== undefined) {
    task.recurrence_type = req.body.recurrence_type === "Recorrente" ? "Recorrente" : "Unica";
  }

  try {
    const task_response = await task.update();
    if (task_response.err) {
      return res.send({ msg: task_response.err });
    }

    return res.send({ done: "Tarefa avulsa atualizada." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao atualizar a tarefa avulsa."
    });
  }
};

avulsaController.filter = async (req, res) => {
  const task_options = {
    strict_params: { keys: [], values: [] },
    order_params: [['datetime', 'desc'], ['id', 'desc']]
  };

  lib.Query.fillParam("avulsa_task.status", req.body.status, task_options.strict_params);

  try {
    const avulsa_tasks = await AvulsaTask.filter(task_options);

    return res.send({ avulsa_tasks });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao filtrar as tarefas avulsas."
    });
  }
};

avulsaController.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.send({ msg: "O id da tarefa avulsa é inválido." });
    }

    if (isNaN(req.params.id)) {
      return res.send({ msg: "O id da tarefa avulsa deve ser um número." });
    }

    await AvulsaTask.delete(req.params.id);

    return res.send({ done: "Tarefa avulsa excluída." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao excluir a tarefa avulsa."
    });
  }
};

module.exports = avulsaController;
