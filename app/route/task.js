const router = require("express").Router();
const lib = require('jarmlib');

const Task = require("../controller/task/main");

router.post('/create', lib.route.toHttps, Task.create);
router.post('/update', lib.route.toHttps, Task.update);
router.post('/filter', lib.route.toHttps, Task.filter);
router.delete('/delete/:id', lib.route.toHttps, Task.delete);

module.exports = router;