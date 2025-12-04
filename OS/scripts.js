// Variáveis globais
let ordensData = [];
let filteredData = [];
let ordensSemDonoData = [];
let filteredSemDonoData = [];
let charts = {};

// Elementos DOM
const fileInput = document.getElementById('json-file-input');
const fileInfo = document.getElementById('file-info');
const loadingOverlay = document.getElementById('loading-overlay');

// Filtros
const filialFilter = document.getElementById('filial-filter');
const responsavelFilter = document.getElementById('responsavel-filter');
const tipoFilter = document.getElementById('tipo-filter');
const statusFilter = document.getElementById('status-filter');
const clearFiltersBtn = document.getElementById('clear-filters');

// Filtros OS sem dono
const tipoSemDonoFilter = document.getElementById('tipo-sem-dono-filter');
const statusSemDonoFilter = document.getElementById('status-sem-dono-filter');
const planejadaSemDonoFilter = document.getElementById('planejada-sem-dono-filter');

// Filtros tabela detalhes
const statusDetalhesFilter = document.getElementById('status-detalhes-filter');
const tipoDetalhesFilter = document.getElementById('tipo-detalhes-filter');
const planejadaDetalhesFilter = document.getElementById('planejada-detalhes-filter');
const responsavelDetalhesFilter = document.getElementById('responsavel-detalhes-filter');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Upload de arquivo
    fileInput.addEventListener('change', handleFileUpload);
    
    // Filtros
    filialFilter.addEventListener('change', applyFilters);
    responsavelFilter.addEventListener('change', applyFilters);
    tipoFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    // Filtros OS sem dono
    tipoSemDonoFilter.addEventListener('change', applySemDonoFilters);
    statusSemDonoFilter.addEventListener('change', applySemDonoFilters);
    planejadaSemDonoFilter.addEventListener('change', applySemDonoFilters);
    
    // Filtros tabela detalhes
    statusDetalhesFilter.addEventListener('change', applyDetalhesFilters);
    tipoDetalhesFilter.addEventListener('change', applyDetalhesFilters);
    planejadaDetalhesFilter.addEventListener('change', applyDetalhesFilters);
    responsavelDetalhesFilter.addEventListener('change', applyDetalhesFilters);
    
    // Botões de exportação
    document.getElementById('export-btn').addEventListener('click', exportTableData);
    document.getElementById('export-responsaveis-btn').addEventListener('click', exportResponsaveisData);
    document.getElementById('refresh-btn').addEventListener('click', refreshData);
    
    // Botões OS sem dono
    document.getElementById('export-sem-dono-btn').addEventListener('click', exportSemDonoData);
    document.getElementById('refresh-sem-dono-btn').addEventListener('click', refreshSemDonoData);
    
    // Toggle navbar mobile
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarFilters = document.querySelector('.navbar-filters');
    
    if (navbarToggle) {
        navbarToggle.addEventListener('click', function() {
            navbarFilters.classList.toggle('show');
        });
    }
}

// Função para lidar com upload de arquivo
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (file.type !== 'application/json') {
        alert('Por favor, selecione um arquivo JSON válido.');
        return;
    }
    
    showLoading();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            processData(jsonData);
            showFileInfo(file);
        } catch (error) {
            console.error('Erro ao processar arquivo JSON:', error);
            alert('Erro ao processar arquivo JSON. Verifique se o formato está correto.');
        } finally {
            hideLoading();
        }
    };
    
    reader.readAsText(file);
}

// Função para mostrar informações do arquivo
function showFileInfo(file) {
    fileInfo.innerHTML = `
        <i class="fas fa-check-circle" style="color: var(--success);"></i>
        <strong>${file.name}</strong> carregado com sucesso
        <br>
        <small>Tamanho: ${(file.size / 1024).toFixed(2)} KB | ${ordensData.length} ordens encontradas</small>
    `;
    fileInfo.classList.add('show');
}

