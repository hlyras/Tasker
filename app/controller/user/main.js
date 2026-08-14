const User = require("./../../model/user/main");

const userController = {};

async function resolveUserId(req) {
  if (req.user && req.user.id) { return req.user.id; }

  try {
    const users = await User.filter({
      strict_params: { keys: [], values: [] },
      order_params: [['id', 'asc']]
    });
    return users && users[0] ? users[0].id : null;
  } catch (error) {
    return null;
  }
}

userController.find = async (req, res) => {
  const user_id = await resolveUserId(req);
  if (!user_id) {
    return res.send({ xp: 0, skipped: true });
  }

  try {
    const [user] = await User.filter({
      strict_params: { keys: ["id"], values: [user_id] }
    });

    return res.send({
      xp: user ? Number(user.xp) || 0 : 0
    });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao buscar o usuário."
    });
  }
};

userController.addXp = async (req, res) => {
  const user_id = await resolveUserId(req);
  if (!user_id) {
    return res.send({ xp: 0, skipped: true });
  }

  const delta = parseInt(req.body.delta, 10);
  if (!delta || Number.isNaN(delta)) {
    return res.send({ msg: "O valor de XP é inválido." });
  }

  try {
    await User.addXp(user_id, delta);

    const [user] = await User.filter({
      strict_params: { keys: ["id"], values: [user_id] }
    });

    return res.send({
      xp: user ? Number(user.xp) || 0 : 0
    });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao atualizar o XP."
    });
  }
};

module.exports = userController;

