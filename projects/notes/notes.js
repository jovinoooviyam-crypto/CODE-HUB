
/* ========================================
   FOCUS SPACE
   TODO + NOTES APPLICATION
======================================== */

// STORAGE

let tasks = JSON.parse(localStorage.getItem("focusTasks")) || [];
let notes = JSON.parse(localStorage.getItem("focusNotes")) || [];

let currentFilter = "all";
let currentNoteId = null;


// HELPERS

function saveTasks() {
    localStorage.setItem("focusTasks", JSON.stringify(tasks));
}

function saveNotes() {
    localStorage.setItem("focusNotes", JSON.stringify(notes));
}

function createId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


// DATE

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });


// ========================================
// SLIDING PAGE SWITCH
// ========================================

const switchButtons = document.querySelectorAll(".switch-btn");
const switchSlider = document.getElementById("switchSlider");

switchButtons.forEach(button => {

    button.addEventListener("click", () => {

        const page = button.dataset.page;

        switchButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        document.querySelectorAll(".page").forEach(section =>
            section.classList.remove("active")
        );

        document.getElementById(page + "Page")
            .classList.add("active");

        switchSlider.classList.toggle("notes", page === "notes");

    });

});


// ========================================
// TODO LIST
// ========================================

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");


// ADD TASK

taskForm.addEventListener("submit", event => {

    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) return;

    tasks.unshift({
        id: createId(),
        title: title,
        completed: false,
        createdAt: new Date().toISOString()
    });

    saveTasks();

    taskInput.value = "";

    renderTasks();

});


// RENDER TASKS

function renderTasks() {

    const total = tasks.length;

    const completed = tasks.filter(t => t.completed).length;

    const pending = total - completed;

    const percentage = total
        ? Math.round((completed / total) * 100)
        : 0;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("progressText").textContent =
        percentage + "%";

    document.getElementById("progressCircle").style.background =
        `conic-gradient(var(--green) ${percentage * 3.6}deg, var(--surface2) 0deg)`;


    const filteredTasks = tasks.filter(task => {

        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;

    });

    document.getElementById("taskCount").textContent =
        `${filteredTasks.length} tasks`;


    if (!filteredTasks.length) {

        taskList.innerHTML = `
            <div class="empty-state">
                <h3>${currentFilter === "completed"
                    ? "No completed tasks yet"
                    : currentFilter === "pending"
                    ? "All caught up!"
                    : "Your task list is empty"}</h3>
                <p>Add a task and start organizing your day.</p>
            </div>
        `;

        return;
    }


    taskList.innerHTML = filteredTasks.map(task => `

        <div class="task-item ${task.completed ? "completed" : ""}">

            <button
                class="task-toggle ${task.completed ? "done" : ""}"
                data-action="toggle"
                data-id="${task.id}"
                aria-label="${task.completed ? "Mark pending" : "Mark completed"}"
                title="${task.completed ? "Mark pending" : "Mark completed"}"
            ></button>

            <div class="task-info">
                <h3>${escapeHTML(task.title)}</h3>
                <p>
                    ${task.completed ? "Completed" : "Pending"}
                    · ${new Date(task.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div class="task-actions">

                <button data-action="edit" data-id="${task.id}">
                    Edit
                </button>

                <button class="remove"
                        data-action="delete"
                        data-id="${task.id}">
                    Delete
                </button>

            </div>

        </div>

    `).join("");

}


// TASK ACTIONS

taskList.addEventListener("click", event => {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    const task = tasks.find(t => t.id === id);

    if (!task) return;


    if (action === "toggle") {

        task.completed = !task.completed;

        saveTasks();
        renderTasks();

    }


    if (action === "edit") {

        document.getElementById("modalTaskId").value = id;

        document.getElementById("modalTaskTitle").value =
            task.title;

        document.getElementById("taskModal")
            .classList.add("show");

    }


    if (action === "delete") {

        if (!confirm("Delete this task permanently?")) return;

        tasks = tasks.filter(t => t.id !== id);

        saveTasks();
        renderTasks();

    }

});


// EDIT TASK MODAL

const taskModal = document.getElementById("taskModal");

function closeTaskModal() {
    taskModal.classList.remove("show");
}

document.getElementById("closeModal")
    .addEventListener("click", closeTaskModal);

