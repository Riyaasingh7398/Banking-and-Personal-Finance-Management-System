const BUDGET_KEY = "financeBudgets";
const TRANSACTION_KEY = "transactions";

const form = document.getElementById("budgetForm");
const budgetList = document.getElementById("budgetList");

const currentMonth = new Date().toISOString().slice(0, 7);
document.getElementById("budgetMonth").value = currentMonth;

function readData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveBudgets() {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
}

function money(value) {
    return Number(value).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });
}

let budgets = readData(BUDGET_KEY);

function getType(item) {
    return String(item.type || item.transactionType || "")
        .toLowerCase().trim();
}

function isExpense(item) {
    return ["expense", "debit", "payment", "withdrawal"]
        .includes(getType(item));
}

function getDate(item) {
    const date = new Date(item.date || item.createdAt || "");
    return Number.isNaN(date.getTime()) ? null : date;
}

function getSpent(category, month) {
    return readData(TRANSACTION_KEY)
        .filter(item => {
            const date = getDate(item);
            return isExpense(item) &&
                String(item.category || "Other").toLowerCase() ===
                    category.toLowerCase() &&
                date &&
                date.getFullYear() + "-" +
                    String(date.getMonth() + 1).padStart(2, "0") === month;
        })
        .reduce((sum, item) => {
            const amount = Number(item.amount || 0);
            return sum + (Number.isFinite(amount) ? Math.abs(amount) : 0);
        }, 0);
}

function renderBudgets() {
    budgetList.innerHTML = "";

    const month = document.getElementById("budgetMonth").value ||
        currentMonth;

    const monthBudgets = budgets.filter(item => item.month === month);

    const total = monthBudgets.reduce(
        (sum, item) => sum + Number(item.limit || 0), 0
    );

    const spent = monthBudgets.reduce(
        (sum, item) => sum + getSpent(item.category, item.month), 0
    );

    document.getElementById("totalBudget").textContent = money(total);
    document.getElementById("totalSpent").textContent = money(spent);
    document.getElementById("remainingBudget").textContent =
        money(total - spent);

    if (monthBudgets.length === 0) {
        budgetList.innerHTML =
            '<p class="empty">No budgets for this month. Add your first budget above.</p>';
        return;
    }

    monthBudgets.forEach(budget => {
        const categorySpent = getSpent(budget.category, budget.month);
        const limit = Number(budget.limit) || 0;
        const remaining = limit - categorySpent;
        const percentage = limit > 0
            ? categorySpent / limit * 100
            : 0;

        const item = document.createElement("div");
        item.className = "budget-item";

        const heading = document.createElement("div");
        heading.className = "budget-heading";

        const name = document.createElement("strong");
        name.textContent = budget.category;

        const amount = document.createElement("p");
        amount.textContent = money(categorySpent) + " spent of " +
            money(limit);

        heading.append(name, amount);

        const track = document.createElement("div");
        track.className = "progress-track";

        const fill = document.createElement("div");
        fill.className = "progress-fill";
        fill.style.width = Math.min(100, percentage) + "%";

        if (percentage >= 100) {
            fill.classList.add("danger");
        } else if (percentage >= 80) {
            fill.classList.add("warning");
        }

        track.appendChild(fill);

        const actions = document.createElement("div");
        actions.className = "budget-actions";

        const status = document.createElement("p");
        status.textContent = remaining < 0
            ? "Over budget by " + money(Math.abs(remaining))
            : money(remaining) + " remaining";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            if (!confirm("Delete this budget?")) return;

            budgets = budgets.filter(b => b.id !== budget.id);
            saveBudgets();
            renderBudgets();
        });

        actions.append(status, deleteButton);
        item.append(heading, track, actions);
        budgetList.appendChild(item);
    });
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const category = document.getElementById("category")
        .value.trim();
    const limit = Number(document.getElementById("limit").value);
    const month = document.getElementById("budgetMonth").value;

    if (!category || !Number.isFinite(limit) ||
        limit <= 0 || !month) {
        alert("Enter a valid category, budget limit and month.");
        return;
    }

    const existing = budgets.find(item =>
        item.category.toLowerCase() === category.toLowerCase() &&
        item.month === month
    );

    if (existing) {
        existing.limit = limit;
    } else {
        budgets.push({
            id: Date.now(),
            category,
            limit,
            month
        });
    }

    saveBudgets();
    renderBudgets();

    document.getElementById("category").value = "";
    document.getElementById("limit").value = "";
    alert("Budget saved successfully!");
});

document.getElementById("refreshBtn").addEventListener(
    "click", renderBudgets
);

document.getElementById("budgetMonth").addEventListener(
    "change", renderBudgets
);

window.addEventListener("storage", event => {
    if (event.key === BUDGET_KEY) {
        budgets = readData(BUDGET_KEY);
    }

    if (event.key === TRANSACTION_KEY) {
        renderBudgets();
    }
});

renderBudgets();