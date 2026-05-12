"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    console.log('>>> BOOTSTRAP: env keys (first 20):', Object.keys(process.env).slice(0, 20));
    console.log('>>> BOOTSTRAP: DATABASE_URL exists?', !!process.env.DATABASE_URL);
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors({
            origin: true,
            credentials: true,
        });
        const port = process.env.PORT ? Number(process.env.PORT) : 3001;
        await app.listen(port);
        console.log(`App running on http://localhost:${port}`);
    }
    catch (err) {
        console.error('>>> BOOTSTRAP ERROR:', err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map