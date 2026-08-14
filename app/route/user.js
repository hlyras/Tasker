const router = require("express").Router();
const lib = require('jarmlib');

const User = require("../controller/user/main");

router.post('/find', lib.route.toHttps, User.find);
router.post('/xp', lib.route.toHttps, User.addXp);

module.exports = router;
