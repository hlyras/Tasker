const router = require("express").Router();
const lib = require('jarmlib');

const Whiteboard = require("../controller/whiteboard/main");

router.post('/create', lib.route.toHttps, Whiteboard.create);
router.post('/update', lib.route.toHttps, Whiteboard.update);
router.post('/filter', lib.route.toHttps, Whiteboard.filter);
router.post('/find', lib.route.toHttps, Whiteboard.find);
router.delete('/delete/:id', lib.route.toHttps, Whiteboard.delete);

module.exports = router;
