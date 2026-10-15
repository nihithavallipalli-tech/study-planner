const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const subject = document.getElementById("subject");
const taskDate = document.getElementById("taskDate");
const priority = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const filterTasks = document.getElementById("filterTasks");

let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("studyMateTasks")) || [];
    if (!Array.isArray(tasks)) tasks = [];
} catch {
    tasks = [];
}

// Set today's date
document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

// Personal greeting
function updateGreeting() {
    const name = localStorage.getItem("studyMateName") || "Student";
    document.getElementById("greeting").textContent =
        `Welcome, ${name}! 👋`;
}

document.getElementById("nameButton").addEventListener("click", () => {
    const currentName = localStorage.getItem("studyMateName") || "";
    const name = prompt("Enter your name:", currentName);

    if (name !== null && name.trim() !== "") {
        localStorage.setItem("studyMateName", name.trim());
        updateGreeting();
    }
});

// Save tasks in browser storage
function saveTasks() {
    localStorage.setItem("studyMateTasks", JSON.stringify(tasks));
}

// Add a new task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = taskName.value.trim();

    if (!name || !taskDate.value) {
        alert("Please enter a task name and due date.");
        return;
    }

    tasks.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        name: name,
        subject: subject.value,
        date: taskDate.value,
        priority: priority.value,
        completed: false
    });

    saveTasks();
    renderTasks();
    taskForm.reset();
    priority.value = "Medium";
});

// Display tasks
function renderTasks() {
    taskList.replaceChildren();

    const filter = filterTasks.value;

    const visibleTasks = tasks.filter(task => {
        if (filter === "pending") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
    });

    if (visibleTasks.length === 0) {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "No tasks here yet. Add your first study task!";
        taskList.appendChild(empty);
    }

    visibleTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item" + (task.completed ? " done" : "");

        const info = document.createElement("div");
        info.className = "task-info";

        const heading = document.createElement("h3");
        heading.textContent = task.name;

        const details = document.createElement("p");
        details.textContent =
            `${task.subject} • Due: ${formatDate(task.date)}`;

        const badge = document.createElement("span");
        badge.className = `priority ${task.priority}`;
        badge.textContent = task.priority + " Priority";

        info.append(heading, details, badge);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-btn";
        completeButton.textContent = task.completed ? "Undo" : "✓ Done";
        completeButton.setAttribute(
            "aria-label",
            task.completed ? "Mark task pending" : "Complete task"
        );

        completeButton.addEventListener("click", () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => {
            if (confirm("Delete this study task?")) {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            }
        });

        actions.append(completeButton, deleteButton);
        item.append(info, actions);
        taskList.appendChild(item);
    });

    updateStats();
}

// Format dates
function formatDate(date) {
    if (!date) return "Not set";

    const parts = date.split("-");
    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Update dashboard counters and progress bar
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progressText").textContent = progress + "%";
    document.getElementById("progressBar").style.width = progress + "%";

    document.getElementById("progressMessage").textContent =
        total === 0
            ? "Start adding tasks to track your progress!"
            : `${completed} of ${total} tasks completed. Keep going!`;
}

// Filter tasks
filterTasks.addEventListener("change", renderTasks);

// Initial page setup
updateGreeting();
renderTasks();