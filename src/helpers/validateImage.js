import path from 'path';

const validateImage = (file, size) => {
    console.log('file: ', file);

    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    const extension = path.extname(file.name);
    const mimetype = file.type;

    if (!allowedExtensions.test(extension) || !mimetype.startsWith('image/')) return false;
    return file.size <= size;
}

export default validateImage;
