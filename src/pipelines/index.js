import ocr from './ocr.json';
import ocrTest from './ocrTest.json';
import easytopic from './easytopic.json';
import testGilson from './testGilson.json';

const pipelines2 = [
    ocr,
    ocrTest,
    easytopic,
    testGilson
];

// TODO: create instances that handle it
pipelines2.forEach(p => p.jobs.forEach(j => {
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

export default pipelines2;
