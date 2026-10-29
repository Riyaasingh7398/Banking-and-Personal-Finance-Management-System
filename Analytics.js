
const TRANSACTIONS_KEY = "transactions";
const GOALS_KEY = "financeGoals";

const formatMoney = amount =>
    Number(amount).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });

function readStorage(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

// Recognize the transaction types used across the project.
function getType(transaction) {
    return String(
        transaction.type ||
        transaction.transactionType ||
        transaction.transaction_type ||
        ""
    ).toLowerCase().trim();
}

function getAmount(transaction) {
    const amount = Number(
        transaction.amount ?? transaction.value ?? 0
    );

    return Number.isFinite(amount) ? Math.abs(amount) : 0;
}

function getDate(transaction) {
    const value = transaction.date || transaction.createdAt || "";
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function isIncome(transaction) {
    return ["income", "credit", "deposit"].includes(getType(transaction));
}

function isExpense(transaction) {
    return ["expense", "debit", "payment", "withdrawal"].includes(
        getType(transaction)
    );
}

function isSavings(transaction) {
    return ["savings", "saving"].includes(getType(transaction));
}

function getDescription(transaction) {
    return transaction.description ||
        transaction.category ||
        transaction.name ||
        "Transaction";
}

function renderAnalytics() {
    const transactions = readStorage(TRANSACTIONS_KEY);
    const goals = readStorage(GOALS_KEY);

    const incomeTransactions = transactions.filter(isIncome);
    const expenseTransactions = transactions.filter(isExpense);

    const totalIncome = incomeTransactions.reduce(
        (sum, item) => sum + getAmount(item), 0
    );

    const totalExpenses = expenseTransactions.reduce(
        (sum, item) => sum + getAmount(item), 0
    );

    const totalSaved = goals.reduce(
        (sum, goal) => sum + Math.max(0, Number(goal.saved) || 0), 0
    );

    document.getElementById("totalIncome").textContent =
        formatMoney(totalIncome);

    document.getElementById("totalExpenses").textContent =
        formatMoney(totalExpenses);

    document.getElementById("netBalance").textContent =
        formatMoney(totalIncome - totalExpenses);

    document.getElementById("goalSavings").textContent =
        formatMoney(totalSaved);

    renderMonthlyChart(transactions);
    renderExpenseBreakdown(expenseTransactions);
    renderGoalsAnalytics(goals);
    renderTransactions(transactions);
}

function renderMonthlyChart(transactions) {
    const chart = document.getElementById("monthlyChart");
    chart.innerHTML = "";

    const months = [];
    const now = new Date();

    // Current month and the previous five months.
    for (let i = 5; i >= 0; i--) {
        const date = new Date(
            now.getFullYear(), now.getMonth() - i, 1
        );

        months.push({
            year: date.getFullYear(),
            month: date.getMonth(),
            label: date.toLocaleDateString("en-IN", {
                month: "short"
            }),
            income: 0,
            expenses: 0
        });
    }

    transactions.forEach(transaction => {
        const date = getDate(transaction);
        if (!date) return;

        const month = months.find(item =>
            item.year === date.getFullYear() &&
            item.month === date.getMonth()
        );

        if (!month) return;

        if (isIncome(transaction)) {
            month.income += getAmount(transaction);
        } else if (isExpense(transaction)) {
            month.expenses += getAmount(transaction);
        }
    });

    const maxValue = Math.max(
        1,
        ...months.map(m => Math.max(m.income, m.expenses))
    );

    months.forEach(month => {
        const column = document.createElement("div");
        column.className = "month-column";

        const pair = document.createElement("div");
        pair.className = "bar-pair";

        const incomeBar = document.createElement("div");
        incomeBar.className = "bar income-bar";
        incomeBar.style.height =
            (month.income / maxValue * 100) + "%";
        incomeBar.title = "Income: " + formatMoney(month.income);

        const expenseBar = document.createElement("div");
        expenseBar.className = "bar expense-bar";
        expenseBar.style.height =
            (month.expenses / maxValue * 100) + "%";
        expenseBar.title = "Expenses: " + formatMoney(month.expenses);

        pair.append(incomeBar, expenseBar);

        const label = document.createElement("span");
        label.className = "month-label";
        label.textContent = month.label;

        column.append(pair, label);
        chart.appendChild(column);
    });
}

function renderExpenseBreakdown(expenses) {
    const container = document.getElementById("expenseBreakdown");
    container.innerHTML = "";

    const categories = {};

    expenses.forEach(transaction => {
        const category = transaction.category || "Other";
        categories[category] =
            (categories[category] || 0) + getAmount(transaction);
    });

    const entries = Object.entries(categories)
        .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        container.innerHTML =
            '<p class="empty">No expense data available yet.</p>';
        return;
    }

    const total = expenses.reduce(
        (sum, item) => sum + getAmount(item), 0
    );

    entries.forEach(([category, amount]) => {
        const percentage = total ? amount / total * 100 : 0;

        const item = document.createElement("div");
        item.className = "breakdown-item";

        const label = document.createElement("div");
        label.className = "breakdown-label";

        const name = document.createElement("span");
        name.textContent = category;

        const value = document.createElement("span");
        value.textContent = formatMoney(amount);

        label.append(name, value);

        const track = document.createElement("div");
        track.className = "progress-track";

        const fill = document.createElement("div");
        fill.className = "progress-fill";
        fill.style.width = percentage + "%";

        track.appendChild(fill);
        item.append(label, track);
        container.appendChild(item);
    });
}

function renderGoalsAnalytics(goals) {
    const container = document.getElementById("goalsAnalytics");
    container.innerHTML = "";

    if (goals.length === 0) {
        container.innerHTML =
            '<p class="empty">Create a goal to see your savings progress.</p>';
        return;
    }

    goals.forEach(goal => {
        const target = Math.max(0, Number(goal.target) || 0);
        const saved = Math.max(0, Number(goal.saved) || 0);
        const percentage = target > 0
            ? Math.min(100, saved / target * 100)
            : 0;

        const row = document.createElement("div");
        row.className = "goal-row";

        const info = document.createElement("div");
        info.className = "goal-info";

        const name = document.createElement("strong");
        name.textContent = goal.name || "Savings Goal";

        const amount = document.createElement("p");
        amount.textContent =
            formatMoney(saved) + " of " + formatMoney(target);

        info.append(name, amount);

        const track = document.createElement("div");
        track.className = "progress-track";

        const fill = document.createElement("div");
        fill.className = "progress-fill";
        fill.style.width = percentage + "%";

        track.appendChild(fill);

        const percentText = document.createElement("p");
        percentText.className = "empty";
        percentText.textContent = percentage.toFixed(1) + "% completed";

        row.append(info, track, percentText);
        container.appendChild(row);
    });
}

function renderTransactions(transactions) {
    const table = document.getElementById("transactionTable");
    table.innerHTML = "";

    const recent = [...transactions]
        .sort((a, b) => {
            const dateA = getDate(a);
            const dateB = getDate(b);

            return (dateB?.getTime() || 0) -
                (dateA?.getTime() || 0);
        })
        .slice(0, 10);

    if (recent.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No transactions available yet.";
        cell.className = "empty";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    recent.forEach(transaction => {
        const row = document.createElement("tr");
        const dateCell = document.createElement("td");
        const descriptionCell = document.createElement("td");
        const typeCell = document.createElement("td");
        const amountCell = document.createElement("td");

        const date = getDate(transaction);

        dateCell.textContent = date
            ? date.toLocaleDateString("en-IN")
            : "—";

        descriptionCell.textContent = getDescription(transaction);

        const type = getType(transaction);
        typeCell.textContent = type
            ? type.charAt(0).toUpperCase() + type.slice(1)
            : "Other";

        amountCell.textContent = formatMoney(getAmount(transaction));

        if (isIncome(transaction)) {
            amountCell.className = "income-text";
        } else if (isExpense(transaction)) {
            amountCell.className = "expense-text";
        }

        row.append(dateCell, descriptionCell, typeCell, amountCell);
        table.appendChild(row);
    });
}

document.getElementById("refreshBtn").addEventListener(
    "click", renderAnalytics
);

// Update when another page changes shared localStorage.
window.addEventListener("storage", event => {
    if ([TRANSACTIONS_KEY, GOALS_KEY].includes(event.key)) {
        renderAnalytics();
    }
});

renderAnalytics();
