const express=require("express")
const mongoose=require("mongoose")
const app = express();
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const urlmongoose="mongodb+srv://QRSCAN:9900@cluster0.35mk43j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
app.use(cors());
app.use(express.json())
mongoose.connect(urlmongoose).then(()=>{
    console.log("connect")
}).catch(
    (e)=>{
        console.log("eroorrrr",e)
    }
)

app.get("/",(req,res)=>{
res.send({status:"start"})
})
require('./Sechma')
const user=mongoose.model("Userinfo")
app.post("/signup",async(req,res)=>{
    const {name,password}=req.body
    const olduser = await user.findOne({ name });
   
    if(olduser){
         return res.send({data:'user already'})

    }
    try {
        await user.create({
            name:name,
            password:password,
            
        })
        res.send({ status:'ok', data:"save the data"})
    } catch (error) {
        console.log(error)
    }

})
app.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const existingUser = await user.findOne({ name });

    if (!existingUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (existingUser.password !== password) {
      return res.status(401).send({ message: 'Incorrect password' });
    }

    // Remove password before sending response
    const { password: pw, ...userInfo } = existingUser.toObject();

    return res.send({ message: 'Login successful', user: userInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

// Setup multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where images will be saved (make sure this folder exists)
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-originalname
    cb(null, Date.now() + '-' + file.originalname);
  }
});
// const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { name, latitude, longitude,qrData } = req.body;
    if (!name) return res.status(400).json({ error: "User name is required" });
    if (!req.file) return res.status(400).json({ error: "Image file is required" });

    // Find user by name
    let User = await user.findOne({ name });
    if (!User) {
      return res.status(404).json({ error: "User not found" });
    }

    // Image URL accessible via /uploads route
    const imageUrl = `/uploads/${req.file.filename}`;

    // Push new image URL to user's images array
    User.images.push({
  url: imageUrl,
  latitude: parseFloat(latitude),
  longitude: parseFloat(longitude),
  qrData:qrData,
  uploadedAt: new Date()
});

    // Save user document
    await User.save();

    res.json({ message: "Image uploaded and saved successfully", imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
// app.post("/upload", upload.single('image'), async (req, res) => {
//   try {
//     const { name } = req.body;
//     const file = req.file;

//     if (!file) return res.status(400).send({ error: "No file uploaded" });

//     const User = await user.findOne({ name });
//     if (!User) return res.status(404).send({ error: "User not found" });

//     User.images.push({
//       data: file.buffer,
//       contentType: file.mimetype,
//     });

//     await User.save();
//     res.send({ message: "Image stored in MongoDB Atlas successfully" });

//   } catch (error) {
//     console.error("Upload Error:", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// });


app.listen(5001,()=>{
    console.log("server is start")
})