// Função para processar os dados
function processData(data) {
    ordensData = data.map(ordem => ({
        ...ordem,
        // Extrair número da filial (apenas números antes do ponto)
        filialNumero: Math.floor(ordem.CodFil || 0),
        // Extrair nome do responsável do campo DESCMOBILE
        responsavel: extractResponsavelName(ordem.DESCMOBILE || ''),
        // Verificar se é planejada (campo Plano diferente de " - ")
        isPlanejada: ordem.Plano && ordem.Plano.trim() !== '-' && ordem.Plano.trim() !== '',
        // Processar data de abertura
        dataAbertura: new Date(ordem.datpro),
        // Processar data de fechamento
        dataFechamento: ordem.datfec ? new Date(ordem.datfec) : null,
        // Status formatado
        statusFormatted: ordem.StatOrd === 'A' ? 'Aberta' : 'Fechada'
    }));
    
    // Separar OS sem dono (DESCMOBILE null)
    ordensSemDonoData = ordensData.filter(ordem => ordem.DESCMOBILE === null);
    
    filteredData = [...ordensData];
    filteredSemDonoData = [...ordensSemDonoData];
    
    // Atualizar interface
    updateStatistics();
    updateFilters();
    updateSemDonoFilters();
    updateCharts();
    updateTable();
    updateTopResponsaveis();
    updateSemDonoTable();
}

// Função para extrair nome do responsável
function extractResponsavelName(descMobile) {
    // Formato esperado: "SC - Loja XXX - Nome do Responsável"
    const parts = descMobile.split(' - ');
    if (parts.length >= 3) {
        return parts[parts.length - 1].trim();
    }
    return descMobile.trim();
}

// Função para atualizar estatísticas
function updateStatistics() {
    const totalOrdens = filteredData.length;
    const ordensAbertas = filteredData.filter(ordem => ordem.StatOrd === 'A').length;
    const ordensFechadas = filteredData.filter(ordem => ordem.StatOrd === 'F').length;
    const ordensPlanejadas = filteredData.filter(ordem => ordem.isPlanejada).length;
    
    document.getElementById('total-ordens').textContent = totalOrdens;
    document.getElementById('ordens-abertas').textContent = ordensAbertas;
    document.getElementById('ordens-fechadas').textContent = ordensFechadas;
    document.getElementById('ordens-planejadas').textContent = ordensPlanejadas;
}

// Função para atualizar filtros
function updateFilters() {
    // Atualizar filtro de filiais
    const filiais = [...new Set(ordensData.map(ordem => ordem.filialNumero))].sort((a, b) => a - b);
    updateSelectOptions(filialFilter, filiais.map(f => ({ value: f, text: `Filial ${f}` })));
    
    // Atualizar filtro de responsáveis
    const responsaveis = [...new Set(ordensData.map(ordem => ordem.responsavel))].filter(r => r).sort();
    updateSelectOptions(responsavelFilter, responsaveis.map(r => ({ value: r, text: r })));
    
    // Atualizar filtro de tipos
    const tipos = [...new Set(ordensData.map(ordem => ordem.Tipo))].filter(t => t).sort();
    updateSelectOptions(tipoFilter, tipos.map(t => ({ value: t, text: t })));
    
    // Atualizar filtros da tabela de detalhes
    updateDetalhesFilters();
}

// Função para atualizar filtros da tabela de detalhes
function updateDetalhesFilters() {
    // Atualizar filtro de tipos para detalhes
    const tipos = [...new Set(ordensData.map(ordem => ordem.Tipo))].filter(t => t).sort();
    updateSelectOptions(tipoDetalhesFilter, tipos.map(t => ({ value: t, text: t })));
    
    // Atualizar filtro de responsáveis para detalhes
    const responsaveis = [...new Set(ordensData.map(ordem => ordem.responsavel))].filter(r => r).sort();
    updateSelectOptions(responsavelDetalhesFilter, responsaveis.map(r => ({ value: r, text: r })));
}

// Função auxiliar para atualizar opções de select
function updateSelectOptions(selectElement, options) {
    // Manter a primeira opção (Todos)
    const firstOption = selectElement.children[0];
    selectElement.innerHTML = '';
    selectElement.appendChild(firstOption);
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        selectElement.appendChild(optionElement);
    });
}

// Função para aplicar filtros
function applyFilters() {
    const filialValue = filialFilter.value;
    const responsavelValue = responsavelFilter.value;
    const tipoValue = tipoFilter.value;
    const statusValue = statusFilter.value;
    
    filteredData = ordensData.filter(ordem => {
        const matchFilial = !filialValue || ordem.filialNumero.toString() === filialValue;
        const matchResponsavel = !responsavelValue || ordem.responsavel === responsavelValue;
        const matchTipo = !tipoValue || ordem.Tipo === tipoValue;
        const matchStatus = !statusValue || ordem.StatOrd === statusValue;
        
        return matchFilial && matchResponsavel && matchTipo && matchStatus;
    });
    
    // Atualizar interface
    updateStatistics();
    updateCharts();
    updateTable();
    updateTopResponsaveis();
}

