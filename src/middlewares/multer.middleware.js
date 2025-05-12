import multer from 'multer';

// we are using diskStorage (we can also use memoryStorage depends on use)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname) // will rename the uploaded file to its original name
  }
})

export const upload = multer({ 
    storage, 
})