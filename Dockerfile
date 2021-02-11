# BUILD STAGE
FROM node:13 AS dist

WORKDIR /dist

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# PRODUCTION STAGE
FROM node:13-alpine

WORKDIR /app

COPY --from=dist /dist/package*.json ./
COPY --from=dist /dist ./

RUN npm install --production

EXPOSE 3000

CMD npm start