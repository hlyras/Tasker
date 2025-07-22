const router = require("express").Router();

const homeController = require("../controller/home");

router.get("/", homeController.index);

// router.use("/user", require("./user"));
router.use("/goal", require("./goal"));
router.use("/milestone", require("./milestone"));
router.use("/task", require("./task"));

module.exports = router;