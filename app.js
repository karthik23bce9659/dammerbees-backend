const express = require("express");
const app =express();
const bcrypt = require("bcrypt");
const {open} = require("sqlite");
const sqlite3 =require("sqlite3");
app.use(express.json());
const path = require("path");
const cors = require("cors");
app.use(cors());
const dbPath = path.join(__dirname,"store.db");
let db;

const instilizationDbAndServer =  async () => {
    try {


    db = await open( {
        filename:"./store.db",
        driver:sqlite3.Database
    });
    
    const PORT = process.env.PORT || 5000;

     app.listen(PORT, () => {
        console.log("server is hosting at 5000");
    });
    } catch(e) {
        console.log(e.message);
        process.exit(1);
    }


}
instilizationDbAndServer();

app.post('/register', async (req, res) => {
  const {name,email, password} = req.body;
  const hasedPassword = await bcrypt.hash(password, 10)
  const checkUser = `select * from user where name='${name}'`
  const dbuser = await db.get(checkUser)
  if (!email || !name || !password) {
    res.status(400)
    res.send('Invalid input')
    return
  }
  if (dbuser === undefined) {
    const query = `insert into user(name,email,password) 
      values('${name}','${email}','${hasedPassword}')`
    
      await db.run(query);

      res.status(200)
      res.send('User created successfully')
    
  } else {
    res.status(400)
    res.send('User already exists')
  }
})

app.post('/login', async (req, res) => {
  const {name, password} = req.body

  const q = `select * from user where name='${name}'`
  const checkUser = await db.get(q)
  console.log(password)
  if (checkUser === undefined) {
    res.status(400)
    res.send('Invalid user')
  } else {
    console.log(checkUser.name);
    const checkpassword = await bcrypt.compare(password, checkUser.password)
    if (checkpassword) {
      res.status(200)
      res.send(200);
    } else {
      console.log(checkUser.password)
      res.status(400)
      res.send('sorry dude please check your pssword');
    }
  }
})

app.post("/product",async (req,res) => {
  let {name,price,description,image,category,stock} = req.body;
  let q  = `insert into products(name,price,description,image,category,stock) values('${name}','${price}','${description}','${image}','${category}','${stock}')`;
  await db.run(q);
  res.send(200);
})

app.get("/product/", async (req,res) => {
  let {name}=req.query;
  let q =`select * from products where name like '%${name}%' or description like '%${name}%' or category like '%${name}%'`;
  let search_Results = await db.all(q);
  console.log(search_Results);
  res.send(search_Results);
})

app.get("/products/", async(req,res) => {
  let q =`select * from products`;
  let search_Results = await db.all(q);
  console.log(search_Results);
  res.send(search_Results);
  

})