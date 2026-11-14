const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');
const { gerarTokenSimulado } = require('./utils/testHelpers');

describe('Gestão e Agendamento de Tarefas (Histórias #10, #11 e #14)', () => {
  let tokenAdmin;
  let idAdmin;
  let idUsuario;
  let idCanteiro;
  let idInsumo;
  let idFerramenta;
  let idTarefaPendenteAprovacao;

  beforeAll(async () => {
    // Cria um usuário ADMIN real no banco para testar também o gatilho da História #14
    const resAdmin = await db.query(
      `INSERT INTO usuario (nome, email, senha, perfil)
       VALUES ('Admin Teste', $1, 'hash_teste', 'ADMIN')
       RETURNING id_usuario`,
      [`admin_tarefa_${Date.now()}@horta.com`]
    );
    idAdmin = resAdmin.rows[0].id_usuario;
    tokenAdmin = gerarTokenSimulado({ id_usuario: idAdmin, perfil: 'ADMIN' });

    // Cria usuário operacional, canteiro, insumo consumível e ferramenta
    const resUsuario = await request(app)
      .post('/api/auth/registro')
      .send({
        nome: 'Membro Tarefa',
        email: `membro_tarefa_${Date.now()}@horta.com`,
        senha: 'SenhaSegura123'
      });
    idUsuario = resUsuario.body.id_usuario;

    const resCanteiro = await request(app)
      .post('/api/canteiros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        identificacao: `Canteiro Tarefa ${Date.now()}`,
        area_m2: 15
      });
    idCanteiro = resCanteiro.body.id_canteiro;

    const resInsumo = await request(app)
      .post('/api/insumos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Adubo Teste CT09',
        tipo: 'FERTILIZANTE',
        quantidade_estoque: 10,
        estoque_minimo: 2
      });
    idInsumo = resInsumo.body.id_insumo;

    const resFerramenta = await request(app)
      .post('/api/insumos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nome: 'Enxada Teste CT10',
        tipo: 'FERRAMENTA',
        quantidade_estoque: 1,
        estoque_minimo: 1
      });
    idFerramenta = resFerramenta.body.id_insumo;
  });

  it('CT09 - Deve reter tarefa como AGUARDANDO_APROVACAO caso não haja estoque suficiente (História #10)', async () => {
    const res = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_usuario: idUsuario,
        id_canteiro: idCanteiro,
        descricao: 'Adubar canteiro A',
        data_tarefa: '2026-10-15',
        hora_inicio: '14:00',
        hora_fim: '15:00',
        insumos: [
          { id_insumo: idInsumo, quantidade: 15 } // Estoque tem apenas 10
        ]
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.tarefa.status).toBe('AGUARDANDO_APROVACAO');
    expect(res.body.alertas[0]).toContain('Estoque insuficiente');
    idTarefaPendenteAprovacao = res.body.tarefa.id_tarefa;
  });

  it('História #14 - Administrador aprova excepcionalmente tarefa sem estoque suficiente', async () => {
    const resAprovacao = await request(app)
      .post(`/api/tarefas/${idTarefaPendenteAprovacao}/aprovar-estoque`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        observacao: 'Compra emergencial de adubo já realizada'
      });

    expect(resAprovacao.statusCode).toEqual(200);
    expect(resAprovacao.body.tarefa.status).toBe('PENDENTE');

    // O estoque de 10 após descontar 15 com aprovação deve ficar -5
    const resInsumo = await request(app)
      .get(`/api/insumos/${idInsumo}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(resInsumo.body.quantidade_estoque).toBe(-5);
  });

  it('CT10 - Deve bloquear agendamento de tarefas conflitantes no mesmo canteiro ou ferramenta (História #11)', async () => {
    // Passo 1: Cria a primeira tarefa ocupando o canteiro e a única enxada (08:00 às 10:00)
    const resPrimeira = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_usuario: idUsuario,
        id_canteiro: idCanteiro,
        descricao: 'Plantio matinal',
        data_tarefa: '2026-10-10',
        hora_inicio: '08:00',
        hora_fim: '10:00',
        insumos: [
          { id_insumo: idFerramenta, quantidade: 1 }
        ]
      });

    expect(resPrimeira.statusCode).toEqual(201);

    // Passo 2: Tenta agendar no mesmo canteiro sobrepondo o horário (09:00 às 11:00)
    const resConflitoCanteiro = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_usuario: idUsuario,
        id_canteiro: idCanteiro,
        descricao: 'Manutenção conflitante no canteiro',
        data_tarefa: '2026-10-10',
        hora_inicio: '09:00',
        hora_fim: '11:00'
      });

    expect(resConflitoCanteiro.statusCode).toEqual(409);
    expect(resConflitoCanteiro.body.erro).toContain('Conflito de agendamento');

    // Passo 3: Tenta agendar sem canteiro, mas usando a mesma ferramenta ocupada no horário (09:00 às 11:00)
    const resConflitoFerramenta = await request(app)
      .post('/api/tarefas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        id_usuario: idUsuario,
        descricao: 'Tarefa conflitante na ferramenta',
        data_tarefa: '2026-10-10',
        hora_inicio: '09:00',
        hora_fim: '11:00',
        insumos: [
          { id_insumo: idFerramenta, quantidade: 1 }
        ]
      });

    expect(resConflitoFerramenta.statusCode).toEqual(409);
    expect(resConflitoFerramenta.body.erro).toContain('Enxada Teste CT10');
  });
});