let dadosOriginais = [];
let dadosFiltrados = [];
let dadosPlanejamento = [];
let dadosPlanejamentoRegional = [];
let charts = {};

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const filialFilter = document.getElementById('filial-filter');
const encarregadoFilter = document.getElementById('encarregado-filter');
const subregionalFilter = document.getElementById('subregional-filter');
const bandeiraFilter = document.getElementById('bandeira-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const dadosDemandas = 'https://opensheet.elk.sh/1XuoZ_m0yo-fvJHwptt5jS9IPSeuTMiPTfQm20lOjdFQ/Sc'

document.addEventListener('DOMContentLoaded', function() {
            const navbarToggle = document.getElementById('navbar-toggle');
            const navbarFilters = document.querySelector('.navbar-filters');

            navbarToggle.addEventListener('click', function() {
                navbarFilters.classList.toggle('active');
            });
        });

// Mapeamento de famílias para contas/linhas do planejamento com números de conta
const mapeamentoFamilias = {
    'EMPILHADEIRAS PREVENTIVA': { contas: ['23.07 - Manut. Prev. Empilhadeiras'], numero: '4120100041' },
    'EMPILHADEIRAS CORRETIVA': { contas: ['22.07 - Manutenção Empilhadeiras'], numero: '4120100038' },
    'MANUTENÇÃO CORRETIVA CIVIL PREDIAL/ PPCI-SPDA/ETE-ETA/ESGOTO': { contas: ['22.03 - Civil Predial/PPCI-SPDA/ETE-ETA/Esgoto'], numero: '4120100003' },
    'MANUTENÇÃO PREVENTIVA CIVIL PREDIAL/ PPCI-SPDA/ETE-ETA/ESGOTO ': { contas: ['23.03 - Manut. Prev. Civil Predial/PPCI-SPDA/ETE-ETA/Esgoto'], numero: '4120100026' },
    'REFRIGERAÇÃO CORRETIVA': { contas: ['22.02 - Refrigeração'], numero: '4120100006' },
    'REFRIGERAÇÃO PREVENTIVA': { contas: ['23.02 - Manut. Prev. Refrigeração'], numero: '4120100012' },
    'ELETRICA/GERADORES/ NOBREAKS PREVENTIVA': { contas: ['23.05 - Manut. Prev. Elétrica/Geradores/Nobreaks'], numero: '4120100027' },
    'ELETRICA/GERADORES/ NOBREAKS CORRETIVA': { contas: ['22.05 - Elétrica/Geradores/Nobreaks'], numero: '4120100005' },
    'CARRINHOS PREVENTIVA': { contas: ['23.04 - Manut. Prev. Carrinhos'], numero: '4120100028' },
    'CARRINHOS CORRETIVA': { contas: ['22.04 - Carrinhos'], numero: '4120100005' },
    'MAQUINAS / EQUIPAMENTOS CORRETIVA': { contas: ['22.01 - Máquinas e Equipamentos'], numero: '4120100004' },
    'MAQUINAS / EQUIPAMENTOS PREVENTIVA': { contas: ['23.01 - Manut. Prev. Máquinas e Equipamentos'], numero: '4120100001' },
    'CLIMATIZAÇÃO PREVENTIVA': { contas: ['23.08 - Manut. Prev. Climatização'], numero: '4120100040' },
    'CLIMATIZAÇÃO CORRETIVA': { contas: ['22.08 - Climatização'], numero: '4120100039' },
    'MOVEIS/  UTENSILIOS ': { contas: ['22.09 - Móveis e Utensílios de Escritório'], numero: '4120100002' },
    'LOCAÇÃO DE MAQ./ EQUIP.': { contas: ['22.06 - Garantias Loc. de Maq/Equip/Emp'], numero: '4120100023' }
};

// Mapeamento de TODAS as contas do planejamento.json (para exibir mesmo sem dados)
const todasAsContas = [
    { conta: '22.01 - Máquinas e Equipamentos', numero: '4120100004', familia: 'MAQUINAS / EQUIPAMENTOS CORRETIVA' },
    { conta: '22.02 - Refrigeração', numero: '4120100006', familia: 'REFRIGERAÇÃO CORRETIVA' },
    { conta: '22.03 - Civil Predial/PPCI-SPDA/ETE-ETA/Esgoto', numero: '4120100003', familia: 'MANUTENÇÃO CORRETIVA CIVIL PREDIAL/ PPCI-SPDA/ETE-ETA/ESGOTO' },
    { conta: '22.04 - Carrinhos', numero: '4120100005', familia: 'CARRINHOS CORRETIVA' },
    { conta: '22.05 - Elétrica/Geradores/Nobreaks', numero: '4120100005', familia: 'ELETRICA/GERADORES/ NOBREAKS CORRETIVA' },
    { conta: '22.06 - Garantias Loc. de Maq/Equip/Emp', numero: '4120100023', familia: 'GARANTIA' },
    { conta: '22.07 - Manutenção Empilhadeiras', numero: '4120100038', familia: 'EMPILHADEIRAS CORRETIVA' },
    { conta: '22.08 - Climatização', numero: '4120100039', familia: 'CLIMATIZAÇÃO CORRETIVA' },
    { conta: '22.09 - Móveis e Utensílios de Escritório', numero: '4120100002', familia: 'MOVEIS/  UTENSILIOS ' },
    { conta: '22.10 - Manutenção com MKT', numero: '4120100042', familia: null },
    { conta: '23.01 - Manut. Prev. Máquinas e Equipamentos', numero: '4120100001', familia: 'MAQUINAS / EQUIPAMENTOS PREVENTIVA' },
    { conta: '23.02 - Manut. Prev. Refrigeração', numero: '4120100012', familia: 'REFRIGERAÇÃO PREVENTIVA' },
    { conta: '23.03 - Manut. Prev. Civil Predial/PPCI-SPDA/ETE-ETA/Esgoto', numero: '4120100026', familia: 'MANUTENÇÃO PREVENTIVA CIVIL PREDIAL/ PPCI-SPDA/ETE-ETA/ESGOTO ' },
    { conta: '23.04 - Manut. Prev. Carrinhos', numero: '4120100028', familia: 'CARRINHOS PREVENTIVA' },
    { conta: '23.05 - Manut. Prev. Elétrica/Geradores/Nobreaks', numero: '4120100027', familia: 'ELETRICA/GERADORES/ NOBREAKS PREVENTIVA' },
    { conta: '23.06 - Manut. Prev. Cons./Esgoto/Contr Pragas/Limp Reservat', numero: '4120100029', familia: null },
    { conta: '23.07 - Manut. Prev. Empilhadeiras', numero: '4120100041', familia: 'EMPILHADEIRAS PREVENTIVA' },
    { conta: '23.08 - Manut. Climatização', numero: '4120100040', familia: 'CLIMATIZAÇÃO PREVENTIVA' },
    { conta: '23.09 - Contratos Manut. Prev Máquinas e Equipamentos', numero: '4120100010', familia: null },
    { conta: '23.10 - Contratos Manut. Prev. Refrigeração', numero: '4120100011', familia: null },
    { conta: '23.11 - Contratos Manut. Prev. Civil Predial/PPCI-SPDA/ETE-ETA/Esgoto', numero: '4120100025', familia: null },
    { conta: '23.12 - Contratos Manut. Prev. Elétrica/Geradores/Nobreaks', numero: '4120100024', familia: null },
    { conta: '23.13 - Contratos Manut. Prev. Conserv./Esgoto/Limp Reservat', numero: '4120100030', familia: null },
    { conta: '23.14 - Contratos Manut. Prev. Climatização', numero: '4120100037', familia: null }
];

function converterValorBrasileiro(valorStr) {
    if (!valorStr) return 0;
    
    const valorString = String(valorStr).trim();
    
    // Se já é um número (sem R$ e sem vírgula), retornar diretamente
    if (valorString.replace('.', '').replace('-', '').replace(/\d/g, '') === '') {
        return parseFloat(valorString) || 0;
    }
    
    // Se tem R$ ou vírgula, é formato brasileiro
    if (valorString.includes('R$') || valorString.includes(',')) {
        const valorLimpo = valorString
            .replace('R$', '')
            .replace(/\./g, '') // Remove pontos (separadores de milhares)
            .replace(',', '.') // Substitui vírgula por ponto (separador decimal)
            .trim();
        
        const numero = parseFloat(valorLimpo);
        return isNaN(numero) ? 0 : numero;
    }
    
    // Caso padrão
    const numero = parseFloat(valorString);
    return isNaN(numero) ? 0 : numero;
}

document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    configurarEventListeners();
});

