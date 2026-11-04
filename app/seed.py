"""Script de população inicial (seed) do banco PostgreSQL na Aiven.

Insere dados de exemplo em equipamentos e reservas de forma idempotente.
Uso:
    python seed.py
"""

from datetime import date, timedelta
import os
import sys

import psycopg2
from psycopg2.extras import RealDictCursor

# Adiciona o diretório atual ao sys.path para importar db se necessário
sys.path.insert(0, os.path.dirname(__file__))

AIVEN_DB_URL = os.environ.get("AIVEN_DB_URL")


def get_connection():
    if not AIVEN_DB_URL:
        print("Erro: A variável de ambiente AIVEN_DB_URL não está configurada.")
        print("Defina-a com a URI de conexão do PostgreSQL da Aiven e tente novamente.")
        sys.exit(1)
    return psycopg2.connect(AIVEN_DB_URL, cursor_factory=RealDictCursor, connect_timeout=10)


def seed():
    import db
    print("Garantindo que as tabelas existem...")
    db.ensure_schema()

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            # 1. Seed de Equipamentos
            equipamentos_exemplo = [
                ("Switch Cisco Catalyst 24 Portas Gigabit", "Redes", 4, "Disponível"),
                ("Servidor Dell PowerEdge R640", "Servidores", 2, "Em Uso"),
                ("Roteador Mikrotik Cloud Router CCR1009", "Redes", 1, "Disponível"),
                ("Monitor Dell UltraSharp 27'' 4K", "Periféricos", 8, "Disponível"),
                ("Nobreak APC Smart-UPS 3000VA", "Infraestrutura", 2, "Em Manutenção"),
            ]

            print("Semeando equipamentos...")
            for nome, categoria, quantidade, status in equipamentos_exemplo:
                cur.execute(
                    "SELECT id FROM equipamentos WHERE nome = %s LIMIT 1;",
                    (nome,),
                )
                if not cur.fetchone():
                    cur.execute(
                        """
                        INSERT INTO equipamentos (nome, categoria, quantidade, status)
                        VALUES (%s, %s, %s, %s);
                        """,
                        (nome, categoria, quantidade, status),
                    )
                    print(f"  + Equipamento adicionado: {nome}")
                else:
                    print(f"  ~ Equipamento já existente: {nome}")

            # 2. Seed de Reservas de Salas / Labs
            hoje = date.today()
            reservas_exemplo = [
                (
                    "Laboratório 02 - Redes e Telecom",
                    "Prof. Carlos Eduardo",
                    hoje + timedelta(days=2),
                    "Manhã",
                ),
                (
                    "Laboratório 04 - Infraestrutura Cloud",
                    "Profª. Ana Paula Santos",
                    hoje + timedelta(days=4),
                    "Noite",
                ),
                (
                    "Laboratório 01 - Desenvolvimento Software",
                    "Prof. Marcos Vinicius",
                    hoje + timedelta(days=6),
                    "Tarde",
                ),
            ]

            print("\nSemeando reservas de salas...")
            for sala, responsavel, data_res, turno in reservas_exemplo:
                cur.execute(
                    """
                    SELECT id FROM reservas
                    WHERE sala = %s AND data_reserva = %s AND turno = %s
                    LIMIT 1;
                    """,
                    (sala, data_res, turno),
                )
                if not cur.fetchone():
                    cur.execute(
                        """
                        INSERT INTO reservas (sala, responsavel, data_reserva, turno)
                        VALUES (%s, %s, %s, %s);
                        """,
                        (sala, responsavel, data_res, turno),
                    )
                    print(f"  + Reserva adicionada: {sala} ({data_res} - {turno})")
                else:
                    print(f"  ~ Reserva já existente: {sala} ({data_res} - {turno})")

    conn.close()
    print("\nBanco de dados semeado com sucesso! Os dados estão prontos.")


if __name__ == "__main__":
    seed()
