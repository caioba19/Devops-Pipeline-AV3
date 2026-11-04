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
            cur.execute("TRUNCATE equipamentos RESTART IDENTITY;")
    app_module.app.config["TESTING"] = True
    return app_module.app.test_client()


def test_healthz_ok(client):
    resp = client.get("/healthz")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"


def test_crud_completo(client):
    # 1. Criar equipamento com os 4 campos (nome, categoria, quantidade, status)
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

    # 2. Listar e validar persistência de todos os campos
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
    assert dados_atualizados[0]["categoria"] == "Redes e Telecom"
    assert dados_atualizados[0]["quantidade"] == 8
    assert dados_atualizados[0]["status"] == "Em Uso"

    # 4. Excluir equipamento
    resp = client.post(f"/equipamentos/{item_id}/excluir")
    assert resp.status_code == 302
    assert client.get("/api/equipamentos").get_json() == []


def test_validacoes_campos_obrigatorios(client):
    # Nome vazio
    resp = client.post(
        "/equipamentos",
        data={
            "nome": "   ",
            "categoria": "Redes",
            "quantidade": "5",
            "status": "Disponível",
        },
    )
    assert resp.status_code == 400

    # Categoria vazia
    resp = client.post(
        "/equipamentos",
        data={
            "nome": "Monitor",
            "categoria": "  ",
            "quantidade": "2",
            "status": "Disponível",
        },
    )
    assert resp.status_code == 400

    # Quantidade negativa ou não numérica
    resp = client.post(
        "/equipamentos",
        data={
            "nome": "Monitor",
            "categoria": "Periféricos",
            "quantidade": "-1",
            "status": "Disponível",
        },
    )
    assert resp.status_code == 400


def test_item_inexistente(client):
    assert client.get("/equipamentos/9999/editar").status_code == 404
    assert client.post("/equipamentos/9999/excluir").status_code == 404


def test_healthz_sem_banco(client, monkeypatch):
    monkeypatch.setenv("AIVEN_DB_URL", "postgres://x:y@127.0.0.1:1/nada")
    resp = client.get("/healthz")
    assert resp.status_code == 503
