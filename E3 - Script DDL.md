-- schema.sql — Horta Familiar
-- Gera o schema completo em um banco vazio


-- Restrição de conflito de horários nos canteiros
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('ADMIN', 'OPERACIONAL'))
);

CREATE TABLE IF NOT EXISTS cultura (
    id_cultura SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    tempo_maturacao_dias INT NOT NULL CHECK (tempo_maturacao_dias > 0),
    espacamento_ideal DECIMAL(6,2) NOT NULL CHECK (espacamento_ideal > 0)
);

CREATE TABLE IF NOT EXISTS canteiro (
    id_canteiro SERIAL PRIMARY KEY,
    identificacao VARCHAR(50) NOT NULL UNIQUE,
    area_m2 DECIMAL(8,2) NOT NULL CHECK (area_m2 > 0)
);

CREATE TABLE IF NOT EXISTS insumo (
    id_insumo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('SEMENTE', 'FERTILIZANTE', 'FERRAMENTA')),
    quantidade_estoque DECIMAL(10,2) NOT NULL CHECK (quantidade_estoque >= 0),
    estoque_minimo DECIMAL(10,2) NOT NULL CHECK (estoque_minimo >= 0)
);

CREATE TABLE IF NOT EXISTS plantio (
    id_plantio SERIAL PRIMARY KEY,
    id_cultura INT NOT NULL REFERENCES cultura(id_cultura),
    id_canteiro INT NOT NULL REFERENCES canteiro(id_canteiro),
    data_plantio DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('CRESCIMENTO', 'COLHIDO', 'PERDIDO')),
    peso_colhido DECIMAL(10,2) CHECK (peso_colhido >= 0)
);

CREATE TABLE IF NOT EXISTS tarefa (
    id_tarefa SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
    id_canteiro INT REFERENCES canteiro(id_canteiro),
    descricao VARCHAR(255) NOT NULL,
    data_tarefa DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDENTE', 'CONCLUIDA', 'CANCELADA')),
    CONSTRAINT chk_tarefa_horario CHECK (hora_fim > hora_inicio)
);


-- Tabelas associativas

CREATE TABLE IF NOT EXISTS plantio_insumo (
    id_plantio INT NOT NULL REFERENCES plantio(id_plantio),
    id_insumo INT NOT NULL REFERENCES insumo(id_insumo),
    quantidade_utilizada DECIMAL(10,2) NOT NULL CHECK (quantidade_utilizada > 0),
    PRIMARY KEY (id_plantio, id_insumo)
);

CREATE TABLE IF NOT EXISTS tarefa_insumo (
    id_tarefa INT NOT NULL REFERENCES tarefa(id_tarefa),
    id_insumo INT NOT NULL REFERENCES insumo(id_insumo),
    quantidade_utilizada DECIMAL(10,2) NOT NULL CHECK (quantidade_utilizada > 0),
    PRIMARY KEY (id_tarefa, id_insumo)
);


-- Regras de negócio e retrições

-- Restrição: Evitar conflitos de agendamento do mesmo canteiro no mesmo horário
ALTER TABLE tarefa DROP CONSTRAINT IF EXISTS excl_tarefa_canteiro_conflito;
ALTER TABLE tarefa ADD CONSTRAINT excl_tarefa_canteiro_conflito
EXCLUDE USING gist (
    id_canteiro WITH =,
    tsrange(
        (data_tarefa + hora_inicio)::timestamp,
        (data_tarefa + hora_fim)::timestamp,
        '[)'
    ) WITH &&
) WHERE (id_canteiro IS NOT NULL AND status NOT IN ('CANCELADA'));

-- Função: Validar e baixar automaticamente o estoque na utilização
CREATE OR REPLACE FUNCTION fn_baixa_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo DECIMAL(10,2);
    v_nome VARCHAR(100);
