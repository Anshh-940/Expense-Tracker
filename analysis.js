// Fetch transaction data from the backend
fetch('http://localhost:5000/transactions')
    .then((response) => response.json())
    .then((data) => {
        // Prepare data for charts
        const categoryTotals = data.reduce((acc, transaction) => {
            const category = transaction.description; // Assuming 'description' contains category info
            const amount = parseFloat(transaction.amount.replace(/[^0-9.-]+/g, '')); // Extract numeric value from INR string
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {});

        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);

        // Render charts with fetched data
        renderCharts(categories, amounts);
    })
    .catch((error) => console.error('Error fetching transactions:', error));

// Function to render charts
const renderCharts = (categories, amounts) => {
    // Bar Chart
    const barChartCanvas = document.getElementById('bar-chart');
    new Chart(barChartCanvas, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Spending (INR)',
                data: amounts,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    // Pie Chart
    const pieChartCanvas = document.getElementById('pie-chart');
    new Chart(pieChartCanvas, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            }],
        },
        options: {
            responsive: true,
        },
    });
};
