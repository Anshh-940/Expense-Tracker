const form = document.getElementById('expense-form');
const summaryContainer = document.getElementById('expense-summary');

// Handle form submission to add a new expense
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const description = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;

    // Validate inputs
    if (!description || !amount || !date || !category) {
        alert('Please fill out all fields.');
        return;
    }

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to add a transaction.');
        return;
    }

    // Send data to backend
    try {
        const response = await fetch('http://localhost:5000/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Include the token
            },
            body: JSON.stringify({ description, amount, category, date })
        });

        if (!response.ok) throw new Error('Failed to add transaction.');

        // Clear form and fetch updated transactions
        form.reset();
        fetchTransactions(); // Refetch transactions to update the summary
    } catch (error) {
        console.error('Error adding transaction:', error);
    }
});

// Fetch transactions from the backend and display them
const fetchTransactions = async () => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to view transactions.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/transactions', {
            headers: {
                'Authorization': `Bearer ${token}`  // Include the token
            }
        });

        if (!response.ok) throw new Error('Failed to fetch transactions.');

        const transactions = await response.json();

        // Clear the summary container before appending new content
        summaryContainer.innerHTML = '';

        // Check if there are transactions to display
        if (transactions.length === 0) {
            const noTransactionsMessage = document.createElement('div');
            noTransactionsMessage.textContent = 'No transactions found.';
            summaryContainer.appendChild(noTransactionsMessage);
        }

        // Display transactions
        transactions.forEach((transaction) => {
            const transactionElement = document.createElement('div');
            transactionElement.textContent = `${transaction.description} - ${transaction.amount} ${transaction.category}`;
            summaryContainer.appendChild(transactionElement);
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
};

// Fetch transactions on page load
fetchTransactions();
