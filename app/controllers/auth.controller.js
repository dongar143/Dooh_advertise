const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Screen = db.screen;


var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const multer = require('multer');

// Multer configuration
const upload = multer({ dest: 'uploads/' });

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      const token = jwt.sign({ id: user.id },
                              config.secret,
                              {
                                algorithm: 'HS256',
                                allowInsecureKeySizes: true,
                                expiresIn: 86400, // 24 hours
                              });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
};



// Controller actions
// exports.create_screen =  async (req, res, next) => {
//     try {
//         const screen = new Screen({
//             image: req.file.originalname,
//             location: req.body.location,
//             decription: req.body.descrition,
//             expected_impression: req.body.expected_impression,
//             screen_height: req.body.screen_height,
//             screen_width: req.body.screen_width,
//             price: req.body.price 

//         });
//         await screen.save();
//         res.json({ message: 'Screen Added successfully' });
//     } catch (error) {
//         next(error);
//     }
// };

exports.create_screen = upload.array('images', 5), async (req, res, next) => {
    try {

       const protocol = req.protocol;
    const host = req.hostname;
    const url = req.originalUrl;
    const files = req.files;

    const imageFile = files['image'][0];
    
    var fullUrl = req.protocol + '://' + req.get('host');

    `${fullUrl}/uploads/${imageFile.filename}`

    const uploadLink = fullUrl+'/uploads/'+imageFile.filename;
    console.log(`${fullUrl}/uploads/${imageFile.filename}`);

        const screens = [];
        // for (const file of req.files) {
           // const file = req.files;

            const screen = new Screen({
            image: uploadLink,
            location: req.body.location,
            decription: req.body.descrition,
            expected_impression: req.body.expected_impression,
            screen_height: req.body.screen_height,
            screen_width: req.body.screen_width,
            price: req.body.price 
            });
            await screen.save();
            screens.push(screen);
        // }
        res.json({ message: 'Images uploaded successfully', screens });
    } catch (error) {
        next(error);
    }
};


exports.get_screen = async (req, res, next) => {
    try {
        const screen = await Screen.find();
        if (!screen) {
            return res.status(404).json({ message: 'Screen Not Found' });
        }
        // res.set('Content-Type', screen.contentType);
        res.status(200).send(screen);
        // res.json({message:'here it is'},screen.data);
    } catch (error) {
    // console.log("here is error",error);
    res.status(500).send("There was a problem");
    }
};


exports.get_fliter_screen = async (req, res, next) => {
    try {
        let query = {};

        // Apply filters
        if (req.query.location) {
            query.category = req.query.location;
        }
        if (req.query.screen_height) {
            query.category = req.query.screen_height;
        }
        if (req.query.screen_width) {
            query.category = req.query.screen_width;
        }
        if (req.query.priceMin && req.query.priceMax) {
            query.price = { $gte: req.query.priceMin, $lte: req.query.priceMax };
        } else if (req.query.priceMin) {
            query.price = { $gte: req.query.priceMin };
        } else if (req.query.priceMax) {
            query.price = { $lte: req.query.priceMax };
        }

        const screen = await Screen.find(query);
        res.json(screen);
    } catch (error) {
        next(error);
    }
};
