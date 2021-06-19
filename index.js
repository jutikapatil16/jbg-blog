require("dotenv").config()
const express = require('express')
const app = express()
const path = require("path")
const logger = require("morgan")
const mongoose = require("mongoose")
const User = require("./models/user")
const session = require("express-session")
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')




app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}))


//template engine EJS
app.set("view-engine", "ejs")

app.use(express.static(path.join(__dirname, "public")))
app.use(logger("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/css",
  express.static(path.join(__dirname, "node_modules/mdb-ui-kit/css")));
app.use("/js",
  express.static(path.join(__dirname, "node_modules/mdb-ui-kit/js")));

//CONNECTED MONGO_DB
const db = require('./config/keys').MongoURI;
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true, useCreateIndex: true,
  useUnifiedTopology: true,
}).then(() => console.log("DB connected "))
  .catch(err => console.log(err))



app.use(methodOverride('_method'))
app.use('/articles', articleRouter)



//SIGNUP GET
app.get("/login", (req, res) => {
  res.render("login.ejs")
})

//SIGNUP POST
app.post("/signup", async (req, res) => {
  console.log(req.body)
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    })
    await user.save();
    res.redirect("/login")
  } catch {
    res.redirect("/")

  }

})

//LOGIN GET
app.get("/login", (req, res) => {
  res.render("login.ejs")
})

//LOGIN POST
app.post("/signin", async (req, res) => {
  console.log(req.body)
  await User.findOne({ email: req.body.email }).then(data => {
    if (req.body.password == data.password) {
      req.session.user = data
      res.redirect("/articles")
    }
  }).catch(e => {
    console.log(e)
    res.send("error")
  })

})

//routes for frontend
app.get("/", (req, res) => {
  res.render("index.ejs")

}
)
app.get("/about", (req, res) => {
  res.render("about.ejs")

}
)
app.get("/tech", (req, res) => {
  res.render("tech.ejs")

}
)
app.get("/travel", (req, res) => {
  res.render("travel.ejs")

}
)
app.get("/upgrade", (req, res) => {
  res.render("upgrade.ejs")

}
)
app.get("/reviews", (req, res) => {
  res.render("reviews.ejs")

}
)
app.get("/lifestyle", (req, res) => {
  res.render("lifestyle.ejs")

}
)
//get request for CRUD
app.get('/articles', checkAuthentication, async (req, res) => {
  const articles = await Article.find({ createdBy: req.session.user._id }).sort({ createdAt: 'desc' })
  res.render('articles/art.ejs', { articles: articles })
})
//logout
app.post("/logout", (req, res) => {

  req.session.destroy()
  res.redirect("/")
})
//middlewares
function checkAuthentication(req, res, next) {
  if (req.session.user) {
    return next();

  }

  else {
    res.redirect("/")
  }
}

app.use(function (req, res) {
  res.send("Page not found");
})
let port = process.env.PORT || 80;



//listening to port
app.listen(port, () => {
  console.log("listening to port 80")
})





