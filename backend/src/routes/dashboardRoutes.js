
// Rotas do dashboard e relatórios.

const express = require('express');
const db = require('../config/database');
const { autenticar, autorizar } = require('../middlewares/auth');
const { ErroHttp, data } = require('../utils/validacao');

const router = express.Router();

router.use(autenticar);

// Validar se a data informada existe de verdade.
function validarDataRelatorio(valor, campo) {
    const dataValidada = data(valor, campo);
    const [ano, mes, dia] = dataValidada.split('-').map(Number);

    const dataReal = new Date(Date.UTC(ano, mes - 1, dia));

    if (
        dataReal.getUTCFullYear() !== ano ||
        dataReal.getUTCMonth() !== mes - 1 ||
        dataReal.getUTCDate() !== dia
    ) {
        throw new ErroHttp(400, `A data de "${campo}" não é válida.`);
    }

    return dataValidada;
}

// GET /api/dashboard/producao
// Dashboard de produção por cultura e canteiro.
router.get('/producao', autorizar('ADMIN'), async (req, res) => {

    const dataInicio = validarDataRelatorio(
        req.query.data_inicio,
        'data_inicio'
    );

    const dataFim = validarDataRelatorio(
        req.query.data_fim,
        'data_fim'
    );

    if (dataInicio > dataFim) {
        throw new ErroHttp(
            400,
            'A data inicial não pode ser posterior à data final.'
        );
    }

    const { rows } = await db.query(
        `SELECT
            c.id_cultura,
            c.nome AS cultura,
            cn.id_canteiro,
            cn.identificacao AS canteiro,
            COUNT(p.id_plantio)::INTEGER AS total_plantios,
            COALESCE(SUM(p.peso_colhido), 0) AS produtividade_total_kg,
            COALESCE(AVG(p.peso_colhido), 0) AS produtividade_media_kg
         FROM plantio p
         INNER JOIN cultura c
            ON c.id_cultura = p.id_cultura
         INNER JOIN canteiro cn
            ON cn.id_canteiro = p.id_canteiro
         WHERE
            p.status = 'COLHIDO'
            AND p.data_plantio >= $1::DATE
            AND p.data_plantio <= $2::DATE
         GROUP BY
            c.id_cultura,
            c.nome,
            cn.id_canteiro,
            cn.identificacao
         ORDER BY
            c.nome,
            cn.identificacao`,
        [dataInicio, dataFim]
    );

    const totalPlantios = rows.reduce(
        (total, item) => total + item.total_plantios,
        0
    );

    const produtividadeTotalKg = rows.reduce(
        (total, item) => total + Number(item.produtividade_total_kg),
        0
    );

    res.json({
        periodo: {
            data_inicio: dataInicio,
            data_fim: dataFim
        },
        resumo: {
            total_plantios: totalPlantios,
            produtividade_total_kg: Number(
                produtividadeTotalKg.toFixed(2)
            )
        },
        produtividadePorCulturaECanteiro: rows
    });
});

// GET /api/dashboard/estoque
router.get('/estoque', autorizar('ADMIN'), async (req, res) => {
    const { rows } = await db.query(
        `SELECT
            id_insumo,
            nome,
            tipo,
            quantidade_estoque,
            estoque_minimo,
            (quantidade_estoque <= estoque_minimo) AS abaixo_do_minimo,
            CASE
                WHEN quantidade_estoque <= estoque_minimo THEN 'RISCO'
                ELSE 'NORMAL'
            END AS situacao
         FROM insumo
         ORDER BY
            abaixo_do_minimo DESC,
            nome`
    );

    const totalInsumos = rows.length;
    const insumosEmRisco = rows.filter(
        item => item.abaixo_do_minimo
    ).length;

    res.json({
        resumo: {
            total_insumos: totalInsumos,
            insumos_em_risco: insumosEmRisco,
            insumos_normais: totalInsumos - insumosEmRisco
        },
        estoque: rows
    });
});


module.exports = router;