function configurarEventListeners() {
    filialFilter.addEventListener('change', aplicarFiltros);
    encarregadoFilter.addEventListener('change', aplicarFiltros);
    subregionalFilter.addEventListener('change', aplicarFiltros);
    bandeiraFilter.addEventListener('change', aplicarFiltros);
    clearFiltersBtn.addEventListener('click', limparFiltros);
}

async function carregarDados() {
    try {
        mostrarLoading(true);
        
        const responseDados = await fetch(dadosDemandas);
        if (!responseDados.ok) {
            throw new Error(`HTTP error! status: ${responseDados.status}`);
        }
        
        const responsePlanejamento = await fetch('planejamento.json');
        if (!responsePlanejamento.ok) {
            throw new Error(`HTTP error! status: ${responsePlanejamento.status}`);
        }
        
        const responsePlanejamentoRegional = await fetch("planejamentoContasRegional.json");
        if (!responsePlanejamentoRegional.ok) {
            throw new Error(`HTTP error! status: ${responsePlanejamentoRegional.status}`);
        }
        
        const dadosBrutos = await responseDados.json();
        dadosPlanejamento = await responsePlanejamento.json();
        dadosPlanejamentoRegional = await responsePlanejamentoRegional.json();
        
        dadosOriginais = dadosBrutos.filter(item => {
            const encarregado = String(item.ENCARREGADO || '').trim();
            return encarregado !== '';
        });
        
        dadosFiltrados = [...dadosOriginais];
        
        // Aplicar mapeamento customizado de subregionais
        aplicarMapeamentoSubregional();
        
        popularFiltros();
        atualizarDashboard();
        
        validarLojasSubregional();
        
        mostrarLoading(false);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarErro(true);
        mostrarLoading(false);
    }
}

function mostrarLoading(mostrar) {
    loadingElement.style.display = mostrar ? 'flex' : 'none';
}

function mostrarErro(mostrar) {
    errorElement.style.display = mostrar ? 'block' : 'none';
}

// Função para aplicar mapeamento customizado de subregionais
function aplicarMapeamentoSubregional() {
    // Lojas da Subregional Norte (conforme especificado pelo usuário)
    const lojasNorte = [85, 165, 250, 305, 335, 385, 405, 905];
    
    // Lojas da Subregional Vale (conforme especificado pelo usuário)
    const lojasVale = [115, 135, 190, 195, 225, 255, 270, 295, 310, 325, 375,420, 425, 480, 825];
    
    // Atualizar o campo SUB no dadosPlanejamento
    dadosPlanejamento.forEach(item => {
        const loja = Number(item.Loja);
        
        if (lojasNorte.includes(loja)) {
            item.SUB = 'NORTE';
        } else if (lojasVale.includes(loja)) {
            item.SUB = 'VALE';
        } else {
            item.SUB = 'OUTROS';  // Lojas que não pertencem a nenhuma subregional especificada
        }
    });
}

