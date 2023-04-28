import path from 'path';

const validateArchive = (file, size) => {
    const allowedExtensions = ['.zip', '.rar'];
    const allowedMimetypes = ['application/zip', 'application/x-rar-compressed'];
    const extension = path.extname(file.name);
    const mimetype = file.type;

    if (!allowedExtensions.includes(extension) || !allowedMimetypes.includes(mimetype)) {
        return false;
    }

    return file.size <= size;
}

export default validateArchive;
