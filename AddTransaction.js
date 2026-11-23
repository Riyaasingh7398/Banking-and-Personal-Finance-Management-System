const transactionForm = document.getElementById("transactionForm");

const dateInput = document.getElementById("date");

// Set today's date automatically
dateInput.value = new Date().toISOString().split("T")[0];

// Save Transaction
transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const transaction = {

        id: Date.now(),

        name: document.getElementById("transactionName").value.trim(),

        amount: Number(document.getElementById("amount").value),

        type: document.getElementById("type").value,

        category: document.getElementById("category").value,

        account: document.getElementById("account").value,

        date: document.getElementById("date").value,

        description: document.getElementById("description").value.trim(),

        status: "Completed"

    };

    // Validate amount
    if (!Number.isFinite(transaction.amount) ||
        transaction.amount <= 0) {

        alert("Please enter a valid amount.");
        return;
    }

    // Get existing transactions
    let transactions = JSON.parse(
        localStorage.getItem("fintrackTransactions")
    ) || [];

    // Add new transaction
    transactions.push(transaction);

    // Save transactions
    localStorage.setItem(
        "fintrackTransactions",
        JSON.stringify(transactions)
    );

    alert("Transaction added successfully!");

    // Redirect to Transactions page
    window.location.href = "Transactions.html";

});