function popularFiltros() {
    // Obter filiais únicas do planejamento e mapear 897 para 264
    const filiaisUnicas = [...new Set(dadosPlanejamento.map(item => {
        // Se a loja for 897, exibir como 264
        return item.Loja 
    }))].sort((a, b) => a - b);
    
    filialFilter.innerHTML = '<option value="">Todas as Filiais</option>';
    filiaisUnicas.forEach(filial => {
        const option = document.createElement('option');
        option.value = filial 
        option.textContent = `Filial ${filial}`;
        filialFilter.appendChild(option);
    });

    const encarregadosUnicos = [...new Set(dadosOriginais.map(item => item.ENCARREGADO))].sort();
    encarregadoFilter.innerHTML = '<option value="">Todos os Encarregados</option>';
    encarregadosUnicos.forEach(encarregado => {
        const option = document.createElement('option');
        option.value = encarregado;
        option.textContent = encarregado;
        encarregadoFilter.appendChild(option);
    });
}

function aplicarFiltros() {
    dadosFiltrados = dadosOriginais.filter(item => {
        const filialMatch = !filialFilter.value || item.FILIAL.toString() === filialFilter.value;
        const encarregadoMatch = !encarregadoFilter.value || item.ENCARREGADO === encarregadoFilter.value;
        
        const infoLoja = obterInfoLoja(item.FILIAL);
        const subregionalMatch = !subregionalFilter.value || infoLoja.subregional === subregionalFilter.value;
        const bandeiraMatch = !bandeiraFilter.value || infoLoja.bandeira === bandeiraFilter.value;
        console.log(dadosFiltrados);
        
        return filialMatch && encarregadoMatch && subregionalMatch && bandeiraMatch;
    });
    
    atualizarDashboard();
}

function limparFiltros() {
    filialFilter.value = '';
    encarregadoFilter.value = '';
    subregionalFilter.value = '';
    bandeiraFilter.value = '';
    dadosFiltrados = [...dadosOriginais];
    atualizarDashboard();
}

function atualizarDashboard() {
    atualizarEstatisticasGerais();
    atualizarGraficos();
    atualizarTabelaFamilia();
    atualizarPlanilhaDemandasSemPedido();
}

function atualizarEstatisticasGerais() {
    const totalDemandas = dadosFiltrados.length;
    document.getElementById('total-demandas').textContent = totalDemandas.toLocaleString('pt-BR');

    const demandasComPedido = dadosFiltrados.filter(item => 
        item['STATUS PEDIDO'] === 'PEDIDO ACEITO'
    ).length;
    document.getElementById('demandas-com-pedido').textContent = demandasComPedido.toLocaleString('pt-BR');

    const demandasSemValor = dadosFiltrados.filter(item => 
        !item['VALOR DA DEMANDA'] || converterValorBrasileiro(item['VALOR DA DEMANDA']) <= 0
    ).length;
    document.getElementById('demandas-sem-valor').textContent = demandasSemValor.toLocaleString('pt-BR');
}

function atualizarGraficos() {
    criarGraficoNimbi();
    criarGraficoStatusPedido();
    criarGraficoCorretivaPreventiva();  
    criarGraficoTopFiliais();
}

function criarGraficoNimbi() {
    const ctx = document.getElementById('nimbi-chart').getContext('2d');

    if (charts.nimbi) {
        charts.nimbi.destroy();
    }

    // Agrupar quantidades por status
    const statusCount = dadosFiltrados.reduce((acc, item) => {
        const status = item.NIMBI || 'NÃO INFORMADO';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    // Ordenar do maior para o menor
    const sorted = Object.entries(statusCount).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([status]) => status);
    const data = sorted.map(([_, count]) => count);
    const total = data.reduce((a, b) => a + b, 0);
    const porcentagens = data.map(v => ((v / total) * 100).toFixed(1));

    // 🎨 Cores das barras
    const colors = data.map(() => '#00ff51ff');

    charts.nimbi = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade',
                data: data,
                backgroundColor: colors,
                borderRadius: 0
            }]
        },
        options: {
            indexAxis: 'y', // ← barras horizontais
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        color: '#ffffff' // 🔹 cor branca para a legenda
                    }
                },
                tooltip: {
                    bodyColor: '#ffffff', // 🔹 texto branco no tooltip
                    titleColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const valor = context.parsed.x;
                            const perc = porcentagens[context.dataIndex];
                            return `${context.label}: ${valor} (${perc}%)`;
                        }
                    }
                },
                datalabels: {
                    color: '#ffffff', // 🔹 cor branca nos rótulos das barras
                    anchor: 'end',
                    align: 'right',
                    formatter: (value, context) => {
                        const perc = porcentagens[context.dataIndex];
                        return `${value} (${perc}%)`;
                    },
                    font: {
                        weight: 'bold'
                    }
                },
                title: {
                    display: false,
                    color: '#ffffff' // 🔹 se ativar, título será branco
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff' // 🔹 números brancos no eixo X
                    },
                    // title: {
                    //     display: true,
                    //     text: 'Quantidade',
                    //     color: '#ffffff' // 🔹 título branco do eixo X
                    // },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff', // 🔹 nomes brancos no eixo Y
                        autoSkip: false
                    },
                    title: {
                        display: false,
                        color: '#ffffff'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}



