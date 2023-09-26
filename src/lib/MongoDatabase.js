import mongoose from "mongoose";
import pipelines from "../pipelines";
import modules from "../modules";

const PipelineSchema = mongoose.Schema({
  version: String,
  id: String,
  name: String,
  description: String,
  input: [
    {
      id: String,
      name: String,
      description: String,
      type: { type: String },
      required: Boolean,
      accept: Array,
      options: { type: Map, of: String },
    },
  ],
  output: [
    {
      id: String,
      name: String,
      description: String,
      type: { type: String },
      from: String,
    },
  ],
  jobs: [
    {
      id: String,
      queues: [String],
      arguments: { type: Map, of: String },
      output: { type: Map, of: String },
      type: { type: String },
      jobs: [
        {
          id: String,
          queues: [String],
          arguments: { type: Map, of: String },
          output: { type: Map, of: String },
        },
      ],
    },
  ],
});

const ModuleSchema = mongoose.Schema({
  id: String,
  name: String,
  description: String,
  author: String,
  email: String,
  input_queue: String,
  output_queue: String,
  default: Boolean,
  input: [
    {
      id: String,
      link: String,
      type: { type: String },
      required: Boolean,
      accept: Array,
    },
  ],
  output: [
    {
      id: String,
      link: String,
      type: { type: String },
    },
  ],
});

const JobSchema = mongoose.Schema({
  id: Number,
  type: String,
  version: String,
  status: String,
  output: String,
  createdAt: String,
  finishAt: String,
  input: Object,
  data: Object,
  jobStatus: Object,
});

const CounterSchema = mongoose.Schema({
  id: String,
  seq: Number,
});

const Pipeline = mongoose.model("pipeline", PipelineSchema);
const Module = mongoose.model("module", ModuleSchema);
const Job = mongoose.model("job", JobSchema);
const Counter = mongoose.model("counter", CounterSchema);

class MongoDatabase {
  static uri = process.env.MONGO_SERVER || "mongodb://localhost:27017/m2p";
  static connection = null;

  static async connect() {
    if (this.connection) return this.connection;
    try {
      this.connection = await mongoose.connect(this.uri);
      console.log("Connected to DB");
      return this.connection;
    } catch (err) {
      this.connection = null;
      console.warn(`Connection to ${uri} failed. retrying in 3 seconds...`);
      setTimeout(generateConnection, 3000);
    }
  }

  static async getSeq(collectionId) {
    let doc = await Counter.findOneAndUpdate(
      { id: collectionId },
      { $inc: { seq: 1 } },
      { new: true }
    ).lean();

    if (!doc) {
      const newVal = new Counter({ id: collectionId, seq: 1 });
      await newVal.save();
      return 1;
    }
    return doc.seq;
  }

  static async getPipelines() {
    let pipelines = await Pipeline.find({}).lean();
    return pipelines;
  }

  static async addPipeline(newPipe) {
    let newPipeInstance = new Pipeline(newPipe);
    let savedPipe = await newPipeInstance.save();
    return savedPipe === newPipeInstance;
  }

  static async getModules(filter = {}) {
    let modules = await Module.find(filter).lean();
    return modules;
  }

  static async addModule(newModule) {
    let newModuleInstance = new Module(newModule);
    let savedModule = await newModuleInstance.save();
    return savedModule === newModuleInstance;
  }

  static async postItem(newJob) {
    //TODO rename function to addJob
    let newJobInstance = new Job({ ...newJob, id: await this.getSeq("job") });
    let savedJob = await newJobInstance.save();
    return savedJob;
  }

  static async getItem(id) {
    //TODO rename function to getJob
    let job = await Job.findOne({ id: id }).lean();
    return job;
  }

  static async getAllItems() {
    //TODO rename function to getAllJobs
    let jobs = await Job.find({}).lean();
    return jobs;
  }

  static async updateItem(id, data) {
    //TODO rename function to updateJob
    let updatedJob = await Job.findOneAndUpdate({ id: id }, data).lean();
    return updatedJob;
  }

  static async populateDB() {
    this.connect();
    for (const pipeline of pipelines) {
      if (!(await this.addPipeline(pipeline))) return false;
    }

    for (const module of modules) {
      if (!(await this.addModule({ ...module, default: true }))) return false;
    }
    return true;
  }
}

export default MongoDatabase;
