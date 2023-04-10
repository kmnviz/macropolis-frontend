import path from 'path';

const validateAudio = (file, size) => {
    const allowedExtensions = ['.wav', '.flac', '.aiff'];
    const extension = path.extname(file.name);
    const mimetype = file.type;

    if (!allowedExtensions.includes(extension) || !mimetype.startsWith('audio/')) {
        return false;
    }

    return file.size <= size;
}

export default validateAudio;
