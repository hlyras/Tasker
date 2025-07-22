const lib = require('jarmlib');

const homeController = {};

homeController.index = async (req, res) => {
  return res.render('home/index', {});
};

module.exports = homeController;