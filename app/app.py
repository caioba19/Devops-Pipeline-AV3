"""
Aplicação CRUD — Controle de Equipamentos de TI / Laboratório (Projeto 0).

Tema adaptado: Controle de Equipamentos de TI (nome, categoria, quantidade, status).
Mantém as 4 operações de CRUD e o endpoint de health check /healthz.
"""

import logging

from flask import Flask, abort, jsonify, redirect, render_template, request, url_for

import db

app = Flask(__name__)
app.logger.setLevel(logging.INFO)


@app.before_request
def preparar_banco():
    # O health check testa o banco por conta própria e não pode falhar aqui.
    if request.path != "/healthz":
        db.ensure_schema()


@app.route("/")
def index():
    return render_template("index.html", equipamentos=db.listar())


@app.route("/equipamentos", methods=["POST"])
def criar():
    nome = request.form.get("nome", "").strip()
    categoria = request.form.get("categoria", "").strip()
    quantidade_raw = request.form.get("quantidade", "").strip()
    status = request.form.get("status", "").strip() or "Disponível"

    if not nome:
        abort(400, "O nome do equipamento é obrigatório.")
    if not categoria:
        abort(400, "A categoria é obrigatória.")

    try:
        quantidade = int(quantidade_raw)
        if quantidade < 0:
            raise ValueError
    except (ValueError, TypeError):
        abort(400, "A quantidade deve ser um número inteiro maior ou igual a zero.")

    db.criar(nome, categoria, quantidade, status)
    return redirect(url_for("index"))


@app.route("/equipamentos/<int:item_id>/editar")
def editar(item_id):
    equipamento = db.buscar(item_id)
    if equipamento is None:
        abort(404)
    return render_template("editar.html", equipamento=equipamento)


@app.route("/equipamentos/<int:item_id>", methods=["POST"])
def atualizar(item_id):
    nome = request.form.get("nome", "").strip()
    categoria = request.form.get("categoria", "").strip()
    quantidade_raw = request.form.get("quantidade", "").strip()
    status = request.form.get("status", "").strip() or "Disponível"

    if not nome:
        abort(400, "O nome do equipamento é obrigatório.")
    if not categoria:
        abort(400, "A categoria é obrigatória.")

    try:
        quantidade = int(quantidade_raw)
        if quantidade < 0:
            raise ValueError
    except (ValueError, TypeError):
        abort(400, "A quantidade deve ser um número inteiro maior ou igual a zero.")

    if not db.atualizar(item_id, nome, categoria, quantidade, status):
        abort(404)
    return redirect(url_for("index"))


@app.route("/equipamentos/<int:item_id>/excluir", methods=["POST"])
def excluir(item_id):
    if not db.excluir(item_id):
        abort(404)
    return redirect(url_for("index"))


@app.route("/api/equipamentos")
def api_equipamentos():
    return jsonify(
        [
            {
                "id": e["id"],
                "nome": e["nome"],
                "categoria": e["categoria"],
                "quantidade": e["quantidade"],
                "status": e["status"],
                "criado_em": e["criado_em"].isoformat(),
            }
            for e in db.listar()
        ]
    )


@app.route("/healthz")
def healthz():
    """200 com o banco ativo, 503 sem conexão. Usado pelo pipeline e pelo Render."""
    try:
        db.ping()
        return jsonify({"status": "ok"}), 200
    except Exception as exc:  # noqa: BLE001
        app.logger.warning("Health check falhou: %s", exc)
        return jsonify({"status": "erro", "detalhe": "banco indisponível"}), 503


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
