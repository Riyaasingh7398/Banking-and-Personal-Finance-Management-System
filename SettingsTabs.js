const ids = [
    "darkMode",
    "accentColor",
    "compactMode",
    "transactionAlerts",
    "budgetAlerts",
    "emailAlerts",
    "monthlyReport",
    "twoFactor",
    "language",
    "currency",
    "dateFormat"
];

const defaults = {
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
    const saved = JSON.parse(localStorage.getItem("FinTrackTabs") || "{}");

    ids.forEach(id => {
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

// GET CURRENT VALUES
function getSettings() {
    const data = {};

    ids.forEach(id => {
        const element = document.getElementById(id);

        data[id] = element.type === "checkbox"
            ? element.checked
            : element.value;
    });

    return data;
}

// SAVE SETTINGS
document.getElementById("saveSettings").addEventListener("click", () => {
    localStorage.setItem("FinTrackTabs", JSON.stringify(getSettings()));
    applyAppearance();
    showToast("Settings saved successfully!");
});

// APPLY APPEARANCE
function applyAppearance() {
    const dark = document.getElementById("darkMode").checked;
    const compact = document.getElementById("compactMode").checked;
    const accent = document.getElementById("accentColor").value;

    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("compact", compact);

    document.documentElement.style.setProperty("--accent", accent);
}

// LIVE PREVIEW
document.getElementById("darkMode").addEventListener("change", applyAppearance);
document.getElementById("accentColor").addEventListener("input", applyAppearance);
document.getElementById("compactMode").addEventListener("change", applyAppearance);

// TAB SWITCHING
const buttons = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll(".settings-section");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        sections.forEach(section => section.classList.remove("active"));

        button.classList.add("active");

        const section = document.getElementById(button.dataset.section);
        if (section) section.classList.add("active");
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

// RESET SETTINGS
document.getElementById("resetSettings").addEventListener("click", () => {
    if (!confirm("Reset all SettingsTabs options?")) return;

    localStorage.removeItem("FinTrackTabs");
    loadSettings();

    showToast("Settings reset to default!");
});

// CHANGE PASSWORD (FRONTEND DEMO)
document.getElementById("changePassword").addEventListener("click", () => {
    const current = document.getElementById("currentPassword").value;
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;

    if (!current || !newPass || !confirmPass) {
        alert("Please fill all password fields.");
        return;
    }

    if (newPass.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    alert("Password change demo successful!");

    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";
});

// LOAD WHEN PAGE OPENS
loadSettings();