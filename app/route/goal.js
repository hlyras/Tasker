const router = require("express").Router();
const lib = require('jarmlib');

const Goal = require("../controller/goal/main");

router.post('/create', lib.route.toHttps, Goal.create);
router.post('/update', lib.route.toHttps, Goal.update);
router.post('/filter', lib.route.toHttps, Goal.filter);
router.delete('/delete/:id', lib.route.toHttps, Goal.delete);

module.exports = router;