const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let equipamentos = [
  { id: 1, nome: "Switch Cisco 24 Portas Gigabit", categoria: "Redes", quantidade: 4, status: "Disponível", criado_em: new Date().toLocaleString("pt-BR") },
  { id: 2, nome: "Servidor Dell PowerEdge R640", categoria: "Servidores", quantidade: 2, status: "Em Uso", criado_em: new Date().toLocaleString("pt-BR") },
  { id: 3, nome: "Roteador Mikrotik RB4011", categoria: "Redes", quantidade: 1, status: "Em Manutenção", criado_em: new Date().toLocaleString("pt-BR") }
];

let reservas = [
  { id: 1, sala: "Laboratório 02 - Redes e Telecom", responsavel: "Prof. Marcos", data_reserva: "2026-11-20", turno: "Manhã", criado_em: new Date().toLocaleString("pt-BR") },
  { id: 2, sala: "Laboratório 04 - Infraestrutura Cloud", responsavel: "Profª. Ana Paula", data_reserva: "2026-11-22", turno: "Noite", criado_em: new Date().toLocaleString("pt-BR") }
];

function renderPage(aba, content) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Portal do Laboratório de TI — Local Dev</title>
  <link rel="stylesheet" href="/static/style.css">
</head>
<body>
  <main>
    <header class="cabecalho">
      <div>
        <h1>Portal do Laboratório de TI</h1>
        <p class="sub">Gestão unificada de inventário e reservas · Servidor Local</p>
      </div>
      <a href="/healthz" target="_blank" class="badge-health">Healthz 200 OK</a>
    </header>

    <nav class="abas">
      <a href="/" class="aba ${aba === 'equipamentos' ? 'ativa' : ''}">📦 Controle de Equipamentos</a>
      <a href="/reservas" class="aba ${aba === 'reservas' ? 'ativa' : ''}">📅 Agendamento de Salas / Labs</a>
    </nav>

    ${content}
  </main>
