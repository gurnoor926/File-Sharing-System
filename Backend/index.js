import express from "express";
import pg from "pg";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from 'url';
import  env, { configDotenv } from "dotenv";
import authenticateToken from "./middlewares/authenticateToken.js";
import formData from "./middlewares/formData.js";
import fileData from "./middlewares/fileData.js";
import bucket from "./firebase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
env.config();

const app = express();
app.use(express.json());
const port = process.env.PORT;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // directory to save uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use original filename (not recommended for production)
  },
});
const saltRounds = parseInt(process.env.SALT_ROUNDS);
const JWT_Secret = process.env.JWT_SECRET;
// Create multer instance
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors({
  origin: "https://sendora-ybt9.onrender.com",
}));
const db = new pg.Client({
  connectionString : process.env.DATABASE_URL,
  ssl:{rejectUnauthorized:false}
});
db.connect();
app.post("/login", upload.none(),formData , async (req, res) => {
  console.log(req.body);
  const {email,password} = req.cleanedData;
  try {
    const result = await db.query(
      "select * from users where email = $1 ",
      [email,]
    );
    console.log(result.rows);
    if (result.rows.length === 1) {
      const user = result.rows[0];
      const storedPassword = user.password_hash;
      const isMatch= await bcrypt.compare(password,storedPassword);
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
app.post("/register", upload.none(),formData, async (req, res) => {
 /*  console.log(req.body); */
 const { name, email, password } = req.cleanedData;
  bcrypt.hash(password,saltRounds , async(err, hash) => {
    if (err){
      console.error(err);
    }else{
      try {
    const response = await db.query(
      "insert into users(name,email,password_hash) values($1,$2,$3) returning *",
      [name, email, hash]
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
app.post("/upload_files", authenticateToken, upload.single("file"), fileData, async (req, res) => {
  try {
    const { filename, description, userId } = req.fileData;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Create a Firebase Storage blob reference
    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      console.error("Upload error:", err);
      return res.status(500).json({ success: false, message: "File upload failed" });
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      try {
        const result = await db.query(
          "INSERT INTO files (filename, filepath, description, uploaded_by) VALUES ($1, $2, $3, $4) RETURNING *",
          [filename, publicUrl, description, userId]
        );

        if (result.rows.length > 0) {
          return res.json({ success: true, file: result.rows[0] });
        } else {
          return res.json({ success: false });
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        return res.status(500).json({ success: false, message: "Database insert failed" });
      }
    });

    // Start uploading to Firebase
    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ success: false, message: "Unexpected server error" });
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
app.get("/file/:filename", authenticateToken, async (req, res) => {
  try {
    const filename = req.params.filename;

    // Get file info from DB
    const result = await db.query(
      "SELECT file_url FROM files WHERE filename = $1",
      [filename]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("File not found in database");
    }

    const fileUrl = result.rows[0].file_url; // This is the Firebase public URL
    return res.redirect(fileUrl); // Redirect to Firebase URL so browser downloads it
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
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
