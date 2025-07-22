const router = require("express").Router();
const lib = require('jarmlib');

const Milestone = require("../controller/milestone/main");

router.post('/create', lib.route.toHttps, Milestone.create);
router.post('/update', lib.route.toHttps, Milestone.update);
router.post('/filter', lib.route.toHttps, Milestone.filter);
router.delete('/delete/:id', lib.route.toHttps, Milestone.delete);

module.exports = router;