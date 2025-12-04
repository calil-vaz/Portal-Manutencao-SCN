   // Variável global para armazenar os dados brutos
let rawData = [];
// Variável global para armazenar os dados filtrados
let filteredData = [];
// Variável global para armazenar a lista de filiais (Requisito 4)
let todasAsFiliais = [];

// Constante para a meta diária (Requisito 3)
const META_DIARIA = 5;

/** 

 @param {Array<Object>} data 
 */
function processData(data) {

    rawData = data;

    const filiaisSet = new Set(rawData.map(item => item.LOJA).filter(filial => filial && filial.trim() !== ''));
    todasAsFiliais = Array.from(filiaisSet).sort((a, b) => parseInt(a) - parseInt(b));
    
    // 3. Aplicar filtro inicial (Todas as filiais)
    applyFilters();
}

/**
 * Aplica os filtros selecionados e atualiza os dashboards.
 * @param {string} [filial=''] - O número da filial selecionada.
 */
function applyFilters(filial = '') {
    filteredData = rawData.filter(item => {
        const matchFilial = !filial || item.LOJA === filial;

        
        return matchFilial 
    });

    // Chamar a função que renderiza todos os dashboards
    renderDashboards();
}

/**
 * Função principal para renderizar todos os dashboards.
 */
function renderDashboards() {
    // Requisito 1: Gráfico de Rosca
    renderDonutChart(filteredData);

    // Requisito 2: Gráfico de Barras Empilhadas
    renderStackedBarChart(filteredData);

    // Requisito 4: Planilha Mensal
    renderMonthlyAverageTable(rawData, todasAsFiliais);

    // Requisito 5: Planilha de Metas
    renderGoalTable(filteredData);
    
    // Atualizar estatísticas gerais (se houver)
    updateGeneralStats(filteredData);
}

/**
 * Converte a string de data (ex: "07/11/2025 08:32:49") para um objeto Date.
 * @param {string} dateString - A string de data.
 * @returns {Date|null} O objeto Date ou null se a string for inválida.
 */
function parseDate(dateString) {
    if (!dateString) return null;
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    // Mês é 0-indexado no JavaScript (Janeiro = 0)
    // console.log(new Date(year, month - 1, day));
    
    return new Date(year, month - 1, day);
}



/**
 * Formata um número para string com duas casas decimais.
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado.
 */
function formatDecimal(value) {
    return value.toFixed(2).replace('.', ',');
}

// Variáveis para armazenar as instâncias dos gráficos
let donutChartInstance = null;
let stackedBarChartInstance = null;

// =================================================================================
// REQUISITO 1: GRÁFICO DE ROSCA (PENDENTE vs CONCLUÍDA)
// =================================================================================

/**
 * Renderiza o Gráfico de Rosca (Demandas Pendentes vs Concluídas).
 * @param {Array<Object>} data - Os dados a serem usados.
 */
function renderDonutChart(data) {
    const statusCounts = data.reduce((acc, item) => {
        const status = item.STATUS ? item.STATUS.toUpperCase() : 'OUTRO';
        if (status === 'PENDENTE') {
            acc.pendente++;
        } else if (status === 'CONCLUIDA') {
            acc.concluida++;
        }
        return acc;
    }, { pendente: 0, concluida: 0 });

    const total = statusCounts.pendente + statusCounts.concluida;
    const percentPendente = total > 0 ? (statusCounts.pendente / total) * 100 : 0;
    const percentConcluida = total > 0 ? (statusCounts.concluida / total) * 100 : 0;

    const chartData = {
        labels: ['Demandas sem S.S. / O.S.', 'Demandas com S.S. / O.S.'],
        datasets: [{
            data: [statusCounts.pendente, statusCounts.concluida],
            backgroundColor: ['#bb1d2dff', '#28a745'], // Vermelho para Pendente, Verde para Concluída
            hoverBackgroundColor: ['#c82333', '#218838'],
            borderWidth: 1
        }]
    };

    const ctx = document.getElementById('donut-chart').getContext('2d');

    if (donutChartInstance) {
        donutChartInstance.data = chartData;
        donutChartInstance.update();
    } else {
        donutChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white' // Cor da legenda
                        }
                    },
                    title: {
                        display: true,
                        // text: 'Status das Demandas (Pendente vs Concluída)',
                        color: 'white' // Cor do título
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    const value = context.parsed;
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                                    label += `${value} (${percentage}%)`;
                                }
                                return label;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value, context) => {
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return percentage > 0 ? percentage + '%' : '';
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
}

