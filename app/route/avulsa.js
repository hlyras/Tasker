const router = require("express").Router();
const lib = require('jarmlib');

const Avulsa = require("../controller/avulsa/main");

router.post('/create', lib.route.toHttps, Avulsa.create);
router.post('/update', lib.route.toHttps, Avulsa.update);
router.post('/filter', lib.route.toHttps, Avulsa.filter);
router.delete('/delete/:id', lib.route.toHttps, Avulsa.delete);

module.exports = router;
