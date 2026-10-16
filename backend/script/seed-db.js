// carrega o banco com dados de exemplo. 
// -> npm run db:seed   ***só funciona em banco vazio*****
// Senha Demo: ______

require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

async function main() {
    const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM usuario');
    if (rows[0].n > 0) {
        console.log('Banco já possui usuários. Seed ignorado.');
        return;
    }
    const hash = await bcrypt.hash('Horta@123', 10);
    const c = await db.pool.connect();
    try {
        await c.query('BEGIN');
        await c.query(`INSERT INTO usuario (nome, email, senha, perfil) VALUES
            ('João Silva', 'joao.admin@horta.com', $1, 'ADMIN'),
            ('Maria Oliveira', 'maria.operacional@horta.com', $1, 'OPERACIONAL')`, [hash]);
        await c.query(`INSERT INTO cultura (nome, tempo_maturacao_dias, espacamento_ideal) VALUES
            ('Alface Crespa', 45, 0.30), ('Tomate Cereja', 90, 0.60), ('Cenoura', 60, 0.15)`);
        await c.query(`INSERT INTO canteiro (identificacao, area_m2) VALUES
            ('Canteiro A - Sul', 15.50), ('Canteiro B - Norte', 20.00)`);
        await c.query(`INSERT INTO insumo (nome, tipo, quantidade_estoque, estoque_minimo) VALUES
            ('Semente de Alface (Pacote)', 'SEMENTE', 50.00, 10.00),
            ('Fertilizante NPK Orgânico (Kg)', 'FERTILIZANTE', 100.00, 20.00),
            ('Enxada', 'FERRAMENTA', 5.00, 1.00)`);
        await c.query(`INSERT INTO plantio (id_cultura, id_canteiro, data_plantio, status, peso_colhido) VALUES
            (1, 1, '2026-08-01', 'COLHIDO', 12.50), (2, 2, '2026-09-01', 'CRESCIMENTO', NULL)`);
        await c.query(`INSERT INTO tarefa (id_usuario, id_canteiro, descricao, data_tarefa, hora_inicio, hora_fim, status, data_conclusao) VALUES
            (2, 1, 'Preparação do solo e adubação inicial', '2026-09-10', '08:00', '10:00', 'CONCLUIDA', '2026-09-10 10:00'),
            (2, 2, 'Rega diária e verificação de pragas', '2026-09-11', '16:00', '17:00', 'PENDENTE', NULL)`);
        await c.query('COMMIT');
        console.log('Seed aplicado. Login de teste: joao.admin@horta.com / Horta@123');
    } catch (e) {
        await c.query('ROLLBACK');
        throw e;
    } finally {
        c.release();
    }
}

main().catch((e) => { console.error('Falha no seed:', e.message); process.exit(1); }).finally(() => db.pool.end());
