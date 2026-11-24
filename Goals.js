const GOALS_KEY = "financeGoals";
const ACTIVITY_KEY = "goalActivity";
const TRANSACTIONS_KEY = "transactions";

let goals = JSON.parse(localStorage.getItem(GOALS_KEY)) || [];
let activities = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || [];

const goalForm = document.getElementById("goalForm");
const goalsList = document.getElementById("goalsList");
const goalActivity = document.getElementById("goalActivity");

function saveGoals() {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

function saveActivities() {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
}

function money(amount) {
    return Number(amount).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });
}

function updateSummary() {
    const target = goals.reduce(
        (sum, goal) => sum + goal.target, 0
    );

    const saved = goals.reduce(
        (sum, goal) => sum + goal.saved, 0
    );

    document.getElementById("totalTarget").textContent =
        money(target);

    document.getElementById("totalSaved").textContent =
        money(saved);

    document.getElementById("remainingAmount").textContent =
        money(Math.max(0, target - saved));
}

function renderGoals() {
    goalsList.innerHTML = "";

    if (goals.length === 0) {
        goalsList.innerHTML =
            '<p class="empty">No goals yet. Create your first savings goal!</p>';
        updateSummary();
        return;
    }

    goals.forEach(goal => {
        const percentage = goal.target > 0
            ? Math.min(100, (goal.saved / goal.target) * 100)
            : 0;

        const completed = goal.saved >= goal.target;

        const card = document.createElement("div");
        card.className = "goal-card";

        const title = document.createElement("h3");
        title.textContent = goal.name;

        const targetText = document.createElement("p");
        targetText.textContent = "Target: " + money(goal.target);

        const savedText = document.createElement("p");
        savedText.textContent = "Saved: " + money(goal.saved);

        const dateText = document.createElement("p");
        dateText.textContent = "Deadline: " + goal.date;

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";

        const progress = document.createElement("div");
        progress.className = "progress";
        progress.style.width = percentage + "%";

        progressBar.appendChild(progress);

        const percentageText = document.createElement("p");
        percentageText.textContent =
            completed ? "Goal completed! 🎉" :
            percentage.toFixed(1) + "% completed";

        const actions = document.createElement("div");
        actions.className = "goal-actions";

        const amountInput = document.createElement("input");
        amountInput.type = "number";
        amountInput.min = "0.01";
        amountInput.step = "0.01";
        amountInput.placeholder = "Add amount (₹)";
        amountInput.setAttribute("aria-label", "Amount to save");

        const addButton = document.createElement("button");
        addButton.textContent = "Add Savings";
        addButton.addEventListener("click", () => {
            const amount = Number(amountInput.value);

            if (!Number.isFinite(amount) || amount <= 0) {
                alert("Please enter a valid savings amount.");
                return;
            }

            if (completed) {
                alert("This goal is already completed.");
                return;
            }

            if (amount > goal.target - goal.saved) {
                alert("Enter an amount up to " +
                    money(goal.target - goal.saved) +
                    " to complete this goal.");
                return;
            }

            goal.saved += amount;
            saveGoals();

            // Record the contribution as a transaction.
            const transactions =
                JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];

            transactions.push({
                id: Date.now(),
                type: "Savings",
                category: "Goal Contribution",
                description: "Savings for " + goal.name,
                amount: amount,
                date: new Date().toISOString().slice(0, 10),
                goalId: goal.id
            });

            localStorage.setItem(
                TRANSACTIONS_KEY,
                JSON.stringify(transactions)
            );

            activities.unshift({
                message: "Added " + money(amount) +
                    " to " + goal.name,
                date: new Date().toLocaleDateString("en-IN")
            });

            saveActivities();
            renderGoals();
            renderActivity();

            alert("Savings added successfully!");
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            if (!confirm("Are you sure you want to delete this goal?")) {
                return;
            }

            goals = goals.filter(item => item.id !== goal.id);
            saveGoals();
            renderGoals();
        });

        actions.append(amountInput, addButton, deleteButton);

        card.append(
            title,
            targetText,
            savedText,
            dateText,
            progressBar,
            percentageText,
            actions
        );

        goalsList.appendChild(card);
    });

    updateSummary();
}

function renderActivity() {
    goalActivity.innerHTML = "";

    if (activities.length === 0) {
        goalActivity.innerHTML =
            '<p class="empty">No savings activity yet.</p>';
        return;
    }

    activities.slice(0, 10).forEach(activity => {
        const item = document.createElement("p");
        item.textContent = activity.message + " • " + activity.date;
        goalActivity.appendChild(item);
    });
}

goalForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("goalName").value.trim();
    const target = Number(document.getElementById("goalTarget").value);
    const saved = Number(document.getElementById("initialSaved").value);
    const date = document.getElementById("goalDate").value;

    if (!name || !Number.isFinite(target) || target <= 0 ||
        !Number.isFinite(saved) || saved < 0 || saved > target || !date) {
        alert("Please enter valid goal details. Initial savings cannot exceed the target.");
        return;
    }

    goals.push({
        id: Date.now(),
        name: name,
        target: target,
        saved: saved,
        date: date
    });

    saveGoals();

    activities.unshift({
        message: "Created goal: " + name,
        date: new Date().toLocaleDateString("en-IN")
    });

    saveActivities();
    renderGoals();
    renderActivity();
    goalForm.reset();

    document.getElementById("initialSaved").value = 0;

    alert("Savings goal created successfully!");
});

// Refresh if another page changes shared browser storage.
window.addEventListener("storage", function(event) {
    if (event.key === GOALS_KEY) {
        goals = JSON.parse(event.newValue) || [];
        renderGoals();
    }

    if (event.key === ACTIVITY_KEY) {
        activities = JSON.parse(event.newValue) || [];
        renderActivity();
    }
});

renderGoals();
renderActivity();