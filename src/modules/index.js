const modules = [];

modules.push({
  id: "ocr",
  name: "OCR",
  description: "OCR module",
  author: "Maxwell Souza",
  email: "maxwell@email",
  input_queue: "ocr-in",
  output_queue: "ocr-out",
  input: [
    {
      id: "file",
      link: true,
      type: "file",
      required: true,
      accept: ["image/*"],
    }
  ],
  output: [
    {
      id: "ocr",
      link: false,
      type: "text",
    },
  ],
});

modules.push({
    id: "ocr-test",
    name: "OCR Test",
    description: "OCR Test module",
    author: "Maxwell Souza",
    email: "maxwell@email",
    input_queue: "ocr-in-test",
    output_queue: "ocr-out-test",
    input: [
      {
        id: "file",
        link: true,
        type: "file",
        required: true,
        accept: ["image/*"],
      }
    ],
    output: [
      {
        id: "ocr",
        link: false,
        type: "text",
      },
    ],
  });

  modules.push({
    id: "worker-audio_extractor",
    name: "Audio Extrator",
    description: "Audio Extrator module",
    author: "Eduardo Soares",
    email: "eduardo@email",
    input_queue: "audio_extractor_in",
    output_queue: "audio_extractor_out",
    input: [
      {
        id: "file",
        link: true,
        type: "file",
        required: true,
        accept: ["video/mp4"],
      },
    ],
    output: [
      {
        id: "audio",
        link: true,
        type: "file",
      },
    ],
  });

  modules.push({
    id: "worker-vad",
    name: "VAD",
    description: "VAD module",
    author: "Eduardo Soares",
    email: "eduardo@email",
    input_queue: "vad_in",
    output_queue: "vad_out",
    input: [
      {
        id: "file",
        link: true,
        type: "file",
        required: true,
        accept: ["audio/*"],
      },
    ],
    output: [
      {
        id: "vad-output",
        link: true,
        type: "file",
      },
    ],
  });

  modules.push({
    id: "worker-asr",
    name: "ASR Worker",
    description: "ASR Worker module",
    author: "Eduardo Soares",
    email: "eduardo@email",
    input_queue: "asr_in",
    output_queue: "asr_out",
    input: [
      {
        id: "file",
        link: true,
        type: "text",
        required: true,
        accept: ["text/*"],
      },
    ],
    output: [
      {
        id: "asr",
        link: true,
        type: "file",
      },
    ],
  });

  modules.push({
    id: "worker-low-level-features",
    name: "Low Level Features Worker",
    description: "Low Level Features Worker module",
    author: "Eduardo Soares",
    email: "eduardo@email",
    input_queue: "low_level_in",
    output_queue: "low_level_out",
    input: [
      {
        id: "file",
        link: true,
        type: "text",
        required: true,
        accept: ["text/*"],
      },
    ],
    output: [
      {
        id: "low-level-output",
        link: true,
        type: "file",
      },
    ],
  });

  modules.push({
    id: "worker-topic-segmentation",
    name: "Topic Segmentation Worker",
    description: "Topic Segmentation Worker module",
    author: "Eduardo Soares",
    email: "eduardo@email",
    input_queue: "topic_segmentation_in",
    output_queue: "topic_segmentation_out",
    input: [
      {
        id: "asr",
        link: true,
        type: "text",
        required: true,
        accept: ["text/*"],
      },{
        id: "llf",
        link: true,
        type: "text",
        required: true,
        accept: ["text/*"],
      },
    ],
    output: [
      {
        id: "topic-segmentation-output",
        link: true,
        type: "file",
      },
    ],
  });

export default modules;
