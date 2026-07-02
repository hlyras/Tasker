const router = require("express").Router();
const lib = require('jarmlib');

const Workout = require("../controller/workout/main");

router.post('/create', lib.route.toHttps, Workout.create);
router.post('/update', lib.route.toHttps, Workout.update);
router.post('/filter', lib.route.toHttps, Workout.filter);
router.delete('/delete/:id', lib.route.toHttps, Workout.delete);

module.exports = router;
