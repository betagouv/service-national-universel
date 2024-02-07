FROM node:18.16.0-slim as build

WORKDIR /build

COPY . .

RUN npm install

FROM node:18.16.0-slim as runtime

RUN apt-get update && apt-get install -y wget gnupg ca-certificates procps libxshmfence1 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdbus-1-3 libxkbcommon0 libxrandr2 libgbm1 libpangocairo-1.0-0 libasound2 && rm -rf /var/lib/apt/lists/*

WORKDIR /service-national-universel/pdf

COPY --from=build /build .

EXPOSE 8080

CMD ["node", "index.js"]
