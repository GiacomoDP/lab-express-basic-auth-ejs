const bcrypt = require('bcryptjs/dist/bcrypt');
const { Router } = require('express');
const router = new Router();
 
// GET route ==> to display the signup form to users
router.get('/signup', (req, res) => res.render('auth/signup'));
// POST route ==> to process form data
router.post('/signup', (req, res, next) => {
    const {name, email, password} = req.body
   try {
    
    const salt = await bcryptjs
    .genSalt(saltRounds)
    const hasPassword = await bcryptjs.hash(password, salt))
    .then(hashedPassword => {
      console.log(`Password hash: ${hashedPassword}`);
      const userFromDB = await user.creat({
          name,
          email, 
          password
       passwordHas: hasPassword 
      })
   })
    .catch(error => next(error));
});
   /* console.log('The form data: ', req.body);
    res.send("user informations")
  });*/

  module.exports = router;
