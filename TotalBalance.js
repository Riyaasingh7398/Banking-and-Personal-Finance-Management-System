const transactionList = document.getElementById("transactionList");

// Format currency
function formatCurrency(amount) {

    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}

// Load saved transactions
function loadTransactions() {

    const transactions = JSON.parse(
        localStorage.getItem("fintrackTransactions")
    ) || [];

    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <p class="empty-message">
                No transactions available yet.
            </p>
        `;
        return;
    }

    // Show latest five transactions
    const recentTransactions = transactions.slice(-5).reverse();

    transactionList.innerHTML = "";

    recentTransactions.forEach(transaction => {

        const row = document.createElement("div");
        row.className = "transaction-row";

        const details = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = transaction.name;

        const date = document.createElement("p");
        date.textContent = transaction.date;

        details.append(name, date);

        const amount = document.createElement("strong");

        amount.textContent =
            (transaction.type === "Expense" ? "-" :
            transaction.type === "Income" ? "+" : "") +
            formatCurrency(transaction.amount);

        amount.className =
            transaction.type === "Expense"
                ? "transaction-expense"
                : "transaction-income";

        row.append(details, amount);

        transactionList.appendChild(row);

    });

}

// Run when page opens
loadTransactions();