// =================================================================================
// REQUISITO 2: GRÁFICO DE BARRAS EMPILHADAS POR FILIAL
// =================================================================================

/**
 * Renderiza o Gráfico de Barras Empilhadas por Filial.
 * @param {Array<Object>} data - Os dados a serem usados.
 */
function renderStackedBarChart(data) {
    // 1. Agrupar e contar por filial e status
    const filialStats = data.reduce((acc, item) => {
        const filial = item.LOJA;
        const status = item.STATUS ? item.STATUS.toUpperCase() : 'OUTRO';

        if (!filial || filial.trim() === '') return acc;

        if (!acc[filial]) {
            acc[filial] = { concluida: 0, pendente: 0, total: 0 };
        }

        if (status === 'CONCLUIDA') {
            acc[filial].concluida++;
        } else if (status === 'PENDENTE') {
            acc[filial].pendente++;
        }
        acc[filial].total++;

        return acc;
    }, {});

    // 2. Preparar dados para o Chart.js
    const filiais = Object.keys(filialStats).sort((a, b) => parseInt(a) - parseInt(b));
    const concluidas = filiais.map(filial => filialStats[filial].concluida);
    const pendentes = filiais.map(filial => filialStats[filial].pendente);

    const chartData = {
        labels: filiais,
        datasets: [
            {
                label: 'Com S.S. / O.S.',
                data: concluidas,
                backgroundColor: '#28a745', // Verde
                stack: 'Stack 0'
            },
            {
                label: 'Sem S.S. / O.S.',
                data: pendentes,
                backgroundColor: '#dc3545', // Vermelho
                stack: 'Stack 0'
            }
        ]
    };

    const ctx = document.getElementById('stacked-bar-chart').getContext('2d');

    if (stackedBarChartInstance) {
        stackedBarChartInstance.data = chartData;
        stackedBarChartInstance.update();
    } else {
        stackedBarChartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'white'
                        }
                    },
                    title: {
                        display: true,
                        // text: 'Demandas por Filial (Concluídas vs Pendentes)',
                        color: 'white'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            footer: (tooltipItems) => {
                                let total = 0;
                                tooltipItems.forEach(function(tooltipItem) {
                                    total += tooltipItem.parsed.y;
                                });
                                return 'Total: ' + total;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value, context) => {
                            // Exibe o valor da barra
                            return value > 0 ? value : '';
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Filial',
                            color: 'white'
                        },
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Total de Demandas',
                            color: 'white'
                        },
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
}

// =================================================================================
// REQUISITO 4: PLANILHA MENSAL DE MÉDIAS
// =================================================================================

/**
 * Renderiza a Planilha Mensal de Médias Diárias por Filial.
 * @param {Array<Object>} data - Os dados brutos a serem usados.
 * @param {Array<string>} filiais - A lista de todas as filiais.
 */
 