function criarGraficoStatusPedido() {
  const ctx = document.getElementById('status-pedido-chart').getContext('2d');
  
  if (charts.statusPedido) {
    charts.statusPedido.destroy();
  }

  // Contagem dos status
  const statusCount = dadosFiltrados.reduce((acc, item) => {
    const status = item['STATUS PEDIDO'] || 'NÃO INFORMADO';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Ordena do maior para o menor
  const entries = Object.entries(statusCount).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(e => e[0]);
  const data = entries.map(e => e[1]);

  // Cores das barras
  const colors = labels.map(() => '#fffe00');

  // Criação do gráfico
  charts.statusPedido = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors
      }]
    },
    options: {
      indexAxis: 'y', // ← barras horizontais
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        // 🔹 Título
        title: {
          display: true,
          text: 'Distribuição por Status do Pedido',
          color: '#ffffff', // ← texto branco
          font: { size: 16, weight: 'bold' }
        },
        // 🔹 Tooltip personalizada
        tooltip: {
          bodyColor: '#ffffff', // ← texto branco no tooltip
          titleColor: '#ffffff',
          callbacks: {
            label: context => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((context.parsed.x / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed.x} (${pct}%)`;
            }
          }
        },
        // 🔹 Labels dentro das barras
        datalabels: {
          color: '#ffffff', // ← texto branco nas barras
          anchor: 'end',
          align: 'right',
          formatter: (value, ctx) => {
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const pct = ((value / total) * 100).toFixed(1);
            return `${value} (${pct}%)`;
          },
          font: {
            weight: 'bold'
          }
        },
        legend: { 
          display: false,
          labels: { color: '#ffffff' } // ← cor branca se legenda ativada
        }
      },
      scales: {
        x: {
          ticks: { color: '#ffffff' }, // ← eixo X branco
          title: { color: '#ffffff' },
          grid: { drawOnChartArea: false }
        },
        y: {
          ticks: { color: '#ffffff' }, // ← eixo Y branco
          title: { color: '#ffffff' }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}



function criarGraficoCorretivaPreventiva() {
    const ctx = document.getElementById('corretiva-preventiva-chart').getContext('2d');

    if (charts.corretivaPreventiva) {
        charts.corretivaPreventiva.destroy();
    }

    const valores = dadosFiltrados.reduce((acc, item) => {
        const familia = String(item.FAMILIA || '').toUpperCase();
        const valor = converterValorBrasileiro(item['VALOR DA DEMANDA']);
        const numeroPedido = String(item['NUMERO  PEDIDO'] || '').trim();

        if (valor > 0 && numeroPedido !== '') {
            if (familia.includes('CORRETIVA')) {
                acc.corretiva += valor;
            } else if (familia.includes('PREVENTIVA')) {
                acc.preventiva += valor;
            }
        }

        return acc;
    }, { corretiva: 0, preventiva: 0 });

    const total = valores.corretiva + valores.preventiva;

    if (total === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Nenhum dado disponível', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const labels = ['Corretiva', 'Preventiva'];
    const data = [valores.corretiva, valores.preventiva];
    const colors = ['#ff00aeff', '#9d00ffff'];

    charts.corretivaPreventiva = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: '#333'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    bodyColor: '#ffffff',
                    titleColor: '#ffffff',
                    callbacks: {
                        label: function (context) {
                            const valor = context.parsed.y;
                            const percentage = ((valor / total) * 100).toFixed(1);
                            const valorFormatado = valor.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            });
                            return `${context.label}: ${valorFormatado} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    anchor: 'end',
                    align: 'start',
                    font: {
                        weight: 'bold',
                        size: 15
                    },
                    formatter: (value) => {
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { drawOnChartArea: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        callback: function (value) {
                            return value.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            });
                        }
                    },
                    grid: { drawOnChartArea: false }
                }
            }
        },
        plugins: [ChartDataLabels] // <-- Adicione o plugin aqui
    });
}



function criarGraficoTopFiliais() {
    const ctx = document.getElementById('top-filiais-chart').getContext('2d');
    
    if (charts.topFiliais) {
        charts.topFiliais.destroy();
    }
    
    // Agrupar demandas por filial e status NIMBI
    const filiaisData = {};
    
    dadosFiltrados.forEach(item => {
        const filial = `Filial ${item.FILIAL}`;
        const nimbi = String(item.NIMBI || 'NÃO INFORMADO').trim().toUpperCase();
        
        if (!filiaisData[filial]) {
            filiaisData[filial] = {
                total: 0,
                nimbiStatus: {}
            };
        }
        
        filiaisData[filial].total++;
        filiaisData[filial].nimbiStatus[nimbi] = (filiaisData[filial].nimbiStatus[nimbi] || 0) + 1;
    });
    
    // Ordenar filiais por total de demandas e pegar top 15
    const sortedFiliais = Object.entries(filiaisData)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 50);
    
    const labels = sortedFiliais.map(([filial]) => filial);
    // console.log(total);
    
    // Status NIMBI principais
    const statusNimbi = ['SIM', 'NÃO', 'COMPOSIÇÃO NIMBI', 'DEVOLVIDO', 'AGUARD.ORÇ', 'AGUARD.CAD. DE MATERIAIS', 'CANCELADO', 'AGUARD.VERBA', 'GARANTIA', 'REPOSIÇÃO', 'AGUARD.APRO', 'CONTRATOS', 'NÃO INFORMADO'];
    
    // Cores para cada status
    const coresNimbi = {
        'SIM': '#00ff51ff',
        'NÃO': '#ff1f1fff',
        'COMPOSIÇÃO NIMBI': '#ff00ddff',
        'DEVOLVIDO': '#fffe00',
        'AGUARD.ORÇ': '#00e1ffff',
        'AGUARD.CAD. DE MATERIAIS': '#fd7e14',
        'CANCELADO': '#ff0062ff',
        'AGUARD.VERBA': '#e83e8c',
        'GARANTIA': '#20c997',
        'REPOSIÇÃO': '#6610f2',
        'AGUARD.APRO': '#007bff',
        'CONTRATOS': '#6f42c1',
        'NÃO INFORMADO': '#ced4da'
    };
    
    // Criar datasets
    const datasets = statusNimbi.map(status => {
        const data = sortedFiliais.map(([filial, info]) => info.nimbiStatus[status] || 0);
        
        return {
            label: status === '' ? 'NÃO INFORMADO' : status,
            data: data,
            backgroundColor: coresNimbi[status] || '#6c757d',
            borderWidth: 0
        };
    }).filter(dataset => dataset.data.some(value => value > 0));
    
    charts.topFiliais = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#ffffff', // 🔹 legenda branca
                        boxWidth: 12,
                        padding: 8,
                        font: {
                            size: 10
                        }
                    }
                },
                tooltip: {
    bodyColor: '#ffffff',  // 🔹 texto branco no tooltip
    titleColor: '#ffffff',
    callbacks: {
        label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.x || 0;
            return `${label}: ${value} demanda${value !== 1 ? 's' : ''}`;
        },
        footer: function(tooltipItems) {
            // 🔹 Pega o índice da filial (posição no eixo Y)
            const index = tooltipItems[0].dataIndex;

            // 🔹 Soma o total de todos os status (todas as barras) dessa filial
            let total = 0;
            tooltipItems[0].chart.data.datasets.forEach(dataset => {
                total += dataset.data[index] || 0;
            });

            return `Total: ${total} demanda${total !== 1 ? 's' : ''}`;
        }
    }
}
,
                // title: {
                //     display: true,
                //     text: 'Status das Requisições por filial',
                //     color: '#ffffff', // 🔹 título branco
                //     font: { size: 16, weight: 'bold' }
                // }
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff' // 🔹 números brancos eixo X
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // 🔹 linhas de grade discretas
                    },
                    title: {
                        display: true,
                        text: 'Quantidade de Demandas',
                        color: '#ffffff' // 🔹 título branco eixo X
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: '#ffffff' // 🔹 nomes das filiais brancos
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: false,
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}


