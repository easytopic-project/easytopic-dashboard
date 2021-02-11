export const {
    PORT = 3000,
    QUEUE_SERVER = 'localhost:5672',
    FILES_PATH = '/temp', // Folder where temporally files will be stored
    FILES_SERVER = 'localhost:3000', // Files server,
    OCR_INPUT_QUEUE = 'ocr-in',
    OCR_OUTPUT_QUEUE = 'ocr-out',
} = process.env;
