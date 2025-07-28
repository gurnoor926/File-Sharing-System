import express from "express";
import pg from "pg";
import cors from "cors";
import multer from "multer";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from 'url';
import  env, { configDotenv } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
env.config();

const app = express();
app.use(express.json());
const port = 3000;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // directory to save uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use original filename (not recommended for production)
  },
});
const saltRounds = process.env.SALT_ROUNDS;
const JWT_Secret = process.env.JWT_SECRET;
// Create multer instance
const upload = multer({ storage: storage });
app.use(cors());
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();
function authenticateToken(req,res,next){
  const token = req.headers.authorization?.split(' ')[1];
  if(!token){
    return res.status(401).json({message:"Unauthorized"})
  }
  jwt.verify(token,JWT_Secret,(err,user)=>{
    if(err){
      return res.status(403).json({message:"Forbidden"})
    }
    req.user = user;
     next();
  })
}
app.get("/users", async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM users");
    const data = res.json(response.rows);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
});
app.post("/login", upload.none(), async (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  try {
    const result = await db.query(
      "select * from users where email = $1 ",
      [email,]
    );
    console.log(result.rows);
    if (result.rows.length === 1) {
      const user = result.rows[0];
      const storedPassword = user.password_hash;
      const isMatch= await bycrpt.compare(password,storedPassword);
      if(isMatch){
      const token = jwt.sign({ email: user.email, id: user.id }, JWT_Secret, {
          expiresIn: process.env.JWT_EXPIRES,
        });
        return res.json({ success: true, token, user });
      }
      else{
        console.log("Invalid Password");
      }
    }else{
      console.log("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/register", upload.none(), async (req, res) => {
 /*  console.log(req.body); */
  const username = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  bycrpt.hash(password,saltRounds , async(err, hash) => {
    if (err){
      console.error(err);
    }else{
      try {
    const response = await db.query(
      "insert into users(name,email,password_hash) values($1,$2,$3) returning *",
      [username, email, hash]
    );
    const user = response.rows[0]
    const token = jwt.sign({ email: user.email, id: user.id }, JWT_Secret, {
          expiresIn: process.env.JWT_EXPIRES,
        });
    console.log(response.rows[0]);
    res.json({success:true , token , user});
  } catch (err) {
    console.error(err);
  }
    }
    });
});
app.post("/upload_files",authenticateToken, upload.single("file"), async (req, res) => {
  /* console.log(req.file);
  console.log(req.body);
  console.log(req.file.path); */
  const filename = req.body.filename;
  const filePath = req.file.path;
  const description = req.body.description;
  const userId = req.user.id;
  /* console.log(userId) */

  try {
    const result = await db.query(
      "INSERT INTO files (filename, filepath , description,uploaded_by) VALUES ($1, $2, $3,$4) returning *",
      [filename, filePath, description, userId]
    );
    /* console.log(result.rows[0]); */
    if(result.rows.length >0){
        res.json({success:true, file:result.rows[0]});
    }
    else{
        res.json({success:false});
    }
  } catch (error) {
    console.error(error);
  }
});
app.get("/files", authenticateToken, async (req, res) => {
  try{
    const result = await db.query("SELECT * FROM files");
    /* console.log(result.rows) */
    res.json(result.rows);
  }catch(err){
   console.error(err)
  }
});
app.get("/user_uploads/:id",authenticateToken, async(req,res)=>{
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM files WHERE uploaded_by = $1", [id]);
  /*  console.log(result.rows) */
    res.json(result.rows);
  } catch (error) {
    console.error(error)
  }
});
app.get("/file/:filename", authenticateToken, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);
  console.log(filePath)
  res.download(filePath, filename, (err) => {
    if (err) {
      /* console.log("Error in download:", err); */
      res.status(404).send("File not found");
    }
  });
});
app.delete("/delete_file/:id",authenticateToken, async (req,res)=>{
  const id = req.params.id;
  try {
    const result = await db.query("DELETE FROM files WHERE id = $1", [id]);
    if(result){
      res.json({success:true});
    }else{
      res.json({success:false});
    }
  } catch (error) {
    console.error(error);
  }
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
