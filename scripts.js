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
const dadosDemandas = 'https://opensheet.elk.sh/1aRdOpxR8xHT9nJ1mWHhVGeFOVRFJvgU8cQEdGw_A5Nc/Sc';

fetch("https://script.google.com/macros/s/AKfycbxRU31iZkSqq9FKHmsYez9ODX_TY97MEFX5elZaX4CkaKPVCvMXIEN21EXSm27z_XJ-Vw/exec")
  .then(res => res.json())
  .then(data => {
    // console.log("Dados recebidos:", data);

    // Exemplo:
    // console.log(data["LOJA 295"]);
  })
  .catch(err => console.error(err));


document.addEventListener('DOMContentLoaded', function () {
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarFilters = document.querySelector('.navbar-filters');
    const filterSelects = navbarFilters.querySelectorAll('select');

    navbarToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        navbarFilters.classList.toggle('active');
    });

    filterSelects.forEach(select => {
        select.addEventListener('change', () => {
            navbarFilters.classList.remove('active');
        });
    });

    document.addEventListener('click', function (event) {
        const clickedOutside =
            !navbarFilters.contains(event.target) &&
            !navbarToggle.contains(event.target);

        if (clickedOutside) {
            navbarFilters.classList.remove('active');
        }
    });
});


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
    
    if (valorString.replace('.', '').replace('-', '').replace(/\d/g, '') === '') {
        return parseFloat(valorString) || 0;
    }
    
    if (valorString.includes('R$') || valorString.includes(',')) {
        const valorLimpo = valorString
            .replace('R$', '')
            .replace(/\./g, '') 
            .replace(',', '.')
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

function aplicarMapeamentoSubregional() {
    const lojasNorte = [85, 165, 250, 305, 335, 385, 395, 405, 905];
    
    const lojasVale = [115, 135, 190, 195, 225, 255, 270, 295, 310, 325, 375, 420, 425, 480, 825];

    dadosPlanejamento.forEach(item => {
        const loja = Number(item.Loja);
        
        if (lojasNorte.includes(loja)) {
            item.SUB = 'NORTE';
        } else if (lojasVale.includes(loja)) {
            item.SUB = 'VALE';
         } 
        else {
            item.SUB = 'OUTROS'; 
        }
    });
}

function popularFiltros() {
    const filiaisUnicas = [...new Set(dadosPlanejamento.map(item => {
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
        const filialMatch = !filialFilter.value || item.LOJA.toString() === filialFilter.value;
        const encarregadoMatch = !encarregadoFilter.value || item.ENCARREGADO === encarregadoFilter.value;
        
        const infoLoja = obterInfoLoja(item.LOJA);
        const subregionalMatch = !subregionalFilter.value || infoLoja.subregional === subregionalFilter.value;
        
        const bandeiraMatch = !bandeiraFilter.value || infoLoja.bandeira === bandeiraFilter.value;
        
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
        item['STATUS PEDIDO'] === 'Aprovado - Aceito'
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

    const statusCount = dadosFiltrados.reduce((acc, item) => {
        const status = item.NIMBI || 'Não Informado';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const sorted = Object.entries(statusCount).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([status]) => status);
    const data = sorted.map(([_, count]) => count);
    const total = data.reduce((a, b) => a + b, 0);
    const porcentagens = data.map(v => ((v / total) * 100).toFixed(1));

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
            indexAxis: 'y', 
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        color: '#ffffff' 
                    }
                },
                tooltip: {
                    bodyColor: '#ffffff',
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
                    color: '#ffffff', 
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
                    color: '#ffffff'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff' 
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff', 
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

  const statusCount = dadosFiltrados.reduce((acc, item) => {
    const status = item['STATUS PEDIDO'] || 'Não Informado';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(statusCount).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(e => e[0]);
  const data = entries.map(e => e[1]);

  const colors = labels.map(() => '#fffe00');

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
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          bodyColor: '#ffffff', 
          titleColor: '#ffffff',
          callbacks: {
            label: context => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((context.parsed.x / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed.x} (${pct}%)`;
            }
          }
        },
        datalabels: {
          color: '#ffffff', 
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
          labels: { color: '#ffffff' } 
        }
      },
      scales: {
        x: {
          ticks: { color: '#ffffff' }, 
          title: { color: '#ffffff' },
          grid: { drawOnChartArea: false }
        },
        y: {
          ticks: { color: '#ffffff' }, 
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
        const statusPedido = String(item['STATUS PEDIDO']).toUpperCase();
        const valor = converterValorBrasileiro(item['VALOR DA DEMANDA']);
        const numeroPedido = String(item['NUMERO  PEDIDO'] || '').trim();        

        if (valor > 0 && numeroPedido !== '' || statusPedido == 'Em Aprovação' || statusPedido == 'Aprovado - Aceito' || statusPedido == 'Aprovado - Pendente de Aceite') {
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
        plugins: [ChartDataLabels] 
    });
}



function criarGraficoTopFiliais() {
    const ctx = document.getElementById('top-filiais-chart').getContext('2d');
    
    if (charts.topFiliais) {
        charts.topFiliais.destroy();
    }
    
    const filiaisData = {};
    
    dadosFiltrados.forEach(item => {
        const filial = `Loja ${item.LOJA}`;
        const nimbi = String(item.NIMBI || 'Não Informado').trim();
        
        if (!filiaisData[filial]) {
            filiaisData[filial] = {
                total: 0,
                nimbiStatus: {}
            };
        }
        
        filiaisData[filial].total++;
        filiaisData[filial].nimbiStatus[nimbi] = (filiaisData[filial].nimbiStatus[nimbi] || 0) + 1;
    });
    
    const sortedFiliais = Object.entries(filiaisData)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 50);
    
    const labels = sortedFiliais.map(([filial]) => filial);

    const statusNimbi = ['Aprovado', 'Não', 'Em composição', 'Devolvido', 'Aguard. Orçamento', 'Aguard. Cad. Materiais', 'Cancelado', 'Aguard. Verba', 'Garantia', 'Reposição', 'Em Aprovação', 'Contratos', 'Não Informado'];
    
    const coresNimbi = {
        'Aprovado': '#00ff51ff',
        'Devolvido': '#ff1f1fff',
        'Em Composição': '#ff00ddff',
        'Em Aprovação': '#fffe00',
        'Aguard. Orçamento': '#00e1ffff',
        'Aguard. Cad. Materiais': '#fd7e14',
        'Cancelado': '#ff0062ff',
        'Aguard. Verba': '#e83e8c',
        'Garantia': '#6900ae',
        'Reposição': '#6610f2',
        'Não': '#ffdba5',
        'Contratos': '#6f42c1',
        'Não Informado': '#ced4da'
    };
    
    const datasets = statusNimbi.map(status => {
        const data = sortedFiliais.map(([filial, info]) => info.nimbiStatus[status] || 0);
        
        return {
            label: status === '' ? 'Não Informado' : status,
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
                        color: '#ffffff', 
                        boxWidth: 12,
                        padding: 8,
                        font: {
                            size: 10
                        }
                    }
                },
                tooltip: {
    bodyColor: '#ffffff',  
    titleColor: '#ffffff',
    callbacks: {
        label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.x || 0;
            return `${label}: ${value} demanda${value !== 1 ? 's' : ''}`;
        },
        footer: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;

            let total = 0;
            tooltipItems[0].chart.data.datasets.forEach(dataset => {
                total += dataset.data[index] || 0;
            });

            return `Total: ${total} demanda${total !== 1 ? 's' : ''}`;
        }
    }
}
,
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff' 
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' 
                    },
                    title: {
                        display: true,
                        text: 'Quantidade de Demandas',
                        color: '#ffffff' 
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: '#ffffff' 
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
        
        const valorDemanda = converterValorBrasileiro(item['VALOR DA DEMANDA']);
        const numeroPedido = item['NUMERO  PEDIDO'];
        const temPedido = numeroPedido && numeroPedido.toString().trim() !== '' && item['STATUS PEDIDO'] !== 'Em composição' && item['STATUS PEDIDO'] !== 'Sem Pedido';
        
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
    
    todasAsContas.forEach(contaInfo => {
        const row = tableBody.insertRow();
        
        const contaLinha = contaInfo.conta;
        const numeroConta = contaInfo.numero;
        const familia = contaInfo.familia;
        
        let valorPlanejadoTotal = 0;
        
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
                valorPlanejadoTotal = calcularValorPlanejadoFilial(contaLinha, filialFilter.value);
            } else if (bandeiraFilter.value) {
                valorPlanejadoTotal = calcularValorPlanejadoBandeira(contaLinha, bandeiraFilter.value);
            } else {
                valorPlanejadoTotal = converterValorBrasileiro(itemPlanejamentoRegional["TOTAL GERAL"]);
            }
        }
        
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
	        let totalDemandasSemValor = 0; 
        
        const cellContaLinha = row.insertCell();
        cellContaLinha.textContent = contaLinha;
        // cellContaLinha.classList.add('conta-linha-cell');
        
        // Célula Número da Conta
        const cellNumeroConta = row.insertCell();
        cellNumeroConta.textContent = numeroConta;
        // cellNumeroConta.classList.add('numero-conta-cell');
        
        // Célula Planejado
        const cellPlanejado = row.insertCell();
        cellPlanejado.textContent = `R$ ${planejado.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        // cellPlanejado.classList.add('valor-cell');
        
        // Célula Realizado
        const cellRealizado = row.insertCell();
        cellRealizado.textContent = `R$ ${valorRealizado.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        // cellRealizado.classList.add('valor-cell');
        
        // Célula Previsto
        const cellPrevisto = row.insertCell();
        cellPrevisto.textContent = `R$ ${valorPrevisto.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        // cellPrevisto.classList.add('valor-cell');
        
        // Célula ΔR$ PxR
        const cellDeltaRS = row.insertCell();
        cellDeltaRS.textContent = `R$ ${deltaRS.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        // cellDeltaRS.classList.add('valor-cell');
        if (deltaRS < 0) {
            cellDeltaRS.classList.add('negative-value');
        } else if (deltaRS > 0) {
            cellDeltaRS.classList.add('positive-value');
        }
        
        // Célula Δ% PxR
	        const cellDemandasSemValor = row.insertCell();
	        cellDemandasSemValor.textContent = demandasSemValor;
	        cellDemandasSemValor.classList.add('valor-cell');
	        
	        totalDemandasSemValor += demandasSemValor; 
        const cellDeltaPerc = row.insertCell();
        cellDeltaPerc.textContent = `${deltaPerc.toFixed(0)}%`;
        cellDeltaPerc.classList.add('percent-cell');
        if (deltaPerc < 0) {
            cellDeltaPerc.classList.add('negative-value');
        } else if (deltaPerc > 0) {
            cellDeltaPerc.classList.add('positive-value');
        }
    });
    
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
        subregional: info ? info.SUB : 'Não Informado',
        bandeira: info ? info.BANDEIRA : 'Não Informado'
    };
}

// Calcular valor planejado para uma filial específica
function calcularValorPlanejadoFilial(contaLinha, filialSelecionada) {
    let valorTotal = 0;
    
    // Buscar no planejamento.json pela filial específica e conta/linha
    const planejamentoItens = dadosPlanejamento.filter(item => 
        Number(item.Loja) === Number(filialSelecionada) && 
        item['Conta/linha'] === contaLinha
    );
    
    planejamentoItens.forEach(item => {
        if (item.Jan) {
            valorTotal += converterValorBrasileiro(item.Jan);
        }
    });
    
    return valorTotal;
}

// Calcular valor planejado para uma bandeira específica
function calcularValorPlanejadoBandeira(contaLinha, bandeiraFiltro) {
    let valorTotal = 0;
    
    // Buscar no planejamento.json apenas as lojas da bandeira selecionada
    const planejamentoItens = dadosPlanejamento.filter(item => 
        item.BANDEIRA === bandeiraFiltro && 
        item['Conta/linha'] === contaLinha
    );
    
    planejamentoItens.forEach(item => {
        if (item.Jan) {
            valorTotal += converterValorBrasileiro(item.Jan);
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
        const codigoContaMatch = contaLinha.match(/(\d{2}\.\d{2})/);
        const codigoConta = codigoContaMatch ? codigoContaMatch[1] : null;

        const itemPlanejamentoRegional = dadosPlanejamentoRegional.find(item => {
            const itemContaLinha = String(item["Conta/linha"] || "").trim();
            const itemCodigoContaMatch = itemContaLinha.match(/(\d{2}\.\d{2})/);
            const itemCodigoConta = itemCodigoContaMatch ? itemCodigoContaMatch[1] : null;
            
            return codigoConta && itemCodigoConta && itemCodigoConta === codigoConta;
        });

        if (itemPlanejamentoRegional) {
            if (subregionalFilterValue === "NORTE") {
                valorTotal += converterValorBrasileiro(itemPlanejamentoRegional["NORTE/FORT"]);
            } else if (subregionalFilterValue === "VALE") {
                valorTotal += converterValorBrasileiro(itemPlanejamentoRegional["VALE/FORT"]);
            } else { 
                valorTotal += converterValorBrasileiro(itemPlanejamentoRegional["TOTAL GERAL"]);
            }
        }
    });
    return valorTotal;
}

function formatarDataBR(dataStr) {
    if (!dataStr || typeof dataStr !== "string") return "";

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
    const mes = parseInt(partes[1], 10) - 1; 
    const ano = parseInt(partes[2], 10);

    const data = new Date(ano, mes, dia);

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

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const demandasFiltradas = dadosFiltrados.filter(item => {
        const statusPedido = String(item['STATUS PEDIDO'] || '').trim();
        const previsaoPedidoStr = item['PREVISÃO PEDIDO'];

        if (statusPedido !== 'Sem Pedido') return false;
        if (!previsaoPedidoStr) return false;

        const dataPrevisao = converterDataBR(previsaoPedidoStr);
        if (!dataPrevisao) return false;

        dataPrevisao.setHours(0, 0, 0, 0);

        // Hoje maior que a previsão = vencido
        return hoje > dataPrevisao;
    });

    demandasFiltradas.forEach(item => {
        const row = tableBody.insertRow();

        row.insertCell().textContent = item.ENCARREGADO || '';
        row.insertCell().textContent = item.LOJA || '';
        row.insertCell().textContent = item.SS || '';
        row.insertCell().textContent = item.OS || '';
        row.insertCell().textContent = item.RC || '';
        row.insertCell().textContent = item['DESCRIÇÃO DEMANDA'] || '';
        row.insertCell().textContent = formatarDataBR(item['PREVISÃO PEDIDO']);

        const dataPrevisao = converterDataBR(item['PREVISÃO PEDIDO']);
        const diasAtraso = calcularDiasUteis(dataPrevisao, hoje);

        const diasCell = row.insertCell();
        diasCell.textContent = `${diasAtraso} dias`;
        diasCell.classList.add('dias-sem-pedido');

        if (diasAtraso > 7) {
            diasCell.classList.add('critico');
        } else if (diasAtraso > 3) {
            diasCell.classList.add('alerta');
        }
    });

    if (demandasFiltradas.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 8;
        cell.textContent = 'Nenhuma demanda sem pedido com previsão vencida.';
        cell.style.textAlign = 'center';
    }
}



function validarLojasSubregional() {
    const lojasNorteFort = dadosPlanejamento.filter(item => item.SUB === 'NORTE' && item.BANDEIRA === 'FORT').map(item => item.Loja);
    const lojasValeFort = dadosPlanejamento.filter(item => item.SUB === 'VALE' && item.BANDEIRA === 'FORT').map(item => item.Loja);
}

document.querySelector(".table-btn[title=\"Atualizar\"]").addEventListener("click", function() {
    carregarDados(); 
});

document.querySelector(".table-btn[title=\"Exportar\"]").addEventListener("click", function() {
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
