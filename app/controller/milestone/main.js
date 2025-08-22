const lib = require('jarmlib');

const Milestone = require("./../../model/milestone/main");

const milestoneController = {};

milestoneController.create = async (req, res) => {
  let milestone = new Milestone();
  milestone.datetime = lib.date.timestamp.generate();
  milestone.goal_id = req.body.goal_id;
  milestone.description = req.body.description;

  try {
    let milestone_response = await milestone.create();
    if (milestone_response.err) {
      return res.send({ msg: milestone_response.err });
    }

    milestone.id = milestone_response.insertId;

    return res.send({ done: "Meta cadastrada.", milestone });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar a meta."
    });
  }
};

milestoneController.update = async (req, res) => {
  let milestone = new Milestone();
  milestone.id = req.body.id;
  milestone.goal_id = req.body.goal_id;
  milestone.description = req.body.description;
  milestone.status = req.body.status;

  try {
    let milestone_response = await milestone.update();
    if (milestone_response.err) {
      return res.send({ msg: milestone_response.err });
    }

    return res.send({ done: "Meta atualizada." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar a meta."
    });
  }
};

milestoneController.filter = async (req, res) => {
  let milestone_options = {
    strict_params: { keys: [], values: [] },
    order_params: [['id', 'desc']]
  };

  lib.Query.fillParam("milestone.status", req.body.status, milestone_options.strict_params);

  try {
    let milestones = await Milestone.filter(milestone_options);

    return res.send({ milestones });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar a meta."
    });
  }
};

milestoneController.delete = async (req, res) => {
  try {
    let response = await Milestone.delete({
      strict_params: {
        keys: ['id'], values: [req.params.id]
      }
    });

    return res.send({ done: "Meta excluída." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao cadastrar a meta."
    });
  }
};

module.exports = milestoneController;