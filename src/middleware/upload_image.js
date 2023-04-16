import multer from "multer"

const upload = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(png|jpg|jfif|jpeg)$/)){
            return callback(new Error('File must be a .jpg|.jfif|.jpeg'))
        }
        callback(undefined, true)
    }
})

export default upload