const lib = require('jarmlib');

const Whiteboard = require("./../../model/whiteboard/main");

const whiteboardController = {};

const DEFAULT_CANVAS = { panX: 80, panY: 80, zoom: 1, items: [] };

function parseCanvas(value) {
  if (value && typeof value === "object") {
    return whiteboardController.normalizeCanvas(value);
  }

  try {
    return whiteboardController.normalizeCanvas(JSON.parse(value || ""));
  } catch (error) {
    return { ...DEFAULT_CANVAS, items: [] };
  }
}

function stringifyCanvas(value) {
  return JSON.stringify(whiteboardController.normalizeCanvas(value));
}

whiteboardController.normalizeCanvas = (canvas = {}) => {
  return {
    panX: Number.isFinite(canvas.panX) ? canvas.panX : DEFAULT_CANVAS.panX,
    panY: Number.isFinite(canvas.panY) ? canvas.panY : DEFAULT_CANVAS.panY,
    zoom: Number.isFinite(canvas.zoom) ? canvas.zoom : DEFAULT_CANVAS.zoom,
    items: Array.isArray(canvas.items) ? canvas.items : []
  };
};

function boardPayload(row) {
  const canvas = parseCanvas(row && row.canvas);
  return {
    id: row.id,
    datetime: row.datetime,
    name: row.name,
    description: row.description || "",
    panX: canvas.panX,
    panY: canvas.panY,
    zoom: canvas.zoom,
    items: canvas.items
  };
}

whiteboardController.create = async (req, res) => {
  let whiteboard = new Whiteboard();
  whiteboard.datetime = lib.date.timestamp.generate();
  whiteboard.name = (req.body.name || "").trim();
  whiteboard.description = (req.body.description || "").trim();
  whiteboard.canvas = stringifyCanvas(req.body.canvas);

  if (!whiteboard.name) {
    return res.send({ msg: "O nome do quadro não pode ser vazio." });
  }

  try {
    let whiteboard_response = await whiteboard.create();
    if (whiteboard_response.err) {
      return res.send({ msg: whiteboard_response.err });
    }

    whiteboard.id = whiteboard_response.insertId;

    return res.send({
      done: "Quadro salvo.",
      whiteboard: boardPayload(whiteboard)
    });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao salvar o quadro."
    });
  }
};

whiteboardController.update = async (req, res) => {
  let whiteboard = new Whiteboard();
  whiteboard.id = req.body.id;

  if (!whiteboard.id) {
    return res.send({ msg: "O id do quadro é inválido." });
  }

  if (req.body.name !== undefined) {
    whiteboard.name = (req.body.name || "").trim();
    if (!whiteboard.name) {
      return res.send({ msg: "O nome do quadro não pode ser vazio." });
    }
  }

  if (req.body.description !== undefined) {
    whiteboard.description = (req.body.description || "").trim();
  }

  if (req.body.canvas !== undefined) {
    whiteboard.canvas = stringifyCanvas(req.body.canvas);
  }

  if (whiteboard.name === undefined && whiteboard.description === undefined && whiteboard.canvas === undefined) {
    return res.send({ msg: "Nenhuma alteração informada." });
  }

  try {
    let whiteboard_response = await whiteboard.update();
    if (whiteboard_response.err) {
      return res.send({ msg: whiteboard_response.err });
    }

    return res.send({ done: "Quadro atualizado." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao atualizar o quadro."
    });
  }
};

whiteboardController.filter = async (req, res) => {
  try {
    let rows = await Whiteboard.filter({
      order_params: [['id', 'desc']]
    });

    return res.send({
      whiteboards: (rows || []).map(boardPayload)
    });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao filtrar os quadros."
    });
  }
};

whiteboardController.find = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.send({ msg: "O id do quadro é inválido." });
    }

    const [row] = await Whiteboard.filter({
      strict_params: { keys: ["id"], values: [req.body.id] }
    });

    if (!row) {
      return res.send({ msg: "Quadro não encontrado." });
    }

    return res.send({ whiteboard: boardPayload(row) });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao buscar o quadro."
    });
  }
};

whiteboardController.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.send({ msg: "O id do quadro é inválido." });
    }

    if (isNaN(req.params.id)) {
      return res.send({ msg: "O id do quadro deve ser um número." });
    }

    await Whiteboard.delete(req.params.id);

    return res.send({ done: "Quadro excluído." });
  } catch (error) {
    console.log(error);
    res.send({
      msg: "Ocorreu um erro ao excluir o quadro."
    });
  }
};

module.exports = whiteboardController;
