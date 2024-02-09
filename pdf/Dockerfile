FROM node:18.16.0-alpine as build

WORKDIR /build

COPY . .

RUN npm install

FROM node:18.16.0-alpine as runtime

RUN apk --no-cache add \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libstdc++

WORKDIR /service-national-universel/pdf

COPY --from=build /build .

EXPOSE 8080

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

CMD ["node", "index.js"]
