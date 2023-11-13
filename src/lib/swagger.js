import { Express, Request, Response } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "M2P API Docs",
      version,
    },
  },
  apis: ["./src/routers/*.js"],
};

const openapiSpec = swaggerJSDoc(options);

const uiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
};

function openapiDocs(app) {
  // Swagger page
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec, uiOptions));
  //Docs in JSON
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(openapiSpec);
  });
}

export default openapiDocs;
