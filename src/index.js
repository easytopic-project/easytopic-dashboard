#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import { json as jsonBody } from 'body-parser';
import {
    PORT,
} from './env';
import pipelineRouter from './routers/pipelineRouter';
import moduleRouter from './routers/moduleRouter';

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(jsonBody());

app.use('/api/pipeline', pipelineRouter);

app.use('/api/module', moduleRouter);

app.all('/api/*', (req, res) => res.status(404).json('Not found'));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

export default app;
