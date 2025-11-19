const router = require("express").Router();
const homeController = require("../controller/home");
const passport = require('../../config/passport');

console.log("CallbackURL:", `${process.env.BASE_URL}/auth/google/callback`);

router.get('/', (req, res) => {
  const { login_error } = req.query;

  if (login_error) {
    console.log("Falha no login via Google:", login_error);
  }

  if (req.isAuthenticated()) {
    return res.render('home/index');
  }

  return res.render('landing/index', { login_error });
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback', (req, res, next) => {
  console.log("CallbackURL:", `${process.env.BASE_URL}/auth/google/callback`);
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      return res.redirect('/?login_error=internal');
    }

    if (!user) {
      return res.redirect('/?login_error=google');
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.redirect('/?login_error=session');
      }

      return res.redirect('/');
    });

  })(req, res, next);
});

// router.use("/user", require("./user"));
router.use("/goal", require("./goal"));
router.use("/milestone", require("./milestone"));
router.use("/task", require("./task"));

module.exports = router;