export const {
    PORT = 3000,
    QUEUE_SERVER = 'localhost:5672',
    FILES_PATH = '/temp', // Folder where temporally files will be stored
    FILES_SERVER = 'localhost:3000', // Files server,
    OCR_INPUT_QUEUE = 'ocr-in',
    OCR_OUTPUT_QUEUE = 'ocr-out',
    A_E_INPUT_QUEUE = 'audio_extractor_in',
    A_E_OUTPUT_QUEUE = 'audio_extractor_out',
    ASR_INPUT_QUEUE = 'asr_in',
    ASR_OUTPUT_QUEUE = 'asr_out',
    LLF_INPUT_QUEUE = 'low_level_in',
    LLF_OUTPUT_QUEUE = 'low_level_out',
    TS_INPUT_QUEUE = 'topic_segmentation_in',
    TS_OUTPUT_QUEUE = 'topic_segmentation_out',
    RMQ_API = '',
} = process.env;