function atualizarTabelaFamilia() {
    const tableBody = document.getElementById('family-table-body');
    const tableFooter = document.getElementById('family-table-footer');
    tableBody.innerHTML = '';
    tableFooter.innerHTML = '';
    
    const familias = {};
    
    dadosFiltrados.forEach(item => {
        const familia = item.FAMILIA || 'NÃO INFORMADO';
        // console.log(familias);
        
        const valorDemanda = converterValorBrasileiro(item['VALOR DA DEMANDA']);
        const numeroPedido = item['NUMERO  PEDIDO'];
        const temPedido = numeroPedido && numeroPedido.toString().trim() !== '' && item['STATUS PEDIDO'] !== 'COMPOSIÇÃO' && item['STATUS PEDIDO'] !== 'SEM PEDIDO';
        
        if (!familias[familia]) {
            familias[familia] = {
                valorRealizado: 0, 
                valorPrevisto: 0,  
                demandasSemValor: 0
            };
        }
        
        if (temPedido && valorDemanda > 0) {
            familias[familia].valorRealizado += valorDemanda;
        }
        else if (!temPedido && valorDemanda > 0) {
            familias[familia].valorPrevisto += valorDemanda;
        }
        else if (valorDemanda === 0) {
            familias[familia].demandasSemValor++;
        }
    });
    
    let totalPlanejado = 0;
    let totalRealizado = 0;
    let totalPrevisto = 0;
    
    // Percorrer TODAS as contas (mesmo sem dados)
    todasAsContas.forEach(contaInfo => {
        const row = tableBody.insertRow();
        
        const contaLinha = contaInfo.conta;
        const numeroConta = contaInfo.numero;
        const familia = contaInfo.familia;
        
        // Calcular valor planejado para esta conta buscando diretamente no planejamentoContasRegional.json
        let valorPlanejadoTotal = 0;
        
        // Buscar o item correspondente no planejamentoContasRegional.json
        const itemPlanejamentoRegional = dadosPlanejamentoRegional.find(item => {
            const itemContaLinha = String(item["Conta/linha"] || "").trim();
            return itemContaLinha === contaLinha;
        });
        
        if (itemPlanejamentoRegional) {
            if (subregionalFilter.value === 'NORTE') {
                valorPlanejadoTotal = converterValorBrasileiro(itemPlanejamentoRegional["NORTE/FORT"]);
            } else if (subregionalFilter.value === 'VALE') {
                valorPlanejadoTotal = converterValorBrasileiro(itemPlanejamentoRegional["VALE/FORT"]);
            } else if (filialFilter.value) {
                // Calcular para filial específica
                valorPlanejadoTotal = calcularValorPlanejadoFilial(contaLinha, filialFilter.value);
            } else if (bandeiraFilter.value) {
                // Calcular para bandeira específica
                valorPlanejadoTotal = calcularValorPlanejadoBandeira(contaLinha, bandeiraFilter.value);
            } else {
                // Sem filtro: usar TOTAL GERAL
                valorPlanejadoTotal = converterValorBrasileiro(itemPlanejamentoRegional["TOTAL GERAL"]);
            }
        }
        
        // Buscar valores realizados e previstos (se existirem)
	        let demandasSemValor = 0;
        let valorRealizado = 0;
        let valorPrevisto = 0;
        if (familia && familias[familia]) {
            valorRealizado = familias[familia].valorRealizado || 0;
            valorPrevisto = familias[familia].valorPrevisto || 0;
	            demandasSemValor = familias[familia].demandasSemValor || 0;
        }
        
        const planejado = valorPlanejadoTotal;
        const totalRealizadoPrevisto = valorRealizado ;
        const deltaRS = planejado - totalRealizadoPrevisto;
        const deltaPerc = planejado > 0 ? ((deltaRS / planejado) * 100) : 0;
        
        totalPlanejado += planejado;
        totalRealizado += valorRealizado;
        totalPrevisto += valorPrevisto;
	        let totalDemandasSemValor = 0; // Variável para o total no footer
        
        // Célula Conta/Linha
        const cellContaLinha = row.insertCell();
        cellContaLinha.textContent = contaLinha;
        cellContaLinha.classList.add('conta-linha-cell');
        
        // Célula Número da Conta
        const cellNumeroConta = row.insertCell();
        cellNumeroConta.textContent = numeroConta;
        cellNumeroConta.classList.add('numero-conta-cell');
        
        // Célula Planejado
        const cellPlanejado = row.insertCell();
        cellPlanejado.textContent = `R$ ${planejado.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        cellPlanejado.classList.add('valor-cell');
        
        // Célula Realizado
        const cellRealizado = row.insertCell();
        cellRealizado.textContent = `R$ ${valorRealizado.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        cellRealizado.classList.add('valor-cell');
        
        // Célula Previsto
        const cellPrevisto = row.insertCell();
        cellPrevisto.textContent = `R$ ${valorPrevisto.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        cellPrevisto.classList.add('valor-cell');
        
        // Célula ΔR$ PxR
        const cellDeltaRS = row.insertCell();
        cellDeltaRS.textContent = `R$ ${deltaRS.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        cellDeltaRS.classList.add('valor-cell');
        if (deltaRS < 0) {
            cellDeltaRS.classList.add('negative-value');
        } else if (deltaRS > 0) {
            cellDeltaRS.classList.add('positive-value');
        }
        
        // Célula Δ% PxR
	        const cellDemandasSemValor = row.insertCell();
	        cellDemandasSemValor.textContent = demandasSemValor;
	        cellDemandasSemValor.classList.add('valor-cell');
	        
	        totalDemandasSemValor += demandasSemValor; // Adicionar ao total do footer
        const cellDeltaPerc = row.insertCell();
        cellDeltaPerc.textContent = `${deltaPerc.toFixed(0)}%`;
        cellDeltaPerc.classList.add('percent-cell');
        if (deltaPerc < 0) {
            cellDeltaPerc.classList.add('negative-value');
        } else if (deltaPerc > 0) {
            cellDeltaPerc.classList.add('positive-value');
        }
    });
    
    // Adicionar linha de TOTAL
    const totalRow = tableFooter.insertRow();
    totalRow.classList.add('total-row');
    
    const totalLabelCell = totalRow.insertCell();
    totalLabelCell.textContent = 'TOTAL';
    totalLabelCell.colSpan = 2;
    totalLabelCell.classList.add('total-label');
    
    const totalPlanejadoCell = totalRow.insertCell();
    totalPlanejadoCell.textContent = `R$ ${totalPlanejado.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    totalPlanejadoCell.classList.add('valor-cell', 'total-value');
    
    const totalRealizadoCell = totalRow.insertCell();
    totalRealizadoCell.textContent = `R$ ${totalRealizado.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    totalRealizadoCell.classList.add('valor-cell', 'total-value');
    
    const totalPrevistoCell = totalRow.insertCell();
    totalPrevistoCell.textContent = `R$ ${totalPrevisto.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    totalPrevistoCell.classList.add('valor-cell', 'total-value');
	    
	    
	    let totalDemandasSemValor = 0;
	    todasAsContas.forEach(contaInfo => {
	        const familia = contaInfo.familia;
	        if (familia && familias[familia]) {
	            totalDemandasSemValor += familias[familia].demandasSemValor || 0;
	        }
	    });
    
    const totalRealizadoPrevisto = totalRealizado + totalPrevisto;
    const totalDeltaRS = totalPlanejado - totalRealizadoPrevisto;
    const totalDeltaRSCell = totalRow.insertCell();
    totalDeltaRSCell.textContent = `R$ ${totalDeltaRS.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    totalDeltaRSCell.classList.add('valor-cell', 'total-value');
    if (totalDeltaRS < 0) {
        totalDeltaRSCell.classList.add('negative-value');
    } else if (totalDeltaRS > 0) {
        totalDeltaRSCell.classList.add('positive-value');
	        
	        // Célula Total Demandas Sem Valor
	    const totalDemandasSemValorCell = totalRow.insertCell();
	    totalDemandasSemValorCell.textContent = totalDemandasSemValor;
	    totalDemandasSemValorCell.classList.add('valor-cell', 'total-value', 'sem-valor');
    }
    
    const totalDeltaPerc = totalPlanejado > 0 ? ((totalDeltaRS / totalPlanejado) * 100) : 0;
    const totalDeltaPercCell = totalRow.insertCell();
    totalDeltaPercCell.textContent = `${totalDeltaPerc.toFixed(1)}%`;
    totalDeltaPercCell.classList.add('percent-cell', 'total-value');
    if (totalDeltaPerc < 0) {
        totalDeltaPercCell.classList.add('negative-value');
    } else if (totalDeltaPerc > 0) {
        totalDeltaPercCell.classList.add('positive-value');
    }
    
    // Calcular número de lojas para a média
    if (filialFilter.value) {
        totalLojas = 1;
    } else {
        const lojasRelevantes = obterLojasRelevantesParaFiltro();
        totalLojas = lojasRelevantes.length;
    }
    
    // Adicionar linha de MÉDIA POR LOJA
    if (totalLojas > 0) {
        const mediaRow = tableFooter.insertRow();
        mediaRow.classList.add('media-row');
        
        const mediaLabelCell = mediaRow.insertCell();
        mediaLabelCell.textContent = 'MÉDIA POR LOJA';
        mediaLabelCell.colSpan = 2;
        mediaLabelCell.classList.add('media-label');
        
        const mediaPlanejadoCell = mediaRow.insertCell();
        mediaPlanejadoCell.textContent = `R$ ${(totalPlanejado / totalLojas).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        mediaPlanejadoCell.classList.add('valor-cell', 'media-value');
        
        const mediaRealizadoCell = mediaRow.insertCell();
        mediaRealizadoCell.textContent = `R$ ${(totalRealizado / totalLojas).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        mediaRealizadoCell.classList.add('valor-cell', 'media-value');
        
        const mediaPrevistoCell = mediaRow.insertCell();
        mediaPrevistoCell.textContent = `R$ ${(totalPrevisto / totalLojas).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        mediaPrevistoCell.classList.add('valor-cell', 'media-value');
        
        const mediaDeltaRSCell = mediaRow.insertCell();
	        mediaDeltaRSCell.textContent = `R$ ${(totalDeltaRS / totalLojas).toLocaleString('pt-BR', {
	            minimumFractionDigits: 2,
	            maximumFractionDigits: 2
	        })}`;
	        mediaDeltaRSCell.classList.add('valor-cell', 'media-value');
	        
	        const mediaDemandasSemValorCell = mediaRow.insertCell();
	        mediaDemandasSemValorCell.textContent = (totalDemandasSemValor / totalLojas).toFixed(0);
	        mediaDemandasSemValorCell.classList.add('valor-cell', 'media-value');
	        
	        const mediaDeltaPercCell = mediaRow.insertCell();
	        mediaDeltaPercCell.textContent = totalDeltaPerc.toFixed(1) + '%';
	        mediaDeltaPercCell.classList.add('percent-cell', 'media-value');

    }
}

function obterLojasRelevantesParaFiltro() {
    const todasLojasUnicas = [...new Set(dadosPlanejamento.map(item => Number(item.Loja)))];
    
    const lojasRelevantes = todasLojasUnicas.filter(loja => {
        if (filialFilter.value) {
            return loja.toString() === filialFilter.value;
        }
        
        const infoLoja = obterInfoLoja(loja);
        
        if (subregionalFilter.value && infoLoja.subregional !== subregionalFilter.value) {
            return false;
        }
        
        if (bandeiraFilter.value && infoLoja.bandeira !== bandeiraFilter.value) {
            return false;
        }
        
        return true;
    });
    
    return [...new Set(lojasRelevantes.map(loja => Number(loja)))];
}

function obterInfoLoja(filial) {
    const info = dadosPlanejamento.find(item => Number(item.Loja) === Number(filial));
    return {
        subregional: info ? info.SUB : 'NÃO INFORMADO',
        bandeira: info ? info.BANDEIRA : 'NÃO INFORMADO'
    };
}

// NOVA FUNÇÃO: Calcular valor planejado para uma filial específica
function calcularValorPlanejadoFilial(contaLinha, filialSelecionada) {
    let valorTotal = 0;
    
    // Buscar no planejamento.json pela filial específica e conta/linha
    const planejamentoItens = dadosPlanejamento.filter(item => 
        Number(item.Loja) === Number(filialSelecionada) && 
        item['Conta/linha'] === contaLinha
    );
    
    planejamentoItens.forEach(item => {
        if (item.Nov) {
            valorTotal += converterValorBrasileiro(item.Nov);
        }
    });
    
    return valorTotal;
}

// NOVA FUNÇÃO: Calcular valor planejado para uma bandeira específica
function calcularValorPlanejadoBandeira(contaLinha, bandeiraFiltro) {
    let valorTotal = 0;
    
    // Buscar no planejamento.json apenas as lojas da bandeira selecionada
    const planejamentoItens = dadosPlanejamento.filter(item => 
        item.BANDEIRA === bandeiraFiltro && 
        item['Conta/linha'] === contaLinha
    );
    
    planejamentoItens.forEach(item => {
        if (item.Nov) {
            valorTotal += converterValorBrasileiro(item.Nov);
        }
    });
    
    return valorTotal;
}

// FUNÇÃO MODIFICADA: Calcular valor planejado regional (mantida para compatibilidade)
function calcularValorPlanejadoRegional(familiaBase, subregionalFilterValue) {
    const mapeamento = mapeamentoFamilias[familiaBase];
    if (!mapeamento || !mapeamento.contas) {
        return 0;
    }

    let valorTotal = 0;

    mapeamento.contas.forEach(contaLinha => {
        // Extrair o código numérico da conta para busca mais robusta
        const codigoContaMatch = contaLinha.match(/(\d{2}\.\d{2})/);
        const codigoConta = codigoContaMatch ? codigoContaMatch[1] : null;

        const itemPlanejamentoRegional = dadosPlanejamentoRegional.find(item => {
            const itemContaLinha = String(item["Conta/linha"] || "").trim();
            // Normalizar e buscar pelo código numérico
            const itemCodigoContaMatch = itemContaLinha.match(/(\d{2}\.\d{2})/);
            const itemCodigoConta = itemCodigoContaMatch ? itemCodigoContaMatch[1] : null;
            
            return codigoConta && itemCodigoConta && itemCodigoConta === codigoConta;
        });

        if (itemPlanejamentoRegional) {
            if (subregionalFilterValue === "NORTE") {
                valorTotal += converterValorBrasileiro(itemPlanejamentoRegional["NORTE/FORT"]);
            } else if (subregionalFilterValue === "VALE") {
                valorTotal += converterValorBrasileiro(itemPlanejamentoRegional["VALE/FORT"]);
            } else { // Sem filtro de subregional
                valorTotal += converterValorBrasileiro(itemPlanejamentoRegional["TOTAL GERAL"]);
            }
        }
    });
    return valorTotal;
}

function formatarDataBR(dataStr) {
    if (!dataStr || typeof dataStr !== "string") return "";

    // Se for DD/MM/YYYY → já retorna formatada
    if (dataStr.includes("/")) {
        const partes = dataStr.split("/");
        if (partes.length === 3) {
            const dia = partes[0].padStart(2, "0");
            const mes = partes[1].padStart(2, "0");
            const ano = partes[2];
            return `${dia}/${mes}/${ano}`;
        }
        return "";
    }

    // Se for ISO (YYYY-MM-DD)
    const date = new Date(dataStr);
    if (isNaN(date.getTime())) return "";

    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String((date.getMonth() + 1)).padStart(2, "0");
    const ano = date.getFullYear();

    return `${dia}/${mes}/${ano}`;
}


function converterDataBR(dataStr) {
    if (!dataStr || typeof dataStr !== "string") return null;

    const partes = dataStr.split("/"); 
    if (partes.length !== 3) return null;

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // JS usa meses de 0 a 11
    const ano = parseInt(partes[2], 10);

    const data = new Date(ano, mes, dia);

    // Verificação: se a data criada não bate com os valores, é invalida
    if (data.getFullYear() !== ano || data.getMonth() !== mes || data.getDate() !== dia) {
        return null;
    }

    return data;
}


function calcularDiasUteis(dataInicio, dataFim) {
    let dias = 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    while (inicio <= fim) {
        const diaSemana = inicio.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) {
            dias++;
        }
        inicio.setDate(inicio.getDate() + 1);
    }
    
    return dias;
}

function atualizarPlanilhaDemandasSemPedido() {
    const tableBody = document.getElementById('demandas-sem-pedido-body');
    tableBody.innerHTML = '';

    const demandasSemPedido = dadosFiltrados.filter(item => {
        const statusPedido = String(item['STATUS PEDIDO'] || '').trim().toUpperCase();
        const statusRC = String(item['NIMBI'] || '').trim().toUpperCase();
        const dataRC = item['ÚLTIMO ENVIO RC'];
        
        if (statusPedido === 'SEM PEDIDO' || statusPedido === 'DEVOLVIDO' || statusPedido === 'COMPOSIÇÃO' && dataRC && statusRC === 'SIM') {
            const dataRCDate = converterDataBR(dataRC);
            
            if (dataRCDate) {
                const hoje = new Date();
                const diasUteis = calcularDiasUteis(dataRCDate, hoje);
                return diasUteis > 5;
            }
        }
        return false;
    }).sort((a, b) => {
        const dataA = converterDataBR(a['ÚLTIMO ENVIO RC']);
        const dataB = converterDataBR(b['ÚLTIMO ENVIO RC']);
        return dataA - dataB;
    });
    
    demandasSemPedido.forEach(item => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = item.ENCARREGADO || '';
        row.insertCell().textContent = item.FILIAL || '';
        row.insertCell().textContent = item.SS || '';
        row.insertCell().textContent = item.RC || '';
        row.insertCell().textContent = item["DESCRIÇÃO DEMANDA"] || "";
        row.insertCell().textContent = formatarDataBR(item["PREVISÃO PEDIDO"]);
        
        const dataRCDate = converterDataBR(item['ÚLTIMO ENVIO RC']);
        const hoje = new Date();
        const diasUteis = dataRCDate ? calcularDiasUteis(dataRCDate, hoje) : 0;
        
        const diasCell = row.insertCell();
        diasCell.textContent = `${diasUteis} dias`;
        diasCell.classList.add("dias-sem-pedido");
        
        if (diasUteis > 7) {
            diasCell.classList.add("critico");
        } else if (diasUteis > 4) {
            diasCell.classList.add("alerta");
        }
    });

    if (demandasSemPedido.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.textContent = 'Nenhuma demanda sem pedido há mais de 4 dias úteis.';
        cell.style.textAlign = 'center';
    }
}

function validarLojasSubregional() {
    const lojasNorteFort = dadosPlanejamento.filter(item => item.SUB === 'NORTE' && item.BANDEIRA === 'FORT').map(item => item.Loja);
    const lojasValeFort = dadosPlanejamento.filter(item => item.SUB === 'VALE' && item.BANDEIRA === 'FORT').map(item => item.Loja);
}

document.querySelector(".table-btn[title=\"Atualizar\"]").addEventListener("click", function() {
    carregarDados(); // Ou atualizarDashboard();
});

document.querySelector(".table-btn[title=\"Exportar\"]").addEventListener("click", function() {
    // Lógica para exportar dados da tabela para CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = document.querySelectorAll("#demandas-sem-pedido-table tr");
    rows.forEach(function(row) {
        let rowData = [];
        row.querySelectorAll("th, td").forEach(function(cell) {
            rowData.push(cell.innerText);
        });
        csvContent += rowData.join(";") + "\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "demandas_sem_pedido.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
});
// Event listeners para a tabela de família
document.getElementById("refresh-family-table").addEventListener("click", function() {
    atualizarTabelaFamilia();
});

document.getElementById("export-family-table").addEventListener("click", function() {
    // Lógica para exportar dados da tabela de família para CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = document.querySelectorAll("#family-table tr");
    rows.forEach(function(row) {
        let rowData = [];
        row.querySelectorAll("th, td").forEach(function(cell) {
            rowData.push(cell.innerText);
        });
        csvContent += rowData.join(";") + "\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analise_familia.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
});

document.getElementById("export-demandas-sem-pedido-table").addEventListener("click", function() {
    // Lógica para exportar dados da tabela de demandas sem pedido
    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = document.querySelectorAll("#demandas-sem-pedido-table tr");
    rows.forEach(function(row) {
        let rowData = [];
        row.querySelectorAll("th, td").forEach(function(cell) {
            rowData.push(cell.innerText);
        });
        csvContent += rowData.join(";") + "\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Demandas sem pedido D+4.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
});