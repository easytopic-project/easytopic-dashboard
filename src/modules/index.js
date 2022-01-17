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
      id: "image",
      link: true,
      type: "file",
      required: true,
      accept: ["image/*"],
    },
    {
      id: "image-alt",
      link: true,
      type: "file",
      required: true,
      accept: ["image/*"],
    },
    {
        id: "language",
        link: false,
        type: "select",
        required: true,
        options: {"eng": "English", "ptbr": "Brazilian portugueze"},
      },
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
        id: "image",
        link: true,
        type: "file",
        required: true,
        accept: ["image/*"],
      },
      {
        id: "image-alt",
        link: true,
        type: "file",
        required: true,
        accept: ["image/*"],
      },
      {
          id: "language",
          link: false,
          type: "select",
          required: true,
          options: {"eng": "English", "ptbr": "Brazilian portugueze"},
        },
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
        id: "input-placeholder",
        link: true,
        type: "file",
        required: true,
        accept: ["image/*"],
      },
    ],
    output: [
      {
        id: "output-placeholder",
        link: false,
        type: "text",
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
        id: "input-placeholder",
        link: true,
        type: "file",
        required: true,
        accept: ["image/*"],
      },
    ],
    output: [
      {
        id: "output-placeholder",
        link: false,
        type: "text",
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
        id: "input-placeholder",
        link: true,
        type: "file",
        required: true,
        accept: ["image/*"],
      },
    ],
    output: [
      {
        id: "output-placeholder",
        link: false,
        type: "text",
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
        id: "input-placeholder",
        link: true,
        type: "file",
        required: true,
        accept: ["image/*"],
      },
    ],
    output: [
      {
        id: "output-placeholder",
        link: false,
        type: "text",
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
        id: "input-placeholder",
        link: true,
        type: "file",
        required: true,
        accept: ["image/*"],
      },
    ],
    output: [
      {
        id: "output-placeholder",
        link: false,
        type: "text",
      },
    ],
  });

export default modules;