document.getElementById("cancelEdit")
    .addEventListener("click", closeTaskModal);

taskModal.addEventListener("click", event => {
    if (event.target === taskModal) closeTaskModal();
});

document.getElementById("editForm").addEventListener("submit", event => {

    event.preventDefault();

    const id = document.getElementById("modalTaskId").value;

    const task = tasks.find(t => t.id === id);

    if (task) {

        task.title = document.getElementById("modalTaskTitle")
            .value.trim();

        saveTasks();
        renderTasks();

    }

    closeTaskModal();

});


// FILTERS

document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-btn").forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();

    });

});


// ========================================
// NOTES EDITOR
// ========================================

const notesList = document.getElementById("notesList");
const noteEditor = document.getElementById("noteEditor");
const emptyEditor = document.getElementById("emptyEditor");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");


// CREATE NOTE

function createNote() {

    const note = {
        id: createId(),
        title: "Untitled Note",
        content: "",
        updatedAt: new Date().toISOString()
    };

    notes.unshift(note);

    saveNotes();

    currentNoteId = note.id;

    renderNotes();

    noteTitle.focus();
    noteTitle.select();

}

document.getElementById("newNoteBtn")
    .addEventListener("click", createNote);

document.getElementById("emptyNewNote")
    .addEventListener("click", createNote);


// RENDER NOTES

function renderNotes() {

    document.getElementById("notesCount").textContent = notes.length;

    notesList.innerHTML = notes.map(note => `

        <div class="note-item ${note.id === currentNoteId ? "active" : ""}"
             data-id="${note.id}">

            <h4>${escapeHTML(note.title || "Untitled Note")}</h4>

            <p>${escapeHTML(
                note.content.slice(0, 55) || "No content yet..."
            )}</p>

        </div>

    `).join("");


    if (!notes.length) {

        currentNoteId = null;

        emptyEditor.classList.remove("hidden");
        noteEditor.classList.add("hidden");

        return;
    }

    const currentNote = notes.find(n => n.id === currentNoteId);

    if (!currentNote) {

        currentNoteId = notes[0].id;
        openNote(currentNoteId);

    }

}


// OPEN NOTE

function openNote(id) {

    currentNoteId = id;

    const note = notes.find(n => n.id === id);

    if (!note) return;

    emptyEditor.classList.add("hidden");
    noteEditor.classList.remove("hidden");

    noteTitle.value = note.title;
    noteContent.value = note.content;

    updateWordCount();
    renderNotes();

}


// NOTE SELECTION

notesList.addEventListener("click", event => {

    const item = event.target.closest(".note-item");

    if (!item) return;

    openNote(item.dataset.id);

});


// AUTO SAVE

function saveCurrentNote() {

    const note = notes.find(n => n.id === currentNoteId);

    if (!note) return;

    note.title = noteTitle.value.trim() || "Untitled Note";
    note.content = noteContent.value;
    note.updatedAt = new Date().toISOString();

    saveNotes();

    document.getElementById("saveStatus").textContent =
        "Saved locally ✓";

    renderNotes();

    updateWordCount();

}

let saveTimer;

function scheduleNoteSave() {

    document.getElementById("saveStatus").textContent = "Saving...";

    clearTimeout(saveTimer);

    saveTimer = setTimeout(saveCurrentNote, 300);

}

noteTitle.addEventListener("input", scheduleNoteSave);
noteContent.addEventListener("input", scheduleNoteSave);


// WORD COUNT

function updateWordCount() {

    const text = noteContent.value.trim();

    const words = text
        ? text.split(/\s+/).length
        : 0;

    document.getElementById("wordCount").textContent =
        `${words} words`;

}

noteContent.addEventListener("input", updateWordCount);


// DELETE NOTE

document.getElementById("deleteNoteBtn")
    .addEventListener("click", () => {

        if (!currentNoteId) return;

        if (!confirm("Delete this note permanently?")) return;

        notes = notes.filter(n => n.id !== currentNoteId);

        currentNoteId = notes.length ? notes[0].id : null;

        saveNotes();

        if (currentNoteId) {
            openNote(currentNoteId);
        } else {
            renderNotes();
        }

    });


// ========================================
// INITIALIZATION
// ========================================

renderTasks();
renderNotes();
