const router = require("express").Router();
const lib = require('jarmlib');

const Subtask = require("../controller/subtask/main");

router.post('/create', lib.route.toHttps, Subtask.create);
router.post('/update', lib.route.toHttps, Subtask.update);
router.post('/filter', lib.route.toHttps, Subtask.filter);
router.post('/reorder', lib.route.toHttps, Subtask.reorder);
router.delete('/delete/:id', lib.route.toHttps, Subtask.delete);

module.exports = router;
