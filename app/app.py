"""
Aplicação CRUD — Portal de Gestão de Laboratórios de TI (Projeto 0).

Módulos integrados:
1. Controle de Equipamentos de TI (nome, categoria, quantidade, status)
2. Agendamento de Salas / Labs (sala, responsavel, data_reserva, turno)
Mantém as 4 operações de CRUD para ambos os módulos e o endpoint /healthz.
"""

from datetime import datetime
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


# ============================================================
# Rotas: Módulo de Equipamentos
# ============================================================

@app.route("/")
def index():
    return render_template("index.html", equipamentos=db.listar(), aba="equipamentos")


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


# ============================================================
# Rotas: Módulo de Agendamento de Salas / Labs
# ============================================================

@app.route("/reservas")
def index_reservas():
    return render_template("reservas.html", reservas=db.listar_reservas(), aba="reservas")


@app.route("/reservas", methods=["POST"])
def criar_reserva():
    sala = request.form.get("sala", "").strip()
    responsavel = request.form.get("responsavel", "").strip()
    data_reserva_str = request.form.get("data_reserva", "").strip()
    turno = request.form.get("turno", "").strip() or "Manhã"

    if not sala:
        abort(400, "A sala/laboratório é obrigatória.")
    if not responsavel:
        abort(400, "O responsável pela reserva é obrigatório.")

    try:
        data_reserva = datetime.strptime(data_reserva_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        abort(400, "Data de reserva inválida (esperado AAAA-MM-DD).")

    db.criar_reserva(sala, responsavel, data_reserva, turno)
    return redirect(url_for("index_reservas"))


@app.route("/reservas/<int:reserva_id>/editar")
def editar_reserva(reserva_id):
    reserva = db.buscar_reserva(reserva_id)
    if reserva is None:
        abort(404)
    return render_template("editar_reserva.html", reserva=reserva)


@app.route("/reservas/<int:reserva_id>", methods=["POST"])
def atualizar_reserva(reserva_id):
    sala = request.form.get("sala", "").strip()
    responsavel = request.form.get("responsavel", "").strip()
    data_reserva_str = request.form.get("data_reserva", "").strip()
    turno = request.form.get("turno", "").strip() or "Manhã"

    if not sala:
        abort(400, "A sala/laboratório é obrigatória.")
    if not responsavel:
        abort(400, "O responsável pela reserva é obrigatório.")

    try:
        data_reserva = datetime.strptime(data_reserva_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        abort(400, "Data de reserva inválida (esperado AAAA-MM-DD).")

    if not db.atualizar_reserva(reserva_id, sala, responsavel, data_reserva, turno):
        abort(404)
    return redirect(url_for("index_reservas"))


@app.route("/reservas/<int:reserva_id>/excluir", methods=["POST"])
def excluir_reserva(reserva_id):
    if not db.excluir_reserva(reserva_id):
        abort(404)
    return redirect(url_for("index_reservas"))


@app.route("/api/reservas")
def api_reservas():
    return jsonify(
        [
            {
                "id": r["id"],
                "sala": r["sala"],
                "responsavel": r["responsavel"],
                "data_reserva": r["data_reserva"].isoformat(),
                "turno": r["turno"],
                "criado_em": r["criado_em"].isoformat(),
            }
            for r in db.listar_reservas()
        ]
    )


# ============================================================
# Health Check
# ============================================================

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
