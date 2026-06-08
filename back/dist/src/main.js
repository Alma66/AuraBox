"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.enableCors({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
        const port = process.env.PORT ? Number(process.env.PORT) : 3001;
        await app.listen(port);
        console.log(`🚀 Server running on port ${port}`);
    }
    catch (err) {
        console.error('❌ BOOTSTRAP ERROR:', err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map