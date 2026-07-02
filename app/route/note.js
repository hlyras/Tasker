const router = require("express").Router();
const lib = require('jarmlib');

const Note = require("../controller/note/main");

router.post('/create', lib.route.toHttps, Note.create);
router.post('/update', lib.route.toHttps, Note.update);
router.post('/filter', lib.route.toHttps, Note.filter);
router.delete('/delete/:id', lib.route.toHttps, Note.delete);

module.exports = router;
