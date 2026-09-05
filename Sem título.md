```SQL
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

DROP TABLE IF EXISTS alerta_estoque CASCADE;
DROP TABLE IF EXISTS utilizacao_insumo CASCADE;
DROP TABLE IF EXISTS tarefa CASCADE;
DROP TABLE IF EXISTS plantio CASCADE;
DROP TABLE IF EXISTS insumo CASCADE;
DROP TABLE IF EXISTS canteiro CASCADE;
DROP TABLE IF EXISTS cultura CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

DROP TYPE IF EXISTS perfil_usuario CASCADE;
DROP TYPE IF EXISTS tipo_insumo CASCADE;
DROP TYPE IF EXISTS status_plantio CASCADE;
DROP TYPE IF EXISTS tipo_tarefa CASCADE;
DROP TYPE IF EXISTS status_tarefa CASCADE;


CREATE TYPE perfil_usuario AS ENUM ('ADMINISTRADOR', 'MEMBRO');
CREATE TYPE tipo_insumo    AS ENUM ('SEMENTE', 'FERTILIZANTE', 'FERRAMENTA');
CREATE TYPE status_plantio AS ENUM ('CRESCIMENTO', 'COLHIDO', 'PERDIDO');
CREATE TYPE tipo_tarefa    AS ENUM ('REGA', 'ADUBACAO', 'COLHEITA', 'OUTRO');
CREATE TYPE status_tarefa  AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'AGUARDANDO_APROVACAO', 'REJEITADA');

CREATE TABLE usuario (
    id_usuario      SERIAL PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    senha_hash      VARCHAR(255) NOT NULL,
    perfil          perfil_usuario NOT NULL DEFAULT 'MEMBRO',
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_usuario_email_formato
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE usuario IS 'Usuários do sistema com controle de perfil (RBAC)';


CREATE TABLE cultura (
    id_cultura              SERIAL PRIMARY KEY,
    nome                    VARCHAR(100) NOT NULL UNIQUE,
    tempo_maturacao_dias    INTEGER NOT NULL CHECK (tempo_maturacao_dias > 0),
    espacamento_ideal_cm    NUMERIC(6,2) NOT NULL CHECK (espacamento_ideal_cm > 0),
    descricao               TEXT,
    criado_em               TIMESTAMP NOT NULL DEFAULT now()
);


CREATE TABLE canteiro (
    id_canteiro     SERIAL PRIMARY KEY,
    identificacao   VARCHAR(50) NOT NULL UNIQUE,
    localizacao     VARCHAR(150),
    area_m2         NUMERIC(8,2) CHECK (area_m2 IS NULL OR area_m2 > 0),
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE insumo (
    id_insumo               SERIAL PRIMARY KEY,
    nome                    VARCHAR(120) NOT NULL,
    tipo                    tipo_insumo NOT NULL,
    unidade_medida          VARCHAR(20) NOT NULL DEFAULT 'UN',
    quantidade_disponivel   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (quantidade_disponivel >= 0),
    quantidade_minima       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (quantidade_minima >= 0),
    ativo                   BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em               TIMESTAMP NOT NULL DEFAULT now(),
    atualizado_em           TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_insumo_nome_tipo UNIQUE (nome, tipo)
);

CREATE TABLE plantio (
    id_plantio              SERIAL PRIMARY KEY,
    id_cultura              INTEGER NOT NULL REFERENCES cultura(id_cultura)  ON DELETE RESTRICT,
    id_canteiro              INTEGER NOT NULL REFERENCES canteiro(id_canteiro) ON DELETE RESTRICT,
    data_plantio             DATE NOT NULL,
    status                   status_plantio NOT NULL DEFAULT 'CRESCIMENTO',
    data_colheita            DATE,
    quantidade_colhida_kg    NUMERIC(10,2) CHECK (quantidade_colhida_kg IS NULL OR quantidade_colhida_kg >= 0),
    observacoes              TEXT,
    criado_em                TIMESTAMP NOT NULL DEFAULT now(),
    atualizado_em            TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_plantio_data_colheita
        CHECK (data_colheita IS NULL OR data_colheita >= data_plantio)
);


CREATE TABLE tarefa (
    id_tarefa           SERIAL PRIMARY KEY,
    tipo                tipo_tarefa NOT NULL,
    descricao           VARCHAR(255) NOT NULL,
    data_tarefa         DATE NOT NULL,
    hora_inicio         TIME NOT NULL,
    hora_fim            TIME NOT NULL,
    id_canteiro         INTEGER REFERENCES canteiro(id_canteiro) ON DELETE SET NULL,
    id_plantio          INTEGER REFERENCES plantio(id_plantio)   ON DELETE SET NULL,
    id_responsavel      INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    id_criado_por       INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    status              status_tarefa NOT NULL DEFAULT 'PENDENTE',
    data_conclusao      TIMESTAMP,
    id_aprovado_por     INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    aprovado_em         TIMESTAMP,
    motivo_bloqueio     VARCHAR(255),
    criado_em           TIMESTAMP NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT chk_tarefa_horario CHECK (hora_fim > hora_inicio),

    CONSTRAINT excl_tarefa_canteiro_conflito EXCLUDE USING gist (
        id_canteiro WITH =,
        tsrange(
            (data_tarefa + hora_inicio)::timestamp,
            (data_tarefa + hora_fim)::timestamp,
            '[)'
        ) WITH &&
    ) WHERE (id_canteiro IS NOT NULL AND status NOT IN ('CANCELADA','REJEITADA'))
);


CREATE TABLE utilizacao_insumo (
    id_utilizacao         SERIAL PRIMARY KEY,
    id_insumo             INTEGER NOT NULL REFERENCES insumo(id_insumo) ON DELETE RESTRICT,
    id_tarefa             INTEGER REFERENCES tarefa(id_tarefa)   ON DELETE CASCADE,
    id_plantio            INTEGER REFERENCES plantio(id_plantio) ON DELETE CASCADE,
    quantidade_utilizada  NUMERIC(10,2) NOT NULL CHECK (quantidade_utilizada > 0),
    data_utilizacao       TIMESTAMP NOT NULL DEFAULT now(),
    id_registrado_por     INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL,

    CONSTRAINT chk_utilizacao_vinculo
        CHECK (id_tarefa IS NOT NULL OR id_plantio IS NOT NULL)
);

COMMENT ON TABLE utilizacao_insumo IS
    'Tabela associativa N:N entre Insumo e Tarefa/Plantio - registra a quantidade de cada insumo utilizada';

CREATE TABLE alerta_estoque (
    id_alerta                       SERIAL PRIMARY KEY,
    id_insumo                       INTEGER NOT NULL REFERENCES insumo(id_insumo) ON DELETE CASCADE,
    quantidade_no_momento           NUMERIC(10,2) NOT NULL,
    quantidade_minima_no_momento    NUMERIC(10,2) NOT NULL,
    gerado_em                       TIMESTAMP NOT NULL DEFAULT now(),
    resolvido                       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_plantio_cultura       ON plantio(id_cultura);
CREATE INDEX idx_plantio_canteiro      ON plantio(id_canteiro);
CREATE INDEX idx_plantio_status        ON plantio(status);

CREATE INDEX idx_tarefa_responsavel    ON tarefa(id_responsavel);
CREATE INDEX idx_tarefa_canteiro       ON tarefa(id_canteiro);
CREATE INDEX idx_tarefa_plantio        ON tarefa(id_plantio);
CREATE INDEX idx_tarefa_data           ON tarefa(data_tarefa);
CREATE INDEX idx_tarefa_status         ON tarefa(status);

CREATE INDEX idx_utilizacao_insumo     ON utilizacao_insumo(id_insumo);
CREATE INDEX idx_utilizacao_tarefa     ON utilizacao_insumo(id_tarefa);
CREATE INDEX idx_utilizacao_plantio    ON utilizacao_insumo(id_plantio);

CREATE INDEX idx_alerta_insumo         ON alerta_estoque(id_insumo);

CREATE OR REPLACE FUNCTION fn_atualiza_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuario_upd  BEFORE UPDATE ON usuario  FOR EACH ROW EXECUTE FUNCTION fn_atualiza_timestamp();
CREATE TRIGGER trg_insumo_upd   BEFORE UPDATE ON insumo   FOR EACH ROW EXECUTE FUNCTION fn_atualiza_timestamp();
CREATE TRIGGER trg_plantio_upd  BEFORE UPDATE ON plantio  FOR EACH ROW EXECUTE FUNCTION fn_atualiza_timestamp();
CREATE TRIGGER trg_tarefa_upd   BEFORE UPDATE ON tarefa   FOR EACH ROW EXECUTE FUNCTION fn_atualiza_timestamp();

CREATE OR REPLACE FUNCTION fn_baixa_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo   NUMERIC(10,2);
    v_nome    VARCHAR(120);
BEGIN
    SELECT quantidade_disponivel, nome
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
       SET quantidade_disponivel = quantidade_disponivel - NEW.quantidade_utilizada
     WHERE id_insumo = NEW.id_insumo;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_baixa_estoque
    BEFORE INSERT ON utilizacao_insumo
    FOR EACH ROW EXECUTE FUNCTION fn_baixa_estoque();


CREATE OR REPLACE FUNCTION fn_valida_conflito_ferramenta()
RETURNS TRIGGER AS $$
DECLARE
    v_tipo      tipo_insumo;
    v_conflito  RECORD;
BEGIN
    IF NEW.id_tarefa IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT tipo INTO v_tipo FROM insumo WHERE id_insumo = NEW.id_insumo;

    IF v_tipo = 'FERRAMENTA' THEN
        SELECT t2.id_tarefa, t2.descricao
          INTO v_conflito
          FROM utilizacao_insumo ui2
          JOIN tarefa t2 ON t2.id_tarefa = ui2.id_tarefa
          JOIN tarefa t1 ON t1.id_tarefa = NEW.id_tarefa
         WHERE ui2.id_insumo = NEW.id_insumo
           AND ui2.id_tarefa <> NEW.id_tarefa
           AND t2.status NOT IN ('CANCELADA','REJEITADA')
           AND t2.data_tarefa = t1.data_tarefa
           AND tsrange((t2.data_tarefa + t2.hora_inicio)::timestamp, (t2.data_tarefa + t2.hora_fim)::timestamp, '[)')
               && tsrange((t1.data_tarefa + t1.hora_inicio)::timestamp, (t1.data_tarefa + t1.hora_fim)::timestamp, '[)')
         LIMIT 1;

        IF FOUND THEN
            RAISE EXCEPTION 'Conflito de recurso: ferramenta já alocada na tarefa #% ("%") no mesmo período',
                v_conflito.id_tarefa, v_conflito.descricao
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_conflito_ferramenta
    BEFORE INSERT OR UPDATE ON utilizacao_insumo
    FOR EACH ROW EXECUTE FUNCTION fn_valida_conflito_ferramenta();


CREATE OR REPLACE FUNCTION fn_verifica_alerta_estoque()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantidade_disponivel <= NEW.quantidade_minima THEN
        INSERT INTO alerta_estoque (id_insumo, quantidade_no_momento, quantidade_minima_no_momento)
        VALUES (NEW.id_insumo, NEW.quantidade_disponivel, NEW.quantidade_minima);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_alerta_estoque
    AFTER UPDATE OF quantidade_disponivel ON insumo
    FOR EACH ROW
    WHEN (NEW.quantidade_disponivel <= NEW.quantidade_minima)
    EXECUTE FUNCTION fn_verifica_alerta_estoque();

CREATE OR REPLACE VIEW vw_dashboard_produtividade AS
SELECT
    c.id_cultura,
    c.nome                                             AS cultura,
    cn.id_canteiro,
    cn.identificacao                                   AS canteiro,
    COUNT(p.id_plantio)                                AS total_plantios,
    COALESCE(SUM(p.quantidade_colhida_kg), 0)          AS total_colhido_kg,
    COUNT(*) FILTER (WHERE p.status = 'COLHIDO')       AS plantios_colhidos,
    COUNT(*) FILTER (WHERE p.status = 'PERDIDO')       AS plantios_perdidos
FROM plantio p
JOIN cultura  c  ON c.id_cultura  = p.id_cultura
JOIN canteiro cn ON cn.id_canteiro = p.id_canteiro
GROUP BY c.id_cultura, c.nome, cn.id_canteiro, cn.identificacao;


CREATE OR REPLACE VIEW vw_estoque_resumo AS
SELECT
    id_insumo,
    nome,
    tipo,
    unidade_medida,
    quantidade_disponivel,
    quantidade_minima,
    CASE
        WHEN quantidade_disponivel <= 0                 THEN 'RUPTURA'
        WHEN quantidade_disponivel <= quantidade_minima  THEN 'BAIXO_ESTOQUE'
        ELSE 'NORMAL'
    END AS situacao_estoque
FROM insumo
WHERE ativo = TRUE;


CREATE OR REPLACE VIEW vw_tarefas_por_usuario AS
SELECT
    t.id_tarefa,
    t.id_responsavel,
    t.tipo,
    t.descricao,
    t.data_tarefa,
    t.hora_inicio,
    t.hora_fim,
    cn.identificacao AS canteiro,
    t.status,
    t.data_conclusao
FROM tarefa t
LEFT JOIN canteiro cn ON cn.id_canteiro = t.id_canteiro;
```