"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
async function migrate() {
    console.log('🔄 [Migrate] Aplicando migración de autenticación (tabla users)...');
    try {
        // process.cwd() cuando se corre desde backend/ = C:\Users\usuario\Homie\backend
        // El SQL está en la raíz del monorepo (un nivel arriba)
        const sqlPath = path_1.default.resolve(process.cwd(), '..', 'migration-users.sql');
        if (!fs_1.default.existsSync(sqlPath)) {
            console.error(`❌ [Migrate] No se encontró migration-users.sql en: ${sqlPath}`);
            process.exit(1);
        }
        const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
        await database_1.pool.query(sql);
        console.log('✅ [Migrate] Tabla users creada/actualizada correctamente.');
    }
    catch (err) {
        console.error('❌ [Migrate] Error aplicando migración:', err);
    }
    finally {
        await database_1.pool.end();
    }
}
migrate();