// Função para limpar filtros
function clearAllFilters() {
    filialFilter.value = '';
    responsavelFilter.value = '';
    tipoFilter.value = '';
    statusFilter.value = '';
    
    filteredData = [...ordensData];
    
    updateStatistics();
    updateCharts();
    updateTable();
    updateTopResponsaveis();
}

// Função para atualizar gráficos
function updateCharts() {
    updateStatusChart();
    updateTipoManutencaoChart();
    updateTopFiliaisChart();
    updateOrdensMesChart();
    updateEficienciaChart();
    // updateResponsaveisAbertasChart();
}

// Gráfico de Status das Ordens
function updateStatusChart() {
    const ctx = document.getElementById('status-chart').getContext('2d');
    
    // Corrigido: canceladas estava pegando 'F'
    const abertas = filteredData.filter(ordem => ordem.StatOrd === 'A').length;
    const fechadas = filteredData.filter(ordem => ordem.StatOrd === 'F').length;
    const canceladas = filteredData.filter(ordem => ordem.StatOrd === 'C').length;

    if (charts.statusChart) {
        charts.statusChart.destroy();
    }

    charts.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Abertas', 'Fechadas', 'Canceladas'],
            datasets: [{
                data: [abertas, fechadas, canceladas],
                backgroundColor: ['#f59e0b', '#0d8a60ff', '#d12127'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff', // 🔹 legenda branca
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    bodyColor: '#ffffff', // 🔹 texto branco
                    titleColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.parsed;
                            const pct = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${pct}%)`;
                        }
                    }
                },
                datalabels: {
                    color: '#ffffff', // 🔹 texto branco no meio
                    font: { weight: 'bold', size: 18 },
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const pct = ((value / total) * 100).toFixed(1);
                        return `${pct}%`;
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // 👈 precisa estar aqui
    });
}


// Gráfico de Tipos de Manutenção
function updateTipoManutencaoChart() {
    const ctx = document.getElementById('tipo-manutencao-chart').getContext('2d');

    const tipoCount = {};
    filteredData.forEach(ordem => {
        const tipo = ordem.Tipo || 'Não informado';
        tipoCount[tipo] = (tipoCount[tipo] || 0) + 1;
    });

    const labels = Object.keys(tipoCount);
    const data = Object.values(tipoCount);

    const colors = [
        '#830d9bff', '#0d8a60ff', '#f59e0b',
        '#ef4444', '#8b5cf6', '#06b6d4',
        '#14b8a6', '#e11d48', '#3b82f6'
    ];

    if (charts.tipoChart) {
        charts.tipoChart.destroy();
    }

    charts.tipoChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: "#ffffff",
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',  
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const pct = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${pct}%)`;
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    color: '#ffffff',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const pct = ((value / total) * 100).toFixed(1);
                        return `${pct}%`;
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}



// Gráfico TOP 10 Filiais
function updateTopFiliaisChart() {
    const ctx = document.getElementById('top-filiais-chart').getContext('2d');
    if (!ctx) return;

    // Contagem de ordens abertas por filial
    const filialCount = {};
    filteredData
        .filter(ordem => ordem.StatOrd === 'A')
        .forEach(ordem => {
            const filial = ordem.filialNumero 
                ? `Filial ${ordem.filialNumero}` 
                : 'Filial não informada';
            filialCount[filial] = (filialCount[filial] || 0) + 1;
        });

    // Ordena as filiais por número de ordens e pega as 10 com mais registros
    const sortedFiliais = Object.entries(filialCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const labels = sortedFiliais.map(([filial]) => filial);
    const data = sortedFiliais.map(([, count]) => count);

    // Total geral para cálculo de porcentagem
    const total = data.reduce((a, b) => a + b, 0);

    // Destroi o gráfico anterior
    if (charts.filiaisChart) charts.filiaisChart.destroy();

    // Criação do gráfico horizontal
    charts.filiaisChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ordens Abertas',
                data,
                backgroundColor: '#d12127',
                borderColor: '#b91c1c',
                borderWidth: 1.5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: '#ffffff', precision: 0 }, // 🔹 letras brancas eixo X
                    grid: { drawBorder: false, color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    ticks: { color: '#ffffff' }, // 🔹 letras brancas eixo Y
                    grid: { drawBorder: false, color: 'rgba(255,255,255,0.05)' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    bodyColor: '#ffffff',
                    titleColor: '#ffffff',
                    callbacks: {
                        label: context => `Total: ${context.parsed.x} (${((context.parsed.x / total) * 100).toFixed(1)}%)`
                    }
                },
                datalabels: {
                    color: '#ffffff', // 🔹 letras brancas
                    anchor: 'end',
                    align: 'left',
                    font: { weight: 'bold', size: 12 },
                    formatter: (value) => {
                        const perc = ((value / total) * 100).toFixed(1);
                        return `${value} (${perc}%)`;
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}




// Gráfico Ordens por Mês
function updateOrdensMesChart() {
    const ctx = document.getElementById('ordens-mes-chart').getContext('2d');
    if (!ctx) return;

    const mesCount = {};

    filteredData.forEach(ordem => {
        const mes = ordem.dataAbertura.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' });
        if (!mesCount[mes]) mesCount[mes] = { abertas: 0, fechadas: 0 };

        if (ordem.StatOrd === 'A') mesCount[mes].abertas++;
        else mesCount[mes].fechadas++;
    });

    const mesesOrdenados = Object.keys(mesCount).sort();
    const abertasData = mesesOrdenados.map(mes => mesCount[mes].abertas);
    const fechadasData = mesesOrdenados.map(mes => mesCount[mes].fechadas);

    if (charts.mesChart) charts.mesChart.destroy();

    charts.mesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: mesesOrdenados,
            datasets: [
                {
                    label: 'Abertas',
                    data: abertasData,
                    backgroundColor: '#f59e0b',
                    borderColor: '#d97706',
                    borderWidth: 1
                },
                {
                    label: 'Fechadas',
                    data: fechadasData,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ffffff', // 🔹 eixos brancos
                        precision: 0
                    },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    stacked: true,
                    ticks: { color: '#ffffff' }, // 🔹 eixos brancos
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#ffffff' } // 🔹 legenda branca
                },
                tooltip: {
                    bodyColor: '#ffffff',
                    titleColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.parsed.y;
                            const total = context.chart.data.datasets
                                .map(d => d.data[context.dataIndex])
                                .reduce((a,b) => a+b,0);
                            const pct = ((value / total) * 100).toFixed(1);
                            return `${datasetLabel}: ${value} (${pct}%)`;
                        }
                    }
                },
                datalabels: {
                    color: '#ffffff', // 🔹 texto branco
                    anchor: 'end',
                    align: 'bottom',
                    font: { weight: 'bold', size: 18 },
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets
                            .map(d => d.data[context.dataIndex])
                            .reduce((a, b) => a + b, 0);
                        const pct = ((value / total) * 100).toFixed(1);
                        return `${value} (${pct}%)`;
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // 🔹 exibe os valores e porcentagens
    });
}


// Gráfico de Eficiência Ordens Planejadas
function updateEficienciaChart() {
    const ctx = document.getElementById('eficiencia-chart').getContext('2d');
    let totalPlanejadas = document.getElementById("totalPlanejadas");

    const planejadas = filteredData.filter(ordem => ordem.isPlanejada);
    const planejadasFechadas = planejadas.filter(ordem => ordem.StatOrd === 'F').length;
    const planejadasAbertas = planejadas.filter(ordem => ordem.StatOrd === 'A').length;
    const planejadasCanceladas = planejadas.filter(ordem => ordem.StatOrd === 'C').length;

    const eficiencia = planejadas.length > 0 ? (planejadasFechadas / planejadas.length * 100) : 0;

    // Atualizar total de planejadas
    totalPlanejadas.textContent = `Total: ${planejadas.length} O.S. - Eficiência: ${eficiencia.toFixed(1)}% `;
    // document.getElementById('eficiencia-geral').textContent = `${eficiencia.toFixed(1)}%`;

    if (charts.eficienciaChart) charts.eficienciaChart.destroy();

    charts.eficienciaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ordens Planejadas'],
            datasets: [
                {
                    label: 'Abertas',
                    data: [planejadasAbertas],
                    backgroundColor: '#f59e0b',
                    borderColor: '#d97706',
                    borderWidth: 1
                },
                {
                    label: 'Fechadas',
                    data: [planejadasFechadas],
                    backgroundColor: '#0d8a60ff',
                    borderColor: '#0d8a60ff',
                    borderWidth: 1
                },
                {
                    label: 'Canceladas',
                    data: [planejadasCanceladas],
                    backgroundColor: '#d12127',
                    borderColor: '#d12127',
                    borderWidth: 1
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: { color: '#ffffff', stepSize: 1, precision: 0 },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    stacked: true,
                    ticks: { color: '#ffffff', stepSize: 1 },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                },
                tooltip: {
                    bodyColor: '#ffffff',
                    titleColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const datasets = context.chart.data.datasets;
                            const total = datasets.reduce((sum, ds) => sum + ds.data[context.dataIndex], 0);
                            const pct = ((value / total) * 100).toFixed(1);
                            return `${context.dataset.label}: ${value} (${pct}%)`;
                        }
                    }
                },
                datalabels: {
                    anchor: 'center',   // 🔹 centralizado na barra
                    align: 'center',
                    color: '#ffffff',   // 🔹 texto branco
                    font: { weight: 'bold', size: 18 },
                    formatter: (value, ctx) => {
                        const datasets = ctx.chart.data.datasets;
                        const total = datasets.reduce((sum, ds) => sum + ds.data[ctx.dataIndex], 0);
                        if (total > 0) {
                            const pct = ((value / total) * 100).toFixed(1);
                            return `${value} (${pct}%)`;
                        }
                        return value;
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


// Função para atualizar tabela principal
function updateTable() {
    // Inicializar dados filtrados da tabela de detalhes
    filteredDetalhesData = [...filteredData];
    updateTableWithFilteredData();
}

// Função para atualizar TOP 10 Responsáveis
function updateTopResponsaveis() {
    const tbody = document.getElementById('top-responsaveis-body');
    
    // Contar ordens abertas por responsável
    const responsavelCount = {};
    const ordensAbertas = filteredData.filter(ordem => ordem.StatOrd === 'A');
    
    ordensAbertas.forEach(ordem => {
        const responsavel = ordem.responsavel;
        if (responsavel) {
            responsavelCount[responsavel] = (responsavelCount[responsavel] || 0) + 1;
        }
    });
    
    // Ordenar e pegar TOP 10
    const sortedResponsaveis = Object.entries(responsavelCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    if (sortedResponsaveis.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum responsável encontrado com ordens abertas.</td></tr>';
        return;
    }
    
    const totalAbertas = ordensAbertas.length;
    
    const rows = sortedResponsaveis.map(([responsavel, count], index) => {
        const percentual = totalAbertas > 0 ? (count / totalAbertas * 100).toFixed(1) : 0;
        const medalIcon = `${index + 1}º`;
        
        return `
            <tr>
                <td style="text-align: center; font-size: 1.2em;">${medalIcon}</td>
                <td>${responsavel}</td>
                <td style="text-align: center; font-weight: 600;">${count}</td>
                <td style="text-align: center;">${percentual}%</td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
}

// Funções de exportação
function exportTableData() {
    if (filteredData.length === 0) {
        alert('Nenhum dado para exportar.');
        return;
    }
    
    const csvContent = generateCSV(filteredData, [
        { key: 'Tag', label: 'Tag' },
        { key: 'dataAbertura', label: 'Data Abertura', format: (date) => date.toLocaleDateString('pt-BR') },
        { key: 'statusFormatted', label: 'Status' },
        { key: 'filialNumero', label: 'Filial', format: (num) => `Filial ${num}` },
        { key: 'responsavel', label: 'Responsável' },
        { key: 'Tipo', label: 'Tipo' },
        { key: 'isPlanejada', label: 'Planejada', format: (bool) => bool ? 'Sim' : 'Não' }
    ]);
    
    downloadCSV(csvContent, 'ordens_servico.csv');
}

function exportResponsaveisData() {
    const responsavelCount = {};
    const ordensAbertas = filteredData.filter(ordem => ordem.StatOrd === 'A');
    
    ordensAbertas.forEach(ordem => {
        const responsavel = ordem.responsavel;
        if (responsavel) {
            responsavelCount[responsavel] = (responsavelCount[responsavel] || 0) + 1;
        }
    });
    
    const sortedResponsaveis = Object.entries(responsavelCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    if (sortedResponsaveis.length === 0) {
        alert('Nenhum dado para exportar.');
        return;
    }
    
    const totalAbertas = ordensAbertas.length;
    const exportData = sortedResponsaveis.map(([responsavel, count], index) => ({
        posicao: index + 1,
        responsavel: responsavel,
        ordens_abertas: count,
        percentual: totalAbertas > 0 ? (count / totalAbertas * 100).toFixed(1) + '%' : '0%'
    }));
    
    const csvContent = generateCSV(exportData, [
        { key: 'posicao', label: 'Posição' },
        { key: 'responsavel', label: 'Responsável' },
        { key: 'ordens_abertas', label: 'Ordens Abertas' },
        { key: 'percentual', label: '% do Total' }
    ]);
    
    downloadCSV(csvContent, 'top_responsaveis.csv');
}

// Função auxiliar para gerar CSV
function generateCSV(data, columns) {
    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(item => {
        return columns.map(col => {
            let value = item[col.key];
            if (col.format && typeof col.format === 'function') {
                value = col.format(value);
            }
            // Escapar aspas e adicionar aspas se necessário
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        }).join(',');
    }).join('\n');
    
    return headers + '\n' + rows;
}

// Função auxiliar para download de CSV
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Função para atualizar dados
function refreshData() {
    if (ordensData.length > 0) {
        applyFilters();
    }
}

// Funções de loading
function showLoading() {
    loadingOverlay.classList.add('show');
}

function hideLoading() {
    loadingOverlay.classList.remove('show');
}

// Função para atualizar filtros OS sem dono
function updateSemDonoFilters() {
    // Atualizar filtro de tipos para OS sem dono
    const tipos = [...new Set(ordensSemDonoData.map(ordem => ordem.Tipo))].filter(t => t).sort();
    updateSelectOptions(tipoSemDonoFilter, tipos.map(t => ({ value: t, text: t })));
}

// Função para aplicar filtros OS sem dono
function applySemDonoFilters() {
    const tipoValue = tipoSemDonoFilter.value;
    const statusValue = statusSemDonoFilter.value;
    const planejadaValue = planejadaSemDonoFilter.value;
    
    filteredSemDonoData = ordensSemDonoData.filter(ordem => {
        const matchTipo = !tipoValue || ordem.Tipo === tipoValue;
        const matchStatus = !statusValue || ordem.StatOrd === statusValue;
        
        let matchPlanejada = true;
        if (planejadaValue === 'sim') {
            matchPlanejada = ordem.isPlanejada;
        } else if (planejadaValue === 'nao') {
            matchPlanejada = !ordem.isPlanejada;
        }
        
        return matchTipo && matchStatus && matchPlanejada;
    });
    
    updateSemDonoTable();
}

// Função para atualizar tabela OS sem dono
function updateSemDonoTable() {
    const tbody = document.getElementById('ordens-sem-dono-table-body');
    
    if (filteredSemDonoData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhuma ordem sem responsável encontrada com os filtros aplicados.</td></tr>';
        return;
    }
    
    const rows = filteredSemDonoData.slice(0, 100).map(ordem => `
        <tr>
            <td>${ordem.Tag}</td>
            <td>${ordem.dataAbertura.toLocaleDateString('pt-BR')}</td>
            <td><span class="status-badge ${ordem.StatOrd === 'A' ? 'aberta' : 'fechada'}">${ordem.statusFormatted}</span></td>
            <td>Filial ${ordem.filialNumero}</td>
            <td>${ordem.Tipo || 'Não informado'}</td>
            <td><span class="planejada-badge ${ordem.isPlanejada ? 'sim' : 'nao'}">${ordem.isPlanejada ? 'Sim' : 'Não'}</span></td>
            <td>${ordem.Func || 'Não informado'}</td>
        </tr>
    `).join('');
    
    tbody.innerHTML = rows;
    
    if (filteredSemDonoData.length > 100) {
        tbody.innerHTML += `<tr><td colspan="7" style="text-align: center; font-style: italic;">Mostrando apenas os primeiros 100 registros de ${filteredSemDonoData.length} total.</td></tr>`;
    }
}

// Função para exportar dados OS sem dono
function exportSemDonoData() {
    if (filteredSemDonoData.length === 0) {
        alert('Nenhum dado para exportar.');
        return;
    }
    
    const csvContent = generateCSV(filteredSemDonoData, [
        { key: 'Tag', label: 'Tag' },
        { key: 'dataAbertura', label: 'Data Abertura', format: (date) => date.toLocaleDateString('pt-BR') },
        { key: 'statusFormatted', label: 'Status' },
        { key: 'filialNumero', label: 'Filial', format: (num) => `Filial ${num}` },
        { key: 'Tipo', label: 'Tipo' },
        { key: 'isPlanejada', label: 'Planejada', format: (bool) => bool ? 'Sim' : 'Não' },
        { key: 'Func', label: 'Funcionário' }
    ]);
    
    downloadCSV(csvContent, 'ordens_sem_responsavel.csv');
}

// Função para atualizar dados OS sem dono
function refreshSemDonoData() {
    if (ordensSemDonoData.length > 0) {
        applySemDonoFilters();
    }
}



// Variável para dados filtrados da tabela de detalhes
let filteredDetalhesData = [];

// Função para aplicar filtros da tabela de detalhes
function applyDetalhesFilters() {
    const statusValue = statusDetalhesFilter.value;
    const tipoValue = tipoDetalhesFilter.value;
    const planejadaValue = planejadaDetalhesFilter.value;
    const responsavelValue = responsavelDetalhesFilter.value;
    
    filteredDetalhesData = filteredData.filter(ordem => {
        const matchStatus = !statusValue || ordem.StatOrd === statusValue;
        const matchTipo = !tipoValue || ordem.Tipo === tipoValue;
        const matchResponsavel = !responsavelValue || ordem.responsavel === responsavelValue;
        
        let matchPlanejada = true;
        if (planejadaValue === 'sim') {
            matchPlanejada = ordem.isPlanejada;
        } else if (planejadaValue === 'nao') {
            matchPlanejada = !ordem.isPlanejada;
        }
        
        return matchStatus && matchTipo && matchResponsavel && matchPlanejada;
    });
    
    updateTableWithFilteredData();
}

// Função para atualizar tabela com dados filtrados
function updateTableWithFilteredData() {
    const tbody = document.getElementById('ordens-table-body');
    
    if (filteredDetalhesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhuma ordem encontrada com os filtros aplicados.</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredDetalhesData.map(ordem => `
        <tr>
            <td>${ordem.Tag}</td>
            <td>${ordem.dataAbertura.toLocaleDateString('pt-BR')}</td>
            <td>
                <span class="status-badge ${ordem.StatOrd === 'A' ? 'status-open' : 'status-closed'}">
                    ${ordem.statusFormatted}
                </span>
            </td>
            <td>Filial ${ordem.filialNumero}</td>
            <td>${ordem.responsavel || 'Não informado'}</td>
            <td>${ordem.Tipo || 'Não informado'}</td>
            <td>
                <span class="planejada-badge ${ordem.isPlanejada ? 'planejada-sim' : 'planejada-nao'}">
                    ${ordem.isPlanejada ? 'Sim' : 'Não'}
                </span>
            </td>
        </tr>
    `).join('');
}

/*
// Gráfico Responsáveis que não fecham OS
function updateResponsaveisAbertasChart() {
    const ctx = document.getElementById('responsaveis-abertas-chart').getContext('2d');
    
    // Contar ordens abertas por responsável
    const responsavelCount = {};
    const ordensAbertas = filteredData.filter(ordem => ordem.StatOrd === 'A');
    
    ordensAbertas.forEach(ordem => {
        const responsavel = ordem.responsavel;
        if (responsavel) {
            responsavelCount[responsavel] = (responsavelCount[responsavel] || 0) + 1;
        }
    });
    
    // Ordenar e pegar TOP 10
    const sortedResponsaveis = Object.entries(responsavelCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    const labels = sortedResponsaveis.map(([responsavel]) => responsavel);
    const data = sortedResponsaveis.map(([,count]) => count);
    
    if (charts.responsaveisAbertasChart) {
        charts.responsaveisAbertasChart.destroy();
    }
    
    charts.responsaveisAbertasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'OS Abertas',
                data: data,
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value,
                    color: '#4a5568',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    });
}
    */