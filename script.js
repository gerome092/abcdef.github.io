// Constantes
const HOURLY_RATE = 1.75;
const LUNCH_BREAK_HOURS = 1;
const LUNCH_BREAK_THRESHOLD = 8;

// Estado de la aplicación
let currentWeek = new Date();
let weeklyRecords = [];

// Elementos del DOM
const dateInput = document.getElementById('date');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const discountsInput = document.getElementById('discounts');
const extrasInput = document.getElementById('extras');
const incomeForm = document.getElementById('incomeForm');
const recordsTable = document.getElementById('recordsTable');
const currentWeekSpan = document.getElementById('currentWeek');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadWeekData();
    updateWeekDisplay();
    updateSummary();
    updateChart();
});

// Navegación entre semanas
prevWeekBtn.addEventListener('click', () => {
    currentWeek.setDate(currentWeek.getDate() - 7);
    loadWeekData();
});

nextWeekBtn.addEventListener('click', () => {
    currentWeek.setDate(currentWeek.getDate() + 7);
    loadWeekData();
});

// Manejo del formulario
incomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const record = {
        date: dateInput.value,
        startTime: startTimeInput.value,
        endTime: endTimeInput.value,
        discounts: parseFloat(discountsInput.value) || 0,
        extras: parseFloat(extrasInput.value) || 0
    };

    if (validateRecord(record)) {
        addRecord(record);
        incomeForm.reset();
        updateUI();
    }
});

// Funciones auxiliares
function validateRecord(record) {
    const start = new Date(`${record.date} ${record.startTime}`);
    const end = new Date(`${record.date} ${record.endTime}`);

    if (end <= start) {
        alert('La hora de salida debe ser posterior a la hora de entrada');
        return false;
    }

    const existingRecord = weeklyRecords.find(r => r.date === record.date);
    if (existingRecord) {
        alert('Ya existe un registro para esta fecha');
        return false;
    }

    return true;
}

function calculateEarnings(startTime, endTime) {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    let hours = (end - start) / (1000 * 60 * 60);

    if (hours > LUNCH_BREAK_THRESHOLD) {
        hours -= LUNCH_BREAK_HOURS;
    }

    return hours * HOURLY_RATE;
}

function addRecord(record) {
    const earnings = calculateEarnings(record.startTime, record.endTime);
    record.earnings = earnings;
    weeklyRecords.push(record);
    saveWeekData();
}

function updateUI() {
    displayRecords();
    updateSummary();
    updateChart();
}

function displayRecords() {
    const tbody = recordsTable.querySelector('tbody');
    tbody.innerHTML = '';

    weeklyRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    weeklyRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        const date = new Date(record.date);
        const dayName = date.toLocaleDateString('es', { weekday: 'short' });

        row.innerHTML = `
            <td>${date.toLocaleDateString()}</td>
            <td>${dayName}</td>
            <td>${record.startTime}</td>
            <td>${record.endTime}</td>
            <td>$${record.earnings.toFixed(2)}</td>
            <td>$${record.discounts.toFixed(2)}</td>
            <td>$${record.extras.toFixed(2)}</td>
            <td>
                <button onclick="deleteRecord(${index})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteRecord(index) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
        weeklyRecords.splice(index, 1);
        saveWeekData();
        updateUI();
    }
}

function updateSummary() {
    const totalEarned = weeklyRecords.reduce((sum, record) => sum + record.earnings, 0);
    const totalDiscounts = weeklyRecords.reduce((sum, record) => sum + record.discounts, 0);
    const totalExtras = weeklyRecords.reduce((sum, record) => sum + record.extras, 0);
    const finalAmount = totalEarned - totalDiscounts + totalExtras;

    document.getElementById('totalEarned').textContent = `$${totalEarned.toFixed(2)}`;
    document.getElementById('totalDiscounts').textContent = `$${totalDiscounts.toFixed(2)}`;
    document.getElementById('totalExtras').textContent = `$${totalExtras.toFixed(2)}`;
    document.getElementById('finalAmount').textContent = `$${finalAmount.toFixed(2)}`;
}

function updateChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    const dates = weeklyRecords.map(r => new Date(r.date).toLocaleDateString());
    const earnings = weeklyRecords.map(r => r.earnings);

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Ganancias Diarias',
                data: earnings,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `$${value.toFixed(2)}`
                    }
                }
            }
        }
    });
}

function getWeekKey() {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return startOfWeek.toISOString().split('T')[0];
}

function saveWeekData() {
    const weekKey = getWeekKey();
    localStorage.setItem(`week_${weekKey}`, JSON.stringify(weeklyRecords));
}

function loadWeekData() {
    const weekKey = getWeekKey();
    const data = localStorage.getItem(`week_${weekKey}`);
    weeklyRecords = data ? JSON.parse(data) : [];
    updateUI();
}

function updateWeekDisplay() {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    currentWeekSpan.textContent = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
}