"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
async function initDb() {
    console.log('🔄 [DB Init] Verificando y creando tablas en PostgreSQL...');
    try {
        const sqlPath = path_1.default.resolve(__dirname, '../../../Untitled-1.sql');
        if (!fs_1.default.existsSync(sqlPath)) {
            console.error(`❌ [DB Init] No se encontró el archivo de esquema en: ${sqlPath}`);
            process.exit(1);
        }
        const schemaSql = fs_1.default.readFileSync(sqlPath, 'utf8');
        await database_1.pool.query(schemaSql);
        console.log('✅ [DB Init] Esquema y tablas creados/actualizados exitosamente.');
    }
    catch (error) {
        console.error('❌ [DB Init] Error ejecutando el esquema:', error);
    }
    finally {
        await database_1.pool.end();
    }
}
initDb();
