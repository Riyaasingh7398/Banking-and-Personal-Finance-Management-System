const settingIds = [
    "name", "email", "phone",
    "darkMode", "accentColor", "compactMode",
    "transactionAlerts", "budgetAlerts",
    "emailAlerts", "monthlyReport",
    "twoFactor", "language", "currency", "dateFormat"
];

const defaults = {
    name: "Riya Singh",
    email: "riya@example.com",
    phone: "+91 9876543210",
    darkMode: false,
    accentColor: "#7155e8",
    compactMode: false,
    transactionAlerts: true,
    budgetAlerts: true,
    emailAlerts: false,
    monthlyReport: true,
    twoFactor: false,
    language: "English",
    currency: "INR",
    dateFormat: "DD/MM/YYYY"
};

// LOAD SETTINGS
function loadSettings() {
    const saved = JSON.parse(
        localStorage.getItem("fintrackSettings") || "{}"
    );

    settingIds.forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;

        const value = saved[id] ?? defaults[id];

        if (element.type === "checkbox") {
            element.checked = value;
        } else {
            element.value = value;
        }
    });

    applyAppearance();
}

// GET SETTINGS
function getSettings() {
    const data = {};

    settingIds.forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;

        data[id] = element.type === "checkbox"
            ? element.checked
            : element.value;
    });

    return data;
}

// SAVE SETTINGS
document.getElementById("saveSettings").addEventListener("click", () => {
    localStorage.setItem(
        "fintrackSettings",
        JSON.stringify(getSettings())
    );

    applyAppearance();
    showToast("Settings saved successfully!");
});

// APPEARANCE
function applyAppearance() {
    const dark = document.getElementById("darkMode").checked;
    const compact = document.getElementById("compactMode").checked;
    const accent = document.getElementById("accentColor").value;

    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("compact", compact);

    document.documentElement.style.setProperty("--accent", accent);
}

document.getElementById("darkMode").addEventListener("change", applyAppearance);
document.getElementById("accentColor").addEventListener("input", applyAppearance);
document.getElementById("compactMode").addEventListener("change", applyAppearance);

// SETTINGS TABS
document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", () => {

        document.querySelectorAll(".tab-btn").forEach(btn =>
            btn.classList.remove("active")
        );

        document.querySelectorAll(".settings-section").forEach(section =>
            section.classList.remove("active")
        );

        button.classList.add("active");

        document.getElementById(button.dataset.section)
            .classList.add("active");
    });
});

// TOAST MESSAGE
function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// DISCARD CHANGES
document.getElementById("discardChanges").addEventListener("click", () => {
    loadSettings();
    showToast("Changes discarded.");
});

// RESET SETTINGS
document.getElementById("resetSettings").addEventListener("click", () => {
    if (!confirm("Reset all settings to default?")) return;

    localStorage.removeItem("fintrackSettings");
    loadSettings();

    showToast("Settings restored to default.");
});

// EXPORT SETTINGS
document.getElementById("exportData").addEventListener("click", () => {
    const data = getSettings();

    const file = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "FinTrack-Settings.json";
    link.click();

    URL.revokeObjectURL(link.href);
    showToast("Settings exported.");
});

// CHANGE PASSWORD
document.getElementById("changePassword").addEventListener("click", () => {
    const current = document.getElementById("currentPassword").value;
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;

    if (!current || !newPass || !confirmPass) {
        alert("Please fill in all password fields.");
        return;
    }

    if (newPass.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("New passwords do not match.");
        return;
    }

    alert("Demo successful! Backend is required to actually change password.");

    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";
});

// DELETE ACCOUNT
document.getElementById("deleteAccount").addEventListener("click", () => {
    const confirmDelete = confirm(
        "Are you sure you want to delete your account?"
    );

    if (confirmDelete) {
        alert("Demo only: Backend is required for account deletion.");
    }
});

// SIDEBAR NAVIGATION
document.querySelectorAll(".sidebar nav a[data-tab]").forEach(link => {
    link.addEventListener("click", event => {

        const tab = link.dataset.tab;

        if (tab === "settings") {
            event.preventDefault();
            return;
        }

        // Uses the HTML file links in the sidebar
        window.location.href = link.getAttribute("href");
    });
});

// START
loadSettings();