const router = require("express").Router();
const lib = require('jarmlib');

const Calendar = require("../controller/calendar/main");

router.post('/find', lib.route.toHttps, Calendar.find);
router.post('/save', lib.route.toHttps, Calendar.save);

module.exports = router;
