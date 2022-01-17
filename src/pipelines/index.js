import ocr from './ocr.json';
import ocrTest from './ocrTest.json';
import easytopic from './easytopic.json';

const pipelines = [
    ocr,
    ocrTest,
    easytopic
];

// TODO: create instances that handle it
pipelines.forEach(p => p.jobs.forEach(j => {
    if (j.output instanceof Array) j.output = j.output.reduce((j, field) => ({ ...j, [field]: field }), {});
}));

export default pipelines;
