# EasyTopic Dashboard API

Dashboard for EasyTopic project as Rest API

This dashboard will handle all service workers and the pipelines communication, trough RabbitMQ

## About

The project uses the following libraries and tools:
- [Node AMQP](http://www.squaremobius.net/amqp.node/) Library for AMQP connection.
- Express for routing

## Usage

This server can be used with Docker and Docker compose (see docker-compose file for example). In Linux:

```bash
npm run docker # Runs docker-compose with all dependencies and configurations
```

Anternatively, you can run run the project in standalone mode:

```bash
npm install
npm run build
npm start
```

For development mode, run `npm run dev`.

## Settings

Settings need to be passed as enviroment variables:

 - `PORT`: The port the application will run. **Default**: 3000
 - `QUEUE_SERVER`: RabbitMQ queue server. **Default**: 'localhost:5672'
 - `FILES_SERVER`: [Node Files Server](https://github.com/maxjf1/node-files-microservice) URL. **Default**: 'localhost:3000'
 - `OCR_INPUT_QUEUE`: RabbitMQ input queue name. **Default**: 'ocr-in'
 - `OCR_OUTPUT_QUEUE`: RabbitMQ input queue name. **Default**: 'ocr-out'
 - `FILES_PATH`: Folder for temporally files. **Default**: '/temp'

## Routes
Arguments need to be send as JSON (`content-type: application/json`).

- `/pipeline/ocr`: Handle OCR actions
    - GET: Obtain a list of previous OCR actions
    - POST: Register an new OCR job. The `file` argument with the file url (or an object containing the `name` property) is mandatory.
- GET `/pipeline/ocr/id`: Gets the status of an OCR job. The response is in the following format (changing the status):
```json
{
    "type": "ocr",
    "status": "done",
    "id": 0,
    "data": {
        "file": "https://site.com/file.png",
        "id": 0
    },
    "response": {
        "file": "https://site.com/file.png",
        "id": 0,
        "ocr": "This is the first line of\nthis text example.\n\nThis is the second line\nof the same text.\n\f"
    }
}
```
