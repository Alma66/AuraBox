FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY nest-cli.json ./
COPY src ./src/

RUN npm install
RUN npx prisma generate

RUN ./node_modules/.bin/tsc \
  --module commonjs \
  --target ES2021 \
  --experimentalDecorators true \
  --emitDecoratorMetadata true \
  --esModuleInterop true \
  --skipLibCheck true \
  --outDir dist \
  --rootDir src \
  --noEmitOnError false \
  --strict false \
  $(find src -name "*.ts" | grep -v spec)

RUN ls -la /app/dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]