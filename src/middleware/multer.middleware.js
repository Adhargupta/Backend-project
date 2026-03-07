import multer from 'multer'


// ********************************** Directly sopied from multer ********************************** //

// what it does is it creates a storage engine for temporary files that tells multer where to store the uploaded files and how to name them.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/public/temp')                                      // it stores the uploaded files in the "public/temp" directory (we will later upload these files to cloudinary and then delete them from this directory)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({
    storage, 
})
  