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
    if (j.type && j.type == "aggregation") {    
      j.jobs.forEach((s) => {
        if (s.output instanceof Array)
          s.output = s.output.reduce(
            (s, field) => ({ ...s, [field]: field }),
            {}
          );
      });
    }
}));

export default pipelines;