function renderMonthlyAverageTable(data, filiais) {
    const monthlyStats = {}; // { 'Filial': { 'Novembro': { totalDemandas: 0, totalDias: 0 }, ... } }

    // 1. Agrupar demandas por Filial, Mês e Dia
    data.forEach(item => {
        const filial = item.LOJA;
        const date = parseDate(item.DATA_SOLICITACAO);

        if (!filial || filial.trim() === '' || !date) return;

        const monthName = date.toLocaleString('pt-BR', { month: 'long' });
        const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        if (!monthlyStats[filial]) {
            monthlyStats[filial] = {};
        }

        if (!monthlyStats[filial][monthName]) {
            monthlyStats[filial][monthName] = { totalDemandas: 0, diasComDemanda: new Set() };
        }

        monthlyStats[filial][monthName].totalDemandas++;
        monthlyStats[filial][monthName].diasComDemanda.add(dayKey);
    });

    // 2. Calcular a média diária por mês
    const monthlyAverages = {};
    const allMonths = new Set();

    for (const filial in monthlyStats) {
        monthlyAverages[filial] = {};
        for (const monthName in monthlyStats[filial]) {
            allMonths.add(monthName);
            const stats = monthlyStats[filial][monthName];
            const totalDemandas = stats.totalDemandas;
            const totalDias = stats.diasComDemanda.size;
            const average = totalDias > 0 ? totalDemandas / totalDias : 0;
            monthlyAverages[filial][monthName] = formatDecimal(average);
        }
    }

    // 3. Construir a tabela HTML
    const sortedMonths = Array.from(allMonths).sort((a, b) => {
        const monthOrder = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        return monthOrder.indexOf(a.toLowerCase()) - monthOrder.indexOf(b.toLowerCase());
    });

    let tableHTML = `
        <div class="table-container">
            <div class="table-header">
                <div class="table-info">
                    <i class="fas fa-calendar-alt"></i>
                    <p>Média Diária de Demandas por Mês e Filial</p>
                </div>
            </div>
            <div class="table-wrapper">
                <table class="modern-table" id="monthly-average-table">
                    <thead>
                        <tr>
                            <th><i class="fas fa-store"></i> Loja</th>
                            ${sortedMonths.map(month => `<th>${month.charAt(0).toUpperCase() + month.slice(1)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
    `;

    filiais.forEach(filial => {
        tableHTML += `<tr><td>${filial}</td>`;
        sortedMonths.forEach(month => {
            const average = monthlyAverages[filial] ? monthlyAverages[filial][month] || '0,00' : '0,00';
            tableHTML += `<td>${average}</td>`;
        });
        tableHTML += `</tr>`;
    });

    tableHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 4. Inserir no HTML (Assumindo que existe um div com id="monthly-average-table-container")
    const container = document.getElementById('monthly-average-table-container');
    if (container) {
        container.innerHTML = tableHTML;
    } else {
        console.error('Elemento #monthly-average-table-container não encontrado.');
    }
}

// =================================================================================
// REQUISITO 5: PLANILHA DE METAS DA FILIAL (SOMENTE DIA ATUAL)
// =================================================================================

/**
 * Renderiza a Planilha de Metas Diárias por Filial.
 * @param {Array<Object>} data - Os dados filtrados a serem usados.
 */
function renderGoalTable(data) {
    const today = new Date();
    // Normalizar a data de hoje para comparação (apenas dia, mês, ano)
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    // 1. Filtrar demandas do dia atual
    const todayData = data.filter(item => {
        const date = parseDate(item.DATA_SOLICITACAO);
        if (!date) return false;
        const itemKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        return itemKey === todayKey;
    });

    // 2. Contar demandas por filial para o dia atual
    const filialCounts = todayData.reduce((acc, item) => {
        const filial = item.LOJA;
        if (!filial || filial.trim() === '') return acc;

        acc[filial] = (acc[filial] || 0) + 1;
        return acc;
    }, {});

    // 3. Preparar dados da tabela
    const tableData = Object.keys(filialCounts).sort((a, b) => parseInt(a) - parseInt(b)).map(filial => {
        const count = filialCounts[filial];
        const metaAtingida = count >= META_DIARIA;
        const metaStatus = metaAtingida ? 'Atingida' : 'Não Atingida';
        const statusClass = metaAtingida ? 'meta-atingida' : 'meta-nao-atingida';

        return {
            loja: filial,
            quantidade: count,
            meta: metaStatus,
            statusClass: statusClass
        };
    });

    // 4. Construir a tabela HTML
    let tableHTML = `
        <div class="table-container">
            <div class="table-header">
                <div class="table-info">
                    <i class="fas fa-bullseye"></i>
                    <p>Metas Diárias por Filial (Dia Atual: ${today.toLocaleDateString('pt-BR')})</p>
                </div>
                <div class="table-actions">
                    <select id="goal-filter" class="filter-select">
                        <option value="all">Todas</option>
                        <option value="met">Filiais com meta atingida</option>
                        <option value="not-met">Filiais com meta não atingida</option>
                    </select>
                </div>
            </div>
            <div class="table-wrapper">
                <table class="modern-table" id="goal-table">
                    <thead>
                        <tr>
                            <th style="text-align: center;"><i class="fas fa-store"></i> Loja</th>
                            <th style="text-align: center;"><i class="fas fa-clipboard-list"></i> Quantidade de Tarefas</th>
                            <th style="text-align: center;"><i class="fas fa-trophy"></i> Meta (>= ${META_DIARIA})</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    tableData.forEach(item => {
        tableHTML += `
            <tr class="${item.statusClass}">
                <td style: style="text-align: center;">${item.loja}</td>
                <td style: style="text-align: center;">${item.quantidade}</td>
                <td style: style="text-align: center;" class="${item.statusClass}">${item.meta}</td>
            </tr>
        `;
    });

    tableHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 5. Inserir no HTML (Assumindo que existe um div com id="goal-table-container")
    const container = document.getElementById('goal-table-container');
    if (container) {
        container.innerHTML = tableHTML;
        
        // Adicionar lógica de filtro
        document.getElementById('goal-filter').addEventListener('change', (event) => {
            const filterValue = event.target.value;
            const rows = document.querySelectorAll('#goal-table tbody tr');
            rows.forEach(row => {
                const isMet = row.classList.contains('meta-atingida');
                if (filterValue === 'all') {
                    row.style.display = '';
                } else if (filterValue === 'met' && isMet) {
                    row.style.display = '';
                } else if (filterValue === 'not-met' && !isMet) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    } else {
        console.error('Elemento #goal-table-container não encontrado.');
    }
}

// =================================================================================
// FUNÇÕES AUXILIARES (Estatísticas Gerais)
// =================================================================================

/**
 * Atualiza as estatísticas gerais (se houver elementos no HTML).
 * @param {Array<Object>} data - Os dados filtrados.
*/
// console.log(data);
function updateGeneralStats(data) {
    const totalDemandas = data.length;
    console.log(data[0].STATUS);
    
    let dados = data
    let totalDemandasConluidas = 0;
    dados.forEach(element => {
        if (element.STATUS == 'CONCLUIDA') {
            console.log(element.STATUS);
            totalDemandasConluidas ++           
        }       
    });    
    
    let totalDemandasPendentes = 0;
    dados.forEach(element => {
        if (element.STATUS == 'PENDENTE') {
            console.log(element.STATUS);
            totalDemandasPendentes ++           
        }       
    });    
    
    // Assumindo que os IDs dos elementos de estatísticas gerais são 'total-demandas', 'demandas-com-pedido', 'demandas-sem-valor'
    const totalDemandasEl = document.getElementById('total-demandas');
    if (totalDemandasEl) {
        totalDemandasEl.textContent = totalDemandas;
    }

    const totalDemandasConcluidasEl = document.getElementById('demandas-com-OS-SS');
    if (totalDemandasConcluidasEl) {
        totalDemandasConcluidasEl.textContent = totalDemandasConluidas;
    }

    const totalDemandasPendentesEl = document.getElementById('total-demandas-pendentes');
    if (totalDemandasPendentesEl) {
        totalDemandasPendentesEl.textContent = totalDemandasPendentes;
    }
    
    // Adicione lógica para outras estatísticas gerais se necessário
    // Exemplo:
    // const demandasComPedido = data.filter(item => item.PEDIDO_ACEITO === 'SIM').length;
    // const demandasComPedidoEl = document.getElementById('demandas-com-pedido');
    // if (demandasComPedidoEl) {
    //     demandasComPedidoEl.textContent = demandasComPedido;
    // }
}

// =================================================================================
// LÓGICA DE FILTRO DA NAVBAR (Requisito Geral: Filtros de filiais precisam funcionar)
// =================================================================================

/**
 * Inicializa os event listeners para os filtros da navbar.
 */
function initializeFilterListeners() {
    const filialFilter = document.getElementById('filial-filter');
    const encarregadoFilter = document.getElementById('encarregado-filter');
    const subregionalFilter = document.getElementById('subregional-filter');
    const bandeiraFilter = document.getElementById('bandeira-filter');
    const clearFiltersButton = document.getElementById('clear-filters');

    const handleFilterChange = () => {
        const filial = filialFilter ? filialFilter.value : '';
        const encarregado = encarregadoFilter ? encarregadoFilter.value : '';
        const subregional = subregionalFilter ? subregionalFilter.value : '';
        const bandeira = bandeiraFilter ? bandeiraFilter.value : '';
        
        applyFilters(filial, encarregado, subregional, bandeira);
    };

    if (filialFilter) filialFilter.addEventListener('change', handleFilterChange);
    if (encarregadoFilter) encarregadoFilter.addEventListener('change', handleFilterChange);
    if (subregionalFilter) subregionalFilter.addEventListener('change', handleFilterChange);
    if (bandeiraFilter) bandeiraFilter.addEventListener('change', handleFilterChange);

    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', () => {
            if (filialFilter) filialFilter.value = '';
            if (encarregadoFilter) encarregadoFilter.value = '';
            if (subregionalFilter) subregionalFilter.value = '';
            if (bandeiraFilter) bandeiraFilter.value = '';
            
            applyFilters(); // Aplica filtros sem valores, ou seja, todos os dados
        });
    }
}

// Inicializa os listeners de filtro após o carregamento do DOM
document.addEventListener('DOMContentLoaded', initializeFilterListeners);