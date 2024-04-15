const multer = require('multer');
const path = require('path');
const fs = require('fs');

const destinationDirectory = 'public/Images';

if (!fs.existsSync(destinationDirectory)) {
    fs.mkdirSync(destinationDirectory, { recursive: true }, (error) => {
        if (error) {
            console.error('Error creating directory:', error);
        } else {
            console.log('Directory created successfully');
        }
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, destinationDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

exports.upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 
    }
});
