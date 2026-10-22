const lib = require('jarmlib');

const Subtask = require("./../../model/subtask/main");

const subtaskController = {};

subtaskController.create = async (req, res) => {
  let subtask = new Subtask();
  subtask.datetime = lib.date.timestamp.generate();
  subtask.task_id = req.body.task_id;
  subtask.description = req.body.description;
  subtask.status = "Pendente";
  subtask.sort_order = req.body.sort_order || 0;

  try {
    let subtask_response = await subtask.create();
    if (subtask_response.err) {
      return res.send({ msg: subtask_response.err });
    }
    subtask.id = subtask_response.insertId;

    return res.send({ done: "Subtarefa cadastrada.", subtask });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar a subtarefa."
    });
  }
};

subtaskController.update = async (req, res) => {
  let subtask = new Subtask();
  subtask.id = req.body.id;
  subtask.description = req.body.description;
  subtask.status = req.body.status;
  subtask.sort_order = req.body.sort_order;

  const has_due_date = Object.prototype.hasOwnProperty.call(req.body, "due_date");
  const clear_due_date = has_due_date && (req.body.due_date === null || req.body.due_date === "");

  if (has_due_date && !clear_due_date) {
    const due_date = Number(req.body.due_date);
    if (!due_date) {
      return res.send({ msg: "O prazo de finalização é inválido." });
    }
    subtask.due_date = due_date;
  }

  try {
    const fields = lib.convertTo.object(subtask);
    const has_changes = Object.keys(fields).some(key => key !== "id");

    if (has_changes) {
      let subtask_response = await subtask.update();
      if (subtask_response.err) {
        return res.send({ msg: subtask_response.err });
      }
    }

    if (clear_due_date) {
      await Subtask.clearDueDate(subtask.id);
    }

    if (!has_changes && !clear_due_date) {
      return res.send({ msg: "Nenhuma alteração informada." });
    }

    return res.send({ done: "Subtarefa atualizada." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao atualizar a subtarefa."
    });
  }
};

subtaskController.filter = async (req, res) => {
  let subtask_options = {
    props: ["subtask.*"],
    inners: [],
    strict_params: { keys: [], values: [] },
    order_params: [['sort_order', 'asc'], ['id', 'asc']]
  };

  lib.Query.fillParam("subtask.task_id", req.body.task_id, subtask_options.strict_params);
  lib.Query.fillParam("subtask.status", req.body.status, subtask_options.strict_params);

  try {
    let subtasks = await Subtask.filter(subtask_options);

    return res.send({ subtasks });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao filtrar as subtarefas."
    });
  }
};

subtaskController.reorder = async (req, res) => {
  let { subtasks } = req.body;

  if (!subtasks || !subtasks.length) {
    return res.send({ msg: "Nenhuma subtarefa informada." });
  }

  try {
    for (let i = 0; i < subtasks.length; i++) {
      let subtask = new Subtask();
      subtask.id = subtasks[i];
      subtask.sort_order = i + 1;
      await subtask.update();
    }

    return res.send({ done: "Ordem das subtarefas atualizada." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao reordenar as subtarefas."
    });
  }
};

subtaskController.delete = async (req, res) => {
  try {
    await Subtask.delete(req.params.id);

    return res.send({ done: "Subtarefa excluída." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao excluir a subtarefa."
    });
  }
};

module.exports = subtaskController;
