"""Acesso ao PostgreSQL da Aiven. Toda a lógica de SQL fica aqui."""

import os

import psycopg2
from psycopg2.extras import RealDictCursor

_schema_ready = False


def get_connection():
    """Abre uma conexão nova. A URI vem da variável de ambiente AIVEN_DB_URL."""
    url = os.environ.get("AIVEN_DB_URL")
    if not url:
        raise RuntimeError("AIVEN_DB_URL não configurada")
    return psycopg2.connect(url, cursor_factory=RealDictCursor, connect_timeout=10)


def ensure_schema():
    """Cria as tabelas de equipamentos e reservas na primeira vez que o app é usado."""
    global _schema_ready
    if _schema_ready:
        return
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS equipamentos (
                    id          SERIAL PRIMARY KEY,
                    nome        TEXT NOT NULL,
                    categoria   TEXT NOT NULL,
                    quantidade  INTEGER NOT NULL DEFAULT 1,
                    status      TEXT NOT NULL DEFAULT 'Disponível',
                    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
                );

                CREATE TABLE IF NOT EXISTS reservas (
                    id            SERIAL PRIMARY KEY,
                    sala          TEXT NOT NULL,
                    responsavel   TEXT NOT NULL,
                    data_reserva  DATE NOT NULL,
                    turno         TEXT NOT NULL DEFAULT 'Manhã',
                    criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
                );
                """
            )
    _schema_ready = True


# ============================================================
# Módulo 1: Equipamentos
# ============================================================

def listar():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, nome, categoria, quantidade, status, criado_em
                FROM equipamentos
                ORDER BY id DESC;
                """
            )
            return cur.fetchall()


def buscar(item_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, nome, categoria, quantidade, status, criado_em
                FROM equipamentos
                WHERE id = %s;
                """,
                (item_id,),
            )
            return cur.fetchone()


def criar(nome, categoria, quantidade, status):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO equipamentos (nome, categoria, quantidade, status)
                VALUES (%s, %s, %s, %s) RETURNING id;
                """,
                (nome, categoria, quantidade, status),
            )
            return cur.fetchone()["id"]


def atualizar(item_id, nome, categoria, quantidade, status):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE equipamentos
                SET nome = %s, categoria = %s, quantidade = %s, status = %s
                WHERE id = %s;
                """,
                (nome, categoria, quantidade, status, item_id),
            )
            return cur.rowcount > 0


def excluir(item_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM equipamentos WHERE id = %s;", (item_id,))
            return cur.rowcount > 0


# ============================================================
# Módulo 2: Agendamento de Salas / Labs
# ============================================================

def listar_reservas():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, sala, responsavel, data_reserva, turno, criado_em
                FROM reservas
                ORDER BY data_reserva ASC, id DESC;
                """
            )
            return cur.fetchall()


def buscar_reserva(reserva_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, sala, responsavel, data_reserva, turno, criado_em
                FROM reservas
                WHERE id = %s;
                """,
                (reserva_id,),
            )
            return cur.fetchone()


def criar_reserva(sala, responsavel, data_reserva, turno):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO reservas (sala, responsavel, data_reserva, turno)
                VALUES (%s, %s, %s, %s) RETURNING id;
                """,
                (sala, responsavel, data_reserva, turno),
            )
            return cur.fetchone()["id"]


def atualizar_reserva(reserva_id, sala, responsavel, data_reserva, turno):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE reservas
                SET sala = %s, responsavel = %s, data_reserva = %s, turno = %s
                WHERE id = %s;
                """,
                (sala, responsavel, data_reserva, turno, reserva_id),
            )
            return cur.rowcount > 0


def excluir_reserva(reserva_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM reservas WHERE id = %s;", (reserva_id,))
            return cur.rowcount > 0


def ping():
    """Usado pelo /healthz: levanta exceção se o banco não responde."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