</body>
</html>`;
}

function renderEquipamentos() {
  const listaHtml = equipamentos.length ? `
    <ul class="lista">
      ${equipamentos.map(e => `
        <li class="card item-equipamento">
          <div class="info-equipamento">
            <div class="topo-item">
              <strong>${e.nome}</strong>
              <span class="status-tag status-${e.status.toLowerCase().replace(/\s+/g, '-')}">${e.status}</span>
            </div>
            <p class="detalhes-item">
              <span><strong>Categoria:</strong> ${e.categoria}</span>
              <span><strong>Quantidade:</strong> ${e.quantidade} un.</span>
            </p>
            <small>#${e.id} · ${e.criado_em}</small>
          </div>
          <div class="acoes">
            <form method="post" action="/equipamentos/${e.id}/excluir">
              <button type="submit" class="btn-perigo" onclick="return confirm('Confirma exclusão?');">Excluir</button>
            </form>
          </div>
        </li>
      `).join('')}
    </ul>
  ` : '<p class="vazio">Nenhum equipamento cadastrado ainda.</p>';

  const formHtml = `
    <form method="post" action="/equipamentos" class="card form-grid">
      <h2>Cadastrar Novo Equipamento</h2>
      <div class="campo">
        <label for="nome">Nome do Equipamento *</label>
        <input id="nome" name="nome" required maxlength="120" placeholder="Ex.: Switch Cisco 24 Portas">
      </div>
      <div class="campo">
        <label for="categoria">Categoria *</label>
        <input id="categoria" name="categoria" required maxlength="80" placeholder="Ex.: Redes, Servidores">
      </div>
      <div class="linha-dupla">
        <div class="campo">
          <label for="quantidade">Quantidade * (Campo Numérico)</label>
          <input id="quantidade" name="quantidade" type="number" min="0" required value="1">
        </div>
        <div class="campo">
          <label for="status">Status *</label>
          <select id="status" name="status" required>
            <option value="Disponível" selected>Disponível</option>
            <option value="Em Uso">Em Uso</option>
            <option value="Em Manutenção">Em Manutenção</option>
            <option value="Desativado">Desativado</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn-primario">Cadastrar Equipamento</button>
    </form>
    <section class="secao-lista">
      <h2>Equipamentos Cadastrados (${equipamentos.length})</h2>
      ${listaHtml}
    </section>
  `;

  return renderPage('equipamentos', formHtml);
}

function renderReservas() {
  const listaHtml = reservas.length ? `
    <ul class="lista">
      ${reservas.map(r => `
        <li class="card item-equipamento">
          <div class="info-equipamento">
            <div class="topo-item">
              <strong>${r.sala}</strong>
              <span class="status-tag status-em-uso">${r.turno}</span>
            </div>
            <p class="detalhes-item">
              <span><strong>Responsável:</strong> ${r.responsavel}</span>
              <span><strong>Data:</strong> ${r.data_reserva}</span>
            </p>
            <small>#${r.id} · ${r.criado_em}</small>
          </div>
          <div class="acoes">
            <form method="post" action="/reservas/${r.id}/excluir">
              <button type="submit" class="btn-perigo" onclick="return confirm('Confirma cancelamento?');">Excluir</button>
            </form>
          </div>
        </li>
      `).join('')}
    </ul>
  ` : '<p class="vazio">Nenhuma reserva agendada ainda.</p>';

  const formHtml = `
    <form method="post" action="/reservas" class="card form-grid">
      <h2>Agendar Nova Sala / Laboratório</h2>
      <div class="campo">
        <label for="sala">Sala ou Laboratório *</label>
        <input id="sala" name="sala" required maxlength="100" placeholder="Ex.: Lab 04 - Infraestrutura">
      </div>
      <div class="campo">
        <label for="responsavel">Professor ou Responsável *</label>
        <input id="responsavel" name="responsavel" required maxlength="100" placeholder="Ex.: Prof. Carlos">
      </div>
      <div class="linha-dupla">
        <div class="campo">
          <label for="data_reserva">Data do Agendamento * (Campo Data)</label>
          <input id="data_reserva" name="data_reserva" type="date" required value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="campo">
          <label for="turno">Turno / Período *</label>
          <select id="turno" name="turno" required>
            <option value="Manhã" selected>Manhã (08:00 - 12:00)</option>
            <option value="Tarde">Tarde (13:30 - 17:30)</option>
            <option value="Noite">Noite (18:30 - 22:30)</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn-primario">Confirmar Agendamento</button>
    </form>
    <section class="secao-lista">
      <h2>Reservas Cadastradas (${reservas.length})</h2>
      ${listaHtml}
    </section>
  `;

  return renderPage('reservas', formHtml);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/static/style.css') {
    const cssPath = path.join(__dirname, 'static', 'style.css');
    fs.readFile(cssPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('CSS not found');
      }
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: "ok", service: "local-dev", timestamp: new Date().toISOString() }));
  }

  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderEquipamentos());
  }

  if (pathname === '/reservas' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderReservas());
  }

  if (pathname === '/equipamentos' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const novoId = equipamentos.length ? Math.max(...equipamentos.map(e => e.id)) + 1 : 1;
      equipamentos.unshift({
        id: novoId,
        nome: params.get('nome') || 'Equipamento',
        categoria: params.get('categoria') || 'Geral',
        quantidade: parseInt(params.get('quantidade') || '1', 10),
        status: params.get('status') || 'Disponível',
        criado_em: new Date().toLocaleString('pt-BR')
      });
      res.writeHead(302, { Location: '/' });
      res.end();
    });
    return;
  }

  if (pathname.startsWith('/equipamentos/') && pathname.endsWith('/excluir') && req.method === 'POST') {
    const id = parseInt(pathname.split('/')[2], 10);
    equipamentos = equipamentos.filter(e => e.id !== id);
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  if (pathname === '/reservas' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const novoId = reservas.length ? Math.max(...reservas.map(r => r.id)) + 1 : 1;
      reservas.unshift({
        id: novoId,
        sala: params.get('sala') || 'Sala',
        responsavel: params.get('responsavel') || 'Responsável',
        data_reserva: params.get('data_reserva') || new Date().toISOString().split('T')[0],
        turno: params.get('turno') || 'Manhã',
        criado_em: new Date().toLocaleString('pt-BR')
      });
      res.writeHead(302, { Location: '/reservas' });
      res.end();
    });
    return;
  }

  if (pathname.startsWith('/reservas/') && pathname.endsWith('/excluir') && req.method === 'POST') {
    const id = parseInt(pathname.split('/')[2], 10);
    reservas = reservas.filter(r => r.id !== id);
    res.writeHead(302, { Location: '/reservas' });
    return res.end();
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor local rodando em http://localhost:${PORT}`);
});