BEGIN
    SELECT quantidade_estoque, nome
      INTO v_saldo, v_nome
      FROM insumo
     WHERE id_insumo = NEW.id_insumo
     FOR UPDATE;

    IF v_saldo < NEW.quantidade_utilizada THEN
        RAISE EXCEPTION 'Estoque insuficiente para o insumo "%": disponível %, solicitado %',
            v_nome, v_saldo, NEW.quantidade_utilizada
            USING ERRCODE = 'check_violation';
    END IF;

    UPDATE insumo
       SET quantidade_estoque = quantidade_estoque - NEW.quantidade_utilizada
     WHERE id_insumo = NEW.id_insumo;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para execução da baixa
DROP TRIGGER IF EXISTS trg_baixa_estoque_tarefa ON tarefa_insumo;
CREATE TRIGGER trg_baixa_estoque_tarefa
    BEFORE INSERT ON tarefa_insumo
    FOR EACH ROW EXECUTE FUNCTION fn_baixa_estoque();

DROP TRIGGER IF EXISTS trg_baixa_estoque_plantio ON plantio_insumo;
CREATE TRIGGER trg_baixa_estoque_plantio
    BEFORE INSERT ON plantio_insumo
    FOR EACH ROW EXECUTE FUNCTION fn_baixa_estoque();

-- View: Dashboard de Produção
CREATE OR REPLACE VIEW vw_dashboard_producao AS
SELECT
    c.nome AS cultura,
    cn.identificacao AS canteiro,
    COUNT(p.id_plantio) AS total_plantios,
    COALESCE(SUM(p.peso_colhido), 0) AS produtividade_total_kg
FROM plantio p
JOIN cultura c ON p.id_cultura = c.id_cultura
JOIN canteiro cn ON p.id_canteiro = cn.id_canteiro
WHERE p.status = 'COLHIDO'
GROUP BY c.nome, cn.identificacao;


-- Seed de exemplo

INSERT INTO usuario (nome, email, senha, perfil) VALUES
('João Silva', 'joao.admin@horta.com', 'senha_hash_123', 'ADMIN'),
('Maria Oliveira', 'maria.operacional@horta.com', 'senha_hash_456', 'OPERACIONAL')
ON CONFLICT DO NOTHING;

INSERT INTO cultura (nome, tempo_maturacao_dias, espacamento_ideal) VALUES
('Alface Crespa', 45, 0.30),
('Tomate Cereja', 90, 0.60),
('Cenoura', 60, 0.15)
ON CONFLICT DO NOTHING;

INSERT INTO canteiro (identificacao, area_m2) VALUES
('Canteiro A - Sul', 15.50),
('Canteiro B - Norte', 20.00)
ON CONFLICT DO NOTHING;

INSERT INTO insumo (nome, tipo, quantidade_estoque, estoque_minimo) VALUES
('Semente de Alface (Pacote)', 'SEMENTE', 50.00, 10.00),
('Fertilizante NPK Orgânico (Kg)', 'FERTILIZANTE', 100.00, 20.00),
('Enxada', 'FERRAMENTA', 5.00, 1.00)
ON CONFLICT DO NOTHING;

INSERT INTO plantio (id_cultura, id_canteiro, data_plantio, status, peso_colhido) VALUES
(1, 1, '2026-08-01', 'COLHIDO', 12.50),
(2, 2, '2026-09-01', 'CRESCIMENTO', NULL);

INSERT INTO tarefa (id_usuario, id_canteiro, descricao, data_tarefa, hora_inicio, hora_fim, status) VALUES
(2, 1, 'Preparação do solo e adubação inicial', '2026-09-10', '08:00', '10:00', 'CONCLUIDA'),
(2, 2, 'Rega diária e verificação de pragas', '2026-09-11', '16:00', '17:00', 'PENDENTE');

INSERT INTO plantio_insumo (id_plantio, id_insumo, quantidade_utilizada) VALUES
(1, 1, 2.00);

INSERT INTO tarefa_insumo (id_tarefa, id_insumo, quantidade_utilizada) VALUES
(1, 2, 5.50);