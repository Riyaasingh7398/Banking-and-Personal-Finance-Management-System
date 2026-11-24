
const profileForm = document.getElementById("profileForm");

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const inputs = [
    document.getElementById("fullName"),
    document.getElementById("email"),
    document.getElementById("phone"),
    document.getElementById("location")
];

const displayName = document.getElementById("displayName");
const statusMessage = document.getElementById("statusMessage");

// Load saved profile information
function loadProfile() {

    const savedProfile = JSON.parse(
        localStorage.getItem("fintrackProfile")
    ) || {};

    inputs[0].value = savedProfile.name || "Riya Singh";
    inputs[1].value = savedProfile.email || "";
    inputs[2].value = savedProfile.phone || "";
    inputs[3].value = savedProfile.location || "";

    displayName.textContent = inputs[0].value;
}

loadProfile();

// Enable editing
function enableEditing(enabled) {

    inputs.forEach(input => {
        input.disabled = !enabled;
    });

    editBtn.hidden = enabled;
    saveBtn.hidden = !enabled;
    cancelBtn.hidden = !enabled;
}

// Edit button
editBtn.addEventListener("click", function() {

    inputs.forEach(input => {
        input.dataset.previous = input.value;
    });

    statusMessage.textContent = "";

    enableEditing(true);
});

// Save profile
profileForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!inputs[0].value.trim()) {
        statusMessage.textContent = "Please enter your name.";
        return;
    }

    const profile = {
        name: inputs[0].value.trim(),
        email: inputs[1].value.trim(),
        phone: inputs[2].value.trim(),
        location: inputs[3].value.trim()
    };

    localStorage.setItem(
        "fintrackProfile",
        JSON.stringify(profile)
    );

    displayName.textContent = profile.name;

    statusMessage.textContent = "Profile updated successfully!";

    enableEditing(false);
});

// Cancel editing
cancelBtn.addEventListener("click", function() {

    inputs.forEach(input => {
        input.value = input.dataset.previous;
    });

    statusMessage.textContent = "Changes cancelled.";

    enableEditing(false);
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", function() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {
        alert("Logout functionality can be connected to your login page.");
    }

});
