"""Testes de integração: precisam de um PostgreSQL acessível em AIVEN_DB_URL.
No GitHub Actions, o workflow sobe um PostgreSQL de teste automaticamente."""

import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

pytestmark = pytest.mark.skipif(
    not os.environ.get("AIVEN_DB_URL"), reason="AIVEN_DB_URL não definida"
)


@pytest.fixture()
def client():
    import app as app_module
    import db

    db.ensure_schema()
    with db.get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("TRUNCATE equipamentos, reservas RESTART IDENTITY;")
    app_module.app.config["TESTING"] = True
    return app_module.app.test_client()


def test_healthz_ok(client):
    resp = client.get("/healthz")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"


# ============================================================
# Testes do Módulo 1: Equipamentos
# ============================================================

def test_crud_equipamentos_completo(client):
    # 1. Criar equipamento com 4 campos
    resp = client.post(
        "/equipamentos",
        data={
            "nome": "Switch Cisco 24 Portas",
            "categoria": "Redes",
            "quantidade": "10",
            "status": "Disponível",
        },
    )
    assert resp.status_code == 302

    # 2. Listar e validar
    dados = client.get("/api/equipamentos").get_json()
    assert len(dados) == 1
    assert dados[0]["nome"] == "Switch Cisco 24 Portas"
    assert dados[0]["categoria"] == "Redes"
    assert dados[0]["quantidade"] == 10
    assert dados[0]["status"] == "Disponível"

    item_id = dados[0]["id"]
    assert client.get("/").status_code == 200
    assert client.get(f"/equipamentos/{item_id}/editar").status_code == 200

    # 3. Editar equipamento
    resp = client.post(
        f"/equipamentos/{item_id}",
        data={
            "nome": "Switch Cisco Gigabit",
            "categoria": "Redes e Telecom",
            "quantidade": "8",
            "status": "Em Uso",
        },
    )
    assert resp.status_code == 302

    dados_atualizados = client.get("/api/equipamentos").get_json()
    assert dados_atualizados[0]["nome"] == "Switch Cisco Gigabit"
    assert dados_atualizados[0]["quantidade"] == 8
    assert dados_atualizados[0]["status"] == "Em Uso"

    # 4. Excluir equipamento
    resp = client.post(f"/equipamentos/{item_id}/excluir")
    assert resp.status_code == 302
    assert client.get("/api/equipamentos").get_json() == []


def test_validacoes_equipamentos(client):
    # Nome vazio
    resp = client.post(
        "/equipamentos",
        data={"nome": " ", "categoria": "Redes", "quantidade": "5"},
    )
    assert resp.status_code == 400

    # Categoria vazia
    resp = client.post(
        "/equipamentos",
        data={"nome": "Monitor", "categoria": " ", "quantidade": "2"},
    )
    assert resp.status_code == 400

    # Quantidade negativa
    resp = client.post(
        "/equipamentos",
        data={"nome": "Monitor", "categoria": "TI", "quantidade": "-1"},
    )
    assert resp.status_code == 400


# ============================================================
# Testes do Módulo 2: Reservas de Salas
# ============================================================

def test_crud_reservas_completo(client):
    # 1. Criar reserva com os 4 campos
    resp = client.post(
        "/reservas",
        data={
            "sala": "Lab 02 - Redes",
            "responsavel": "Prof. Marcos",
            "data_reserva": "2026-11-20",
            "turno": "Manhã",
        },
    )
    assert resp.status_code == 302

    # 2. Listar e validar
    dados = client.get("/api/reservas").get_json()
    assert len(dados) == 1
    assert dados[0]["sala"] == "Lab 02 - Redes"
    assert dados[0]["responsavel"] == "Prof. Marcos"
    assert dados[0]["data_reserva"] == "2026-11-20"
    assert dados[0]["turno"] == "Manhã"

    reserva_id = dados[0]["id"]
    assert client.get("/reservas").status_code == 200
    assert client.get(f"/reservas/{reserva_id}/editar").status_code == 200

    # 3. Editar reserva
    resp = client.post(
        f"/reservas/{reserva_id}",
        data={
            "sala": "Lab 04 - Infraestrutura",
            "responsavel": "Prof. Marcos Silva",
            "data_reserva": "2026-11-21",
            "turno": "Noite",
        },
    )
    assert resp.status_code == 302

    dados_atualizados = client.get("/api/reservas").get_json()
    assert dados_atualizados[0]["sala"] == "Lab 04 - Infraestrutura"
    assert dados_atualizados[0]["turno"] == "Noite"

    # 4. Excluir reserva
    resp = client.post(f"/reservas/{reserva_id}/excluir")
    assert resp.status_code == 302
    assert client.get("/api/reservas").get_json() == []


def test_validacoes_reservas(client):
    # Sala vazia
    resp = client.post(
        "/reservas",
        data={"sala": " ", "responsavel": "Prof.", "data_reserva": "2026-11-20"},
    )
    assert resp.status_code == 400

    # Data inválida
    resp = client.post(
        "/reservas",
        data={"sala": "Lab 1", "responsavel": "Prof.", "data_reserva": "data-errada"},
    )
    assert resp.status_code == 400


def test_itens_inexistentes(client):
    assert client.get("/equipamentos/9999/editar").status_code == 404
    assert client.post("/equipamentos/9999/excluir").status_code == 404
    assert client.get("/reservas/9999/editar").status_code == 404
    assert client.post("/reservas/9999/excluir").status_code == 404


def test_healthz_sem_banco(client, monkeypatch):
    monkeypatch.setenv("AIVEN_DB_URL", "postgres://x:y@127.0.0.1:1/nada")
    resp = client.get("/healthz")
    assert resp.status_code == 503
