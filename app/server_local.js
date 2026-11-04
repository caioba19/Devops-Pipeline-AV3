const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let equipamentos = [
  { id: 1, nome: "Switch Cisco Catalyst 24 Portas Gigabit", categoria: "Redes", quantidade: 4, status: "Disponível", criado_em: new Date().toLocaleString("pt-BR") },
  { id: 2, nome: "Servidor Dell PowerEdge R640", categoria: "Servidores", quantidade: 2, status: "Em Uso", criado_em: new Date().toLocaleString("pt-BR") },
  { id: 3, nome: "Nobreak APC Smart-UPS 3000VA", categoria: "Infraestrutura", quantidade: 1, status: "Em Manutenção", criado_em: new Date().toLocaleString("pt-BR") }
];

let reservas = [
  { id: 1, sala: "Laboratório 02 - Redes e Telecom", responsavel: "Prof. Carlos Eduardo", data_reserva: "2026-11-20", turno: "Manhã", criado_em: new Date().toLocaleString("pt-BR") },
  { id: 2, sala: "Laboratório 04 - Infraestrutura Cloud", responsavel: "Profª. Ana Paula Santos", data_reserva: "2026-11-22", turno: "Noite", criado_em: new Date().toLocaleString("pt-BR") }
];

function renderPage(aba, content, metricasHtml) {
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
      <div class="cabecalho-info">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
          </svg>
        </div>
        <div>
          <h1>Portal do Laboratório de TI</h1>
          <p class="sub">Gestão unificada de inventário e reservas · Aiven PostgreSQL</p>
        </div>
      </div>
      <a href="/healthz" target="_blank" class="badge-health">
        <span class="dot-pulse"></span>
        /healthz 200 OK
      </a>
    </header>

    ${metricasHtml}

    <nav class="abas">
      <a href="/" class="aba ${aba === 'equipamentos' ? 'ativa' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        Controle de Equipamentos
      </a>
      <a href="/reservas" class="aba ${aba === 'reservas' ? 'ativa' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Agendamento de Salas / Labs
      </a>
    </nav>

    ${content}
  </main>
  <script src="/static/validacoes.js"></script>
  <script>
    function filtrarLista() {
      const termo = document.getElementById("filtro-busca").value.toLowerCase();
      const itens = document.querySelectorAll("#lista-itens li");
      let visiveis = 0;
      itens.forEach(li => {
        const texto = li.getAttribute("data-busca") || "";
        if (texto.includes(termo)) {
          li.style.display = "flex";
          visiveis++;
        } else {
          li.style.display = "none";
        }
      });
      document.getElementById("contagem-lista").textContent = visiveis;
    }
  </script>
</body>
</html>`;
}

function renderEquipamentos() {
  const disp = equipamentos.filter(e => e.status === 'Disponível').length;
  const emUso = equipamentos.filter(e => e.status === 'Em Uso').length;
  const manut = equipamentos.filter(e => e.status === 'Em Manutenção').length;

  const metricasHtml = `
    <div class="metricas-grid">
      <div class="card-metrica">
        <span class="metrica-label">Total Cadastrado</span>
        <span class="metrica-valor">${equipamentos.length}</span>
      </div>
      <div class="card-metrica">
        <span class="metrica-label" style="color: var(--verde-brilho);">Disponíveis</span>
        <span class="metrica-valor" style="color: var(--verde-brilho);">${disp}</span>
      </div>
      <div class="card-metrica">
        <span class="metrica-label" style="color: var(--cor-brilho);">Em Uso</span>
        <span class="metrica-valor" style="color: var(--cor-brilho);">${emUso}</span>
      </div>
      <div class="card-metrica">
        <span class="metrica-label" style="color: var(--amarelo);">Manutenção</span>
        <span class="metrica-valor" style="color: var(--amarelo);">${manut}</span>
      </div>
    </div>
  `;

  const listaHtml = equipamentos.length ? `
    <ul class="lista" id="lista-itens">
      ${equipamentos.map(e => `
        <li class="item-equipamento" data-busca="${e.nome.toLowerCase()} ${e.categoria.toLowerCase()} ${e.status.toLowerCase()}">
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
              <button type="submit" class="btn-perigo">Excluir</button>
            </form>
          </div>
        </li>
      `).join('')}
    </ul>
  ` : '<p class="vazio">Nenhum equipamento cadastrado ainda.</p>';

  const formHtml = `
    <form method="post" action="/equipamentos" class="card form-grid">
      <div class="titulo-secao">
        <span>Cadastrar Novo Equipamento</span>
      </div>
      <div class="campo">
        <label for="nome">Nome do Equipamento *</label>
        <input id="nome" name="nome" required maxlength="120" placeholder="Ex.: Switch Cisco Catalyst 24 Portas">
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
      <button type="submit" class="btn-primario">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Cadastrar Equipamento
      </button>
    </form>
    <section class="secao-lista">
      <div class="titulo-secao">
        <span>Equipamentos Cadastrados (<span id="contagem-lista">${equipamentos.length}</span>)</span>
      </div>
      <div class="barra-busca">
        <input id="filtro-busca" type="text" class="input-busca" placeholder="🔍 Buscar por nome, categoria ou status..." onkeyup="filtrarLista()">
      </div>
      ${listaHtml}
    </section>
  `;

  return renderPage('equipamentos', formHtml, metricasHtml);
}

function renderReservas() {
  const manha = reservas.filter(r => r.turno === 'Manhã').length;
  const tarde = reservas.filter(r => r.turno === 'Tarde').length;
  const noite = reservas.filter(r => r.turno === 'Noite').length;

  const metricasHtml = `
    <div class="metricas-grid">
      <div class="card-metrica">
        <span class="metrica-label">Total Reservas</span>
        <span class="metrica-valor">${reservas.length}</span>
      </div>
      <div class="card-metrica">
        <span class="metrica-label" style="color: var(--verde-brilho);">Manhã</span>
        <span class="metrica-valor" style="color: var(--verde-brilho);">${manha}</span>
      </div>
      <div class="card-metrica">
        <span class="metrica-label" style="color: var(--amarelo);">Tarde</span>
        <span class="metrica-valor" style="color: var(--amarelo);">${tarde}</span>
      </div>
      <div class="card-metrica">
        <span class="metrica-label" style="color: var(--cor-brilho);">Noite</span>
        <span class="metrica-valor" style="color: var(--cor-brilho);">${noite}</span>
      </div>
    </div>
  `;

  const listaHtml = reservas.length ? `
    <ul class="lista" id="lista-itens">
      ${reservas.map(r => `
        <li class="item-equipamento" data-busca="${r.sala.toLowerCase()} ${r.responsavel.toLowerCase()} ${r.turno.toLowerCase()}">
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
              <button type="submit" class="btn-perigo">Excluir</button>
            </form>
          </div>
        </li>
      `).join('')}
    </ul>
  ` : '<p class="vazio">Nenhuma reserva agendada ainda.</p>';

  const formHtml = `
    <form method="post" action="/reservas" class="card form-grid">
      <div class="titulo-secao">
        <span>Agendar Nova Sala / Laboratório</span>
      </div>
      <div class="campo">
        <label for="sala">Sala ou Laboratório *</label>
        <input id="sala" name="sala" required maxlength="100" placeholder="Ex.: Lab 04 - Infraestrutura Cloud">
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
      <button type="submit" class="btn-primario">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Confirmar Agendamento
      </button>
    </form>
    <section class="secao-lista">
      <div class="titulo-secao">
        <span>Reservas Cadastradas (<span id="contagem-lista">${reservas.length}</span>)</span>
      </div>
      <div class="barra-busca">
        <input id="filtro-busca" type="text" class="input-busca" placeholder="🔍 Buscar por sala, responsável ou turno..." onkeyup="filtrarLista()">
      </div>
      ${listaHtml}
    </section>
  `;

  return renderPage('reservas', formHtml, metricasHtml);
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

  if (pathname === '/static/validacoes.js') {
    const jsPath = path.join(__dirname, 'static', 'validacoes.js');
    fs.readFile(jsPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('JS not found');
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
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
