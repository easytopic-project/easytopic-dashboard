/**
 * @openapi
 * components:
 *  schemas:
 *    CreateNewPipeline:
 *      type: object
 *      required:
 *        - version
 *        - id
 *        - name
 *        - description
 *        - input
 *        - output
 *        - jobs
 *      properties:
 *        version:
 *          type: string
 *          default: 1.1.0
 *        id:
 *          type: string
 *          default: example-pipeline-id
 *        name:
 *          type: string
 *          default: example-pipeline
 *        description:
 *          type: string
 *          default: Pipeline for example purposes
 *        input:
 *          type: array
 *          items:
 *            type: object
 *            required:
 *              - id
 *              - name
 *              - description
 *              - type
 *              - required
 *              - accept
 *            properties:
 *              id:
 *                type: string
 *                default: example-input-id
 *              name:
 *                type: string
 *                default: example input name
 *              description:
 *                type: string
 *                default: example description
 *              type:
 *                type: string
 *                default: file
 *              required:
 *                type: boolean
 *                default: true
 *              accept:
 *                type: string
 *                default: ["image/*"]
 *        output:
 *          type: array
 *          items:
 *            type: object
 *            required:
 *              - id
 *              - name
 *              - description
 *              - type
 *              - from
 *            properties:
 *              id:
 *                type: string
 *                default: example-input-id
 *              name:
 *                type: string
 *                default: example input name
 *              description:
 *                type: string
 *                default: example description
 *              type:
 *                type: string
 *                default: file
 *              from:
 *                type: string
 *                default: example-job-id:example-job-output-id
 *        jobs:
 *          type: array
 *          items:
 *            type: object
 *            required:
 *              - id
 *              - queues
 *              - arguments
 *              - output
 *            properties:
 *              id:
 *                type: string
 *                default: example-job-id
 *              queues:
 *                type: array
 *                items:
 *                  type: object
 *                  required:
 *                    - default
 *                  properties:
 *                    env:
 *                      type: string
 *                      default: ENV_VAR_QUEUE_IN
 *                    default:
 *                      type: string
 *                      default: example-in
 *              arguments:
 *                type: string
 *                default: maps inputs ids to inside module argument
 *              output:
 *                type: array
 *                items:
 *                  type: string
 *                  default: "example-job-output-id"
 */
