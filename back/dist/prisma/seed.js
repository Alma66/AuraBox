"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt.hash('password123', 10);
    await prisma.admins.upsert({
        where: { email: 'adminTest@example.com' },
        update: {},
        create: {
            email: 'adminTest@example.com',
            passwordHash: password,
            firstName: 'Admin',
            lastName: 'AuraBox',
            documentType: 'DNI',
            documentNumber: 12345678,
            phoneNumber: 123456789,
            active: true,
        },
    });
    await prisma.entrepreneurs.upsert({
        where: { email: 'emprendedorTest@example.com' },
        update: {},
        create: {
            email: 'emprendedorTest@example.com',
            passwordHash: password,
            firstName: 'Juan',
            lastName: 'Pérez',
            documentType: 'DNI',
            documentNumber: 23456789,
            phoneNumber: 234567890,
            active: true,
        },
    });
    await prisma.user.upsert({
        where: { email: 'clienteTest@example.com' },
        update: {},
        create: {
            email: 'clienteTest@example.com',
            passwordHash: password,
            firstName: 'María',
            lastName: 'Gómez',
            documentType: 'DNI',
            documentNumber: 34567890,
            phoneNumber: 345678901,
            active: true,
        },
    });
    console.log('✅ Seed completado');
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=seed.js.map