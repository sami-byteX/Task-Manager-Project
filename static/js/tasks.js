// High-level task manager UI logic and API client for /api/tasks/.

const API_BASE_URL = "/api/tasks/";

// Cache frequently used DOM nodes for responsiveness and clarity.
const elements = {
  form: document.getElementById("task-form"),
  id: document.getElementById("task-id"),
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  completed: document.getElementById("completed"),
  submitBtn: document.getElementById("submit-btn"),
  submitSpinner: document.getElementById("submit-spinner"),
  submitText: document.getElementById("submit-text"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  formTitle: document.getElementById("form-title"),
  taskCountBadge: document.getElementById("task-count-badge"),
  searchInput: document.getElementById("search-input"),
  statusFilter: document.getElementById("status-filter"),
  sortSelect: document.getElementById("sort-select"),
  tasksBody: document.getElementById("tasks-body"),
  emptyRow: document.getElementById("empty-row"),
  listLoading: document.getElementById("list-loading"),
  alertContainer: document.getElementById("alert-container"),
  deleteModal: document.getElementById("deleteModal"),
  confirmDeleteBtn: document.getElementById("confirm-delete-btn"),
  deleteSpinner: document.getElementById("delete-spinner"),
};

let deleteModalInstance = null;
let taskToDeleteId = null;
let allTasks = [];

// Simple debounce to avoid excessive API calls from search and filters.
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Extract CSRF token from cookie to support session-authenticated unsafe requests.
function getCsrfToken() {
  const name = "csrftoken=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const parts = decodedCookie.split(";");
  for (let part of parts) {
    part = part.trim();
    if (part.startsWith(name)) {
      return part.substring(name.length);
    }
  }
  return null;
}

async function apiRequest(url, options = {}) {
  const headers = options.headers || {};
  if (["POST", "PUT", "PATCH", "DELETE"].includes(options.method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
    headers["Content-Type"] = "application/json";
  }
  try {
    const response = await fetch(url, { credentials: "same-origin", ...options, headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with ${response.status}`);
    }
    if (response.status === 204) {
      return null;
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

function setFormLoading(isLoading) {
  elements.submitBtn.disabled = isLoading;
  elements.submitSpinner.classList.toggle("d-none", !isLoading);
}

function setListLoading(isLoading) {
  elements.listLoading.classList.toggle("d-none", !isLoading);
}

function showAlert(message, type = "danger", timeoutMs = 5000) {
  const wrapper = document.createElement("div");
  wrapper.className = `alert alert-${type} alert-dismissible fade show`;
  wrapper.role = "alert";
  wrapper.innerHTML = `
    <span>${message}</span>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  elements.alertContainer.appendChild(wrapper);
  if (timeoutMs) {
    setTimeout(() => {
      const alert = bootstrap.Alert.getOrCreateInstance(wrapper);
      alert.close();
    }, timeoutMs);
  }
}

function resetForm() {
  elements.id.value = "";
  elements.title.value = "";
  elements.description.value = "";
  elements.completed.checked = false;
  elements.formTitle.textContent = "Create Task";
  elements.submitText.textContent = "Create Task";
  elements.cancelEditBtn.classList.add("d-none");
  elements.form.classList.remove("was-validated");
}

function populateFormForEdit(task) {
  elements.id.value = task.id;
  elements.title.value = task.title;
  elements.description.value = task.description || "";
  elements.completed.checked = !!task.completed;
  elements.formTitle.textContent = "Edit Task";
  elements.submitText.textContent = "Save Changes";
  elements.cancelEditBtn.classList.remove("d-none");
}

function renderTaskRow(task) {
  const tr = document.createElement("tr");
  tr.dataset.id = task.id;
  tr.innerHTML = `
    <td>
      <input class="form-check-input task-toggle" type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark complete">
    </td>
    <td>
      <span class="${task.completed ? "text-decoration-line-through text-muted" : ""}">${task.title}</span>
      <div class="small text-muted d-md-none mt-1">
        ${task.description ? task.description : ""}
      </div>
    </td>
    <td class="d-none d-md-table-cell text-truncate" style="max-width: 280px;">
      ${task.description ? task.description : ""}
    </td>
    <td>
      <span class="badge ${task.completed ? "bg-success" : "bg-warning text-dark"}">
        ${task.completed ? "Completed" : "Pending"}
      </span>
    </td>
    <td class="text-end">
      <button type="button" class="btn btn-sm btn-outline-primary me-1 task-edit">Edit</button>
      <button type="button" class="btn btn-sm btn-outline-danger task-delete">Delete</button>
    </td>
  `;
  return tr;
}

function applyClientFilters(tasks) {
  const search = elements.searchInput.value.trim().toLowerCase();
  const status = elements.statusFilter.value;
  const sort = elements.sortSelect.value;

  let filtered = tasks.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search) ||
      (t.description || "").toLowerCase().includes(search);
    const matchesStatus =
      status === "all" ||
      (status === "completed" && t.completed) ||
      (status === "pending" && !t.completed);
    return matchesSearch && matchesStatus;
  });

  const sortDir = sort.startsWith("-") ? -1 : 1;
  const key = sort.replace(/^-/, "");

  filtered.sort((a, b) => {
    if (key === "created_at") {
      return sortDir * (new Date(a.created_at) - new Date(b.created_at));
    }
    const av = (a[key] || "").toString().toLowerCase();
    const bv = (b[key] || "").toString().toLowerCase();
    if (av < bv) return -1 * sortDir;
    if (av > bv) return 1 * sortDir;
    return 0;
  });

  return filtered;
}

function renderTaskList() {
  const filtered = applyClientFilters(allTasks);
  elements.tasksBody.innerHTML = "";
  if (!filtered.length) {
    elements.tasksBody.appendChild(elements.emptyRow);
    elements.emptyRow.classList.remove("d-none");
  } else {
    elements.emptyRow.classList.add("d-none");
    filtered.forEach((task) => {
      elements.tasksBody.appendChild(renderTaskRow(task));
    });
  }
  elements.taskCountBadge.textContent =
    allTasks.length === 1 ? "1 task" : `${allTasks.length} tasks`;
}

async function fetchTasks() {
  setListLoading(true);
  try {
    const data = await apiRequest(API_BASE_URL, { method: "GET" });
    allTasks = Array.isArray(data) ? data : [];
    renderTaskList();
  } catch (err) {
    showAlert("Failed to load tasks. Please try again.", "danger");
  } finally {
    setListLoading(false);
  }
}

async function createTask(payload) {
  return apiRequest(API_BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateTask(id, payload) {
  return apiRequest(`${API_BASE_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

async function deleteTask(id) {
  return apiRequest(`${API_BASE_URL}${id}/`, {
    method: "DELETE",
  });
}

function handleFormSubmit(event) {
  event.preventDefault();
  elements.form.classList.add("was-validated");

  if (!elements.form.checkValidity()) {
    return;
  }

  const id = elements.id.value || null;
  const payload = {
    title: elements.title.value.trim(),
    description: elements.description.value.trim(),
    completed: elements.completed.checked,
  };

  setFormLoading(true);

  const action = id ? updateTask(id, payload) : createTask(payload);

  action
    .then((task) => {
      if (id) {
        const idx = allTasks.findIndex((t) => t.id === task.id);
        if (idx !== -1) {
          allTasks[idx] = task;
        }
        showAlert("Task updated successfully.", "success", 3000);
      } else {
        allTasks.unshift(task);
        showAlert("Task created successfully.", "success", 3000);
      }
      renderTaskList();
      resetForm();
    })
    .catch(() => {
      showAlert("Could not save the task. Please try again.", "danger");
    })
    .finally(() => {
      setFormLoading(false);
    });
}

function handleTableClick(event) {
  const target = event.target;
  const row = target.closest("tr[data-id]");
  if (!row) return;
  const id = row.dataset.id;
  const task = allTasks.find((t) => String(t.id) === String(id));
  if (!task) return;

  if (target.classList.contains("task-edit")) {
    populateFormForEdit(task);
  } else if (target.classList.contains("task-delete")) {
    taskToDeleteId = task.id;
    deleteModalInstance.show();
  } else if (target.classList.contains("task-toggle")) {
    const newCompleted = target.checked;
    updateTask(task.id, { completed: newCompleted })
      .then((updated) => {
        const idx = allTasks.findIndex((t) => t.id === updated.id);
        if (idx !== -1) {
          allTasks[idx] = updated;
        }
        renderTaskList();
      })
      .catch(() => {
        target.checked = !newCompleted;
        showAlert("Failed to update task status.", "danger");
      });
  }
}

function handleConfirmDelete() {
  if (!taskToDeleteId) return;
  elements.confirmDeleteBtn.disabled = true;
  elements.deleteSpinner.classList.remove("d-none");

  deleteTask(taskToDeleteId)
    .then(() => {
      allTasks = allTasks.filter((t) => t.id !== taskToDeleteId);
      renderTaskList();
      showAlert("Task deleted.", "success", 3000);
      deleteModalInstance.hide();
    })
    .catch(() => {
      showAlert("Failed to delete task. Please try again.", "danger");
    })
    .finally(() => {
      elements.confirmDeleteBtn.disabled = false;
      elements.deleteSpinner.classList.add("d-none");
      taskToDeleteId = null;
    });
}

function init() {
  deleteModalInstance = new bootstrap.Modal(elements.deleteModal);

  elements.form.addEventListener("submit", handleFormSubmit);
  elements.cancelEditBtn.addEventListener("click", resetForm);
  elements.tasksBody.addEventListener("click", handleTableClick);
  elements.confirmDeleteBtn.addEventListener("click", handleConfirmDelete);

  const debouncedRender = debounce(renderTaskList, 250);
  elements.searchInput.addEventListener("input", debouncedRender);
  elements.statusFilter.addEventListener("change", debouncedRender);
  elements.sortSelect.addEventListener("change", debouncedRender);

  fetchTasks();
}

document.addEventListener("DOMContentLoaded", init);

