import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Use absolute path for uploads directory
const uploadDir = path.join(__dirname, '../uploads/animals');
console.log('📁 Upload directory:', uploadDir);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Created upload directory');
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // .jpg
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-'); // orange-cat
        const filename = `${name}-${Date.now()}${ext}`;
        console.log('💾 Saving file:', filename);
        cb(null, filename);
    }
});

// File filter - only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files allowed'));
    }
};

export const uploadPhoto = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});