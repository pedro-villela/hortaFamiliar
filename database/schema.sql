
-- schema.sql — Horta Familiar

-- Restrição de conflito de horários requer a extensão btree_gist
CREATE EXTENSION IF NOT EXISTS btree_gist;


CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('ADMIN', 'OPERACIONAL'))
);

CREATE TABLE cultura (
    id_cultura SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    tempo_maturacao_dias INT NOT NULL CHECK (tempo_maturacao_dias > 0),
    espacamento_ideal DECIMAL(6,2) NOT NULL CHECK (espacamento_ideal > 0)
);

CREATE TABLE canteiro (
    id_canteiro SERIAL PRIMARY KEY,
    identificacao VARCHAR(50) NOT NULL UNIQUE,
    area_m2 DECIMAL(8,2) NOT NULL CHECK (area_m2 > 0)
);

CREATE TABLE insumo (
    id_insumo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('SEMENTE', 'FERTILIZANTE', 'FERRAMENTA')),
    quantidade_estoque DECIMAL(10,2) NOT NULL CHECK (quantidade_estoque >= 0),
    estoque_minimo DECIMAL(10,2) NOT NULL CHECK (estoque_minimo >= 0)
);

CREATE TABLE plantio (
    id_plantio SERIAL PRIMARY KEY,
    id_cultura INT NOT NULL REFERENCES cultura(id_cultura),
    id_canteiro INT NOT NULL REFERENCES canteiro(id_canteiro),
    data_plantio DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('CRESCIMENTO', 'COLHIDO', 'PERDIDO')),
    peso_colhido DECIMAL(10,2) CHECK (peso_colhido >= 0)
);

CREATE TABLE tarefa (
    id_tarefa SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
    id_canteiro INT REFERENCES canteiro(id_canteiro),
    descricao VARCHAR(255) NOT NULL,
    data_tarefa DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDENTE', 'CONCLUIDA', 'CANCELADA')),
    data_conclusao TIMESTAMP, -- história #8: registro da data/hora da conclusão
    CONSTRAINT chk_tarefa_horario CHECK (hora_fim > hora_inicio)
);

CREATE TABLE plantio_insumo (
    id_plantio INT NOT NULL REFERENCES plantio(id_plantio),
    id_insumo INT NOT NULL REFERENCES insumo(id_insumo),
    quantidade_utilizada DECIMAL(10,2) NOT NULL CHECK (quantidade_utilizada > 0),
    PRIMARY KEY (id_plantio, id_insumo)
);

CREATE TABLE tarefa_insumo (
    id_tarefa INT NOT NULL REFERENCES tarefa(id_tarefa),
    id_insumo INT NOT NULL REFERENCES insumo(id_insumo),
    quantidade_utilizada DECIMAL(10,2) NOT NULL CHECK (quantidade_utilizada > 0),
    PRIMARY KEY (id_tarefa, id_insumo)
);

-- Evitar conflitos de agendamento do mesmo canteiro no mesmo horário
ALTER TABLE tarefa ADD CONSTRAINT excl_tarefa_canteiro_conflito
EXCLUDE USING gist (
    id_canteiro WITH =,
    tsrange(
        (data_tarefa + hora_inicio)::timestamp,
        (data_tarefa + hora_fim)::timestamp,
        '[)'
    ) WITH &&
) WHERE (id_canteiro IS NOT NULL AND status NOT IN ('CANCELADA'));

-- Atualizar o estoque na utilização
CREATE OR REPLACE FUNCTION fn_atualiza_estoque()
RETURNS TRIGGER AS $$
BEGIN

    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        UPDATE insumo
        SET quantidade_estoque = quantidade_estoque + OLD.quantidade_utilizada
        WHERE id_insumo = OLD.id_insumo;
    END IF;

    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE insumo
        SET quantidade_estoque = quantidade_estoque - NEW.quantidade_utilizada
        WHERE id_insumo = NEW.id_insumo;
    END IF;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_estoque_tarefa
    AFTER INSERT OR UPDATE OR DELETE ON tarefa_insumo
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_estoque();

CREATE TRIGGER trg_estoque_plantio
    AFTER INSERT OR UPDATE OR DELETE ON plantio_insumo
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_estoque();

-- Dashboard de Produção
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
