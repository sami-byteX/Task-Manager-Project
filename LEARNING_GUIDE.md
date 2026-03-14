# Task Manager Project — Complete Learning Guide for Beginners

This guide explains your Task Manager project so you can understand every concept, explain it in interviews, and extend it confidently. It is written for someone new to Django and backend development.

---

## 1. PROJECT OVERVIEW

### What This Project Does
- **Backend:** A **REST API** that stores and serves "tasks" (title, description, completed, created_at) as **JSON** over HTTP.
- **Frontend:** A single web page where users can create, edit, complete, delete, search, filter, and sort tasks. The page talks to the API using JavaScript `fetch()` — it does **not** reload the whole page or submit traditional HTML forms for task data.

### Purpose and Problems It Solves
- **Learn REST APIs:** You see how a backend exposes resources (tasks) via URLs and HTTP methods (GET, POST, PATCH, DELETE).
- **Learn Django + DRF:** Django handles the server, database, and URLs; Django REST Framework (DRF) turns your model into a ready-to-use API.
- **Learn client–server split:** The browser runs JavaScript that gets data from the API and updates the screen without full page reloads.

### Overall Architecture (Simple Diagram)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                                  │
│  • User sees: one HTML page (form + table + modals)                       │
│  • JavaScript runs: fetch("/api/tasks/") and fetch("/api/tasks/1/") etc.  │
└─────────────────────────────────────────────────────────────────────────┘
        │                              │
        │ GET /                        │ GET/POST/PATCH/DELETE /api/tasks/...
        ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  DJANGO (config + tasks app)                                             │
│  • URL routing: "/" → HTML page    "/api/" → REST API (tasks app)        │
│  • REST API (DRF): TaskViewSet → TaskSerializer → Task model             │
│  • Database: SQLite (db.sqlite3)                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

So: **one Django project** serves both the **HTML page** (at `/`) and the **REST API** (at `/api/tasks/`). The HTML page is a **client** of that API.

---

## 2. TECHNOLOGIES USED

### Python
- **What:** The programming language the server runs.
- **Why:** Django is written in Python. You write models, views, and config in Python.

### Django
- **What:** A web framework. It handles URLs, requests, database access, templates, and security.
- **Why:** You don’t build a server from scratch; Django gives you structure (apps, settings, ORM, admin).

### Django ORM (Object-Relational Mapper)
- **What:** Lets you work with the database using Python classes and methods (e.g. `Task.objects.all()`), not raw SQL.
- **Why:** Safer (fewer SQL mistakes), portable (same code for SQLite, PostgreSQL, etc.), and easier to read.

### Django REST Framework (DRF)
- **What:** A Django add-on that builds REST APIs: it turns your models into JSON endpoints (list, create, retrieve, update, delete) with very little code.
- **Why:** Without DRF you’d write a view per endpoint and manual JSON serialization. With DRF, a `ModelViewSet` and a `ModelSerializer` give you all of that.

### HTML Templates
- **What:** Django’s template language: `.html` files with placeholders like `{{ variable }}` and tags like `{% load static %}`.
- **Why:** In this project we use **one** template (`index.html`) to deliver the initial HTML shell. Task data is **not** rendered by the template — it’s loaded by JavaScript from the API.

### Bootstrap
- **What:** A CSS/JS library for layout, buttons, forms, tables, modals (loaded via CDN).
- **Why:** Makes the UI look good and responsive without writing lots of custom CSS. Our template uses Bootstrap classes; our own `tasks.css` only adds a few extra styles.

### SQLite
- **What:** A file-based database. One file (`db.sqlite3`) holds all tables.
- **Why:** No separate database server; perfect for learning and small projects. Django talks to it through the ORM.

### How They Work Together
- **Python** runs Django.
- **Django** uses **ORM** to read/write **SQLite**.
- **DRF** uses the same **Task** model and **TaskSerializer** to expose **JSON API** at `/api/tasks/`.
- The **template** sends **HTML** to the browser; **Bootstrap** styles it; **JavaScript** calls the API and updates the page.

---

## 3. PROJECT STRUCTURE

```
task_manager_api/
├── manage.py              # Entry point: runs server, migrations, shell, etc.
├── config/                # Project configuration (not an "app" with models)
│   ├── settings.py        # All settings: apps, DB, templates, static, etc.
│   ├── urls.py            # Root URL routing: /, /admin/, /api/
│   ├── wsgi.py            # Used by production servers (e.g. Gunicorn)
│   └── asgi.py            # Used for async servers
├── tasks/                 # Django app: one unit of functionality (tasks CRUD)
│   ├── models.py          # Task model (database table definition)
│   ├── views.py           # TaskViewSet (DRF: list, create, update, delete)
│   ├── serializers.py     # TaskSerializer (Python ↔ JSON)
│   ├── urls.py            # API routes: /api/tasks/ and /api/tasks/<id>/
│   ├── admin.py           # Optional: register Task in Django admin
│   ├── templates/         # App-specific templates
│   │   └── index.html     # The single HTML page (form + table + modal)
│   ├── migrations/        # Database migration files (create/change tables)
│   │   └── 0001_initial.py
│   └── ...
├── static/                # Your own CSS/JS (served at /static/)
│   ├── css/tasks.css
│   └── js/tasks.js        # All UI logic + API calls
├── templates/             # (Optional) project-level templates; we use app template
└── db.sqlite3             # SQLite database file (created after migrate)
```

### Important Files Explained

| File | Purpose |
|------|--------|
| **manage.py** | Sets `DJANGO_SETTINGS_MODULE` to `config.settings`, then runs Django commands (`runserver`, `migrate`, `makemigrations`, `shell`, etc.). You always run it from the project root. |
| **config/settings.py** | Defines INSTALLED_APPS (including `rest_framework` and `tasks`), DATABASES (SQLite), TEMPLATES (where to find HTML), STATIC files, ROOT_URLCONF, middleware, etc. One place for all configuration. |
| **config/urls.py** | Root URL list: `/admin/` → Django admin, `api/` → include tasks’ URLs, `''` → serve `index.html`. So the first step of every request is “which URL pattern matches?” |
| **tasks/models.py** | Defines the `Task` model. Django ORM turns this into a database table. |
| **tasks/views.py** | Defines `TaskViewSet`. DRF uses it to handle GET/POST on `/api/tasks/` and GET/PATCH/DELETE on `/api/tasks/<id>/`. |
| **tasks/serializers.py** | Defines how a `Task` instance is converted to/from JSON (field list: id, title, description, completed, created_at). |
| **tasks/urls.py** | Uses DRF’s `DefaultRouter` to register `TaskViewSet` under the path `tasks`, so under `config` we get `/api/tasks/` and `/api/tasks/<id>/`. |
| **templates / tasks/templates** | Where Django looks for HTML. Our `index.html` is in `tasks/templates/`. It’s the only template that sends the page the user sees; task rows are built in JavaScript. |
| **migrations/** | Each file describes a change to the database (e.g. create Task table). You run `python manage.py migrate` to apply them. Never edit by hand unless you know what you’re doing. |

### Why Django Is Structured This Way
- **Separation of concerns:** Config (config/) vs business logic (tasks app). Each app can have its own models, views, URLs, templates.
- **Reusability:** The `tasks` app could be copied into another project.
- **Scalability:** You add more apps (e.g. `users`, `projects`) without stuffing everything into one place.

---

## 4. DJANGO REQUEST–RESPONSE FLOW

We’ll trace two kinds of requests: (1) opening the website, (2) the frontend loading tasks from the API.

### Flow 1: User Opens the Website (GET /)

```
1. Browser sends:  GET /   (e.g. http://127.0.0.1:8000/)

2. Django receives the request
   → Middleware runs (security, sessions, etc.)

3. URL routing (config/urls.py)
   → path('', TemplateView.as_view(template_name='index.html'))  matches
   → Django calls TemplateView with template_name='index.html'

4. TemplateView
   → Finds index.html (from TEMPLATES DIRS or app templates)
   → Renders it with minimal context (no task list from database)
   → Returns HTML response

5. Browser receives HTML
   → Loads Bootstrap (CDN), tasks.css, tasks.js
   → Runs JavaScript when DOM is ready (DOMContentLoaded)
```

So for **GET /** there is **no** database query for tasks. The server only sends the HTML shell.

### Flow 2: Frontend Loads Tasks (GET /api/tasks/)

```
1. JavaScript calls:  fetch('/api/tasks/', { method: 'GET' })

2. Django receives:  GET /api/tasks/

3. URL routing (config/urls.py)
   → path('api/', include('tasks.urls'))  matches
   → Django goes to tasks/urls.py with path left: "tasks/"

4. tasks/urls.py (DRF router)
   → Router matches "tasks/" and HTTP method GET
   → Routes to TaskViewSet.list()

5. TaskViewSet.list()
   → Runs queryset: Task.objects.all()
   → Database: SELECT * FROM tasks_task;  (ORM turns this into SQL)
   → Gets list of Task instances

6. TaskSerializer
   → Converts each Task to a dictionary (id, title, description, completed, created_at)
   → DRF converts that to JSON array

7. Response
   → HTTP 200 with JSON body: [ { "id": 1, "title": "...", ... }, ... ]
   → Browser never sees HTML for this; JavaScript receives JSON
```

So the **full** flow for “see the task list” is: Browser → GET / → HTML → JS runs → GET /api/tasks/ → Django → ORM query → Serializer → JSON → JS updates table.

---

## 5. MODEL EXPLANATION

### Task Model (tasks/models.py)

```python
class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
```

### What Each Field Means

| Field | Type | Meaning |
|-------|------|--------|
| **id** | (auto) | Not written by you. Django adds a primary key (BigAutoField). Each row has a unique id. |
| **title** | CharField(max_length=255) | Short text, required. DB column: VARCHAR(255). |
| **description** | TextField(blank=True) | Long text, optional. blank=True means forms can leave it empty. |
| **completed** | BooleanField(default=False) | True/False. default=False means new tasks start as not completed. |
| **created_at** | DateTimeField(auto_now_add=True) | Date and time. auto_now_add=True means Django sets it once when the row is created and doesn’t change it. |

### Why BooleanField for completed?
- A task is either done or not. Boolean is the right type; in the DB it’s stored as 0/1 (or true/false). The API and frontend use `true`/`false` in JSON.

### Why DateTimeField(auto_now_add=True)?
- So you know when each task was created, without the client sending the time. Django sets it on first save only; `auto_now` would update on every save (we don’t want that for “created_at”).

### How Django Converts Models to Database Tables
- Each model class becomes one table. Class name `Task` → table name `tasks_task` (app_label + model name).
- Each field becomes a column. Field types map to DB types (CharField → VARCHAR, BooleanField → INTEGER or BOOLEAN, etc.).
- Migrations record these changes. When you run `migrate`, Django runs SQL (CREATE TABLE, ALTER TABLE, etc.) on your SQLite file.

### Migrations — Why They’re Required
- You **change** models in Python (add a field, change type). The database doesn’t change by itself.
- **makemigrations:** Django compares your models to the last migration and creates a new migration file (e.g. “add field X to Task”).
- **migrate:** Runs pending migrations: executes the SQL so the database matches the models.
- So: **model change → makemigrations → migrate**. That keeps the DB and code in sync and is repeatable (e.g. on another machine or in production).

---

## 6. VIEW LOGIC EXPLANATION

In this project, “views” that handle task data are **DRF ViewSets**, not Django views that render HTML. They return **JSON**.

### TaskViewSet (tasks/views.py)

```python
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
```

- **queryset:** All rows from the Task table. DRF uses this for list (and for finding one task by id for retrieve/update/delete).
- **serializer_class:** Converts Task instances to/from JSON.

### How Tasks Are Retrieved
- **List (GET /api/tasks/):** DRF calls `list()`. It runs `queryset` (here `Task.objects.all()`), passes the result to `TaskSerializer(instance=many_tasks)`, and returns the JSON array.
- **Retrieve (GET /api/tasks/5/):** DRF gets id=5 from the URL, runs `Task.objects.get(pk=5)` (conceptually), serializes that one task, returns JSON.

### How Create / Edit / Delete Work
- **Create (POST /api/tasks/):** DRF receives JSON body. `TaskSerializer` validates and converts to a Task instance, then `.save()` inserts a row. Response: 201 + JSON of the new task.
- **Edit (PATCH /api/tasks/5/):** DRF loads the task with id=5, partial update with request data, serializer validates, `.save()` updates the row. Response: 200 + JSON of updated task.
- **Delete (DELETE /api/tasks/5/):** DRF loads the task, calls `.delete()` on it. Response: 204 No Content.

### Filtering and Sorting in *This* Project
- **In this codebase,** the backend does **not** filter or sort by URL parameters. The ViewSet always returns **all** tasks (ordered by default model order; we didn’t set one, so it’s table order).
- **Filtering and sorting** are done in the **frontend** (tasks.js):
  - **Search:** User types in the search box → JavaScript filters `allTasks` by title/description (substring, case-insensitive).
  - **Status filter:** User selects “Completed” or “Pending” → JavaScript filters `allTasks` by `task.completed`.
  - **Sort:** User selects “Newest first” / “Oldest first” / “Title A–Z” / “Title Z–A” → JavaScript sorts the (possibly filtered) array by `created_at` or `title`, then re-renders the table.

So the **logic** is: one GET fetches all tasks; the rest is in `applyClientFilters()` and `renderTaskList()` in tasks.js. No `request.GET` in the backend for filter/sort in this project.

---

## 7. TEMPLATE EXPLANATION

### How Django Templates Work (General)
- Templates are `.html` files with:
  - **Variables:** `{{ variable }}` — replaced with a value from the view context.
  - **Tags:** `{% load static %}`, `{% if %}`, `{% for %}`, etc. — control logic and inclusion.
- The **view** (or TemplateView) passes a **context** (dict). The template only sees those variables; it doesn’t run Python.

### In This Project
- We use **one** template: `index.html`. It’s rendered by **TemplateView** with **no** task-related context. So there are **no** `{% for task in tasks %}` or `{{ task.title }}` in the template.
- The template provides:
  - Structure: navbar, form (title, description, completed, submit/cancel), table (header + empty tbody), modal, alert container.
  - **Django template tags:** `{% load static %}` and `{% static 'css/tasks.css' %}` / `{% static 'js/tasks.js' %}` so Django can generate the correct `/static/...` URLs.
- So: **template rendering** = Django fills in `{% static %}` and sends HTML. **Task data** is then loaded by JavaScript from the API and injected into the DOM (table rows, form when editing).

### Forms and CSRF
- The form in the template is a **plain HTML form** with `id="task-form"`. It is **not** a Django `ModelForm` that posts to a Django view. On submit, JavaScript **prevents** the default submit (`event.preventDefault()`), then sends the data via **fetch()** to the API (POST or PATCH) with JSON body.
- **CSRF:** For POST/PATCH/DELETE, Django expects a CSRF token so the request is from our site. The token is in a cookie. Our JavaScript reads it (`getCsrfToken()`) and sends it in the header `X-CSRFToken` on every mutating request. So the “form” is validated and submitted by JS, and Django’s CSRF middleware is satisfied by the header.

### How the UI Communicates With the Backend
- **All** task data goes over the **REST API** as JSON:
  - Load list: `GET /api/tasks/` → JSON array → stored in `allTasks` → table drawn by JS.
  - Create: form values → `POST /api/tasks/` with JSON → response task added to `allTasks` → table redrawn.
  - Edit: same form → `PATCH /api/tasks/<id>/` with JSON → response used to update `allTasks` → table redrawn.
  - Toggle complete: checkbox → `PATCH /api/tasks/<id>/` with `{ "completed": true/false }` → update `allTasks` → table redrawn.
  - Delete: confirm in modal → `DELETE /api/tasks/<id>/` → remove from `allTasks` → table redrawn.
- So: **template** = static structure; **backend** = REST API; **communication** = fetch() + JSON + CSRF header.

---

## 8. DATABASE INTERACTION (Django ORM in This Project)

### Task.objects.all()
- **Meaning:** “Give me every row from the tasks_task table as Task instances.”
- **SQL (conceptually):** `SELECT * FROM tasks_task;`
- **Returns:** A QuerySet (lazy). When DRF iterates over it (e.g. to serialize), Django runs the query and returns Task objects.

### Filtering (if you did it in the backend)
- Example: `Task.objects.filter(completed=True)` → WHERE completed = 1.
- Example: `Task.objects.filter(title__icontains='report')` → WHERE title LIKE '%report%' (case-insensitive).
- In **this** project the ViewSet doesn’t filter; the frontend holds all tasks and filters in memory.

### Ordering
- Example: `Task.objects.all().order_by('-created_at')` → ORDER BY created_at DESC.
- You could set this on the ViewSet: `queryset = Task.objects.all().order_by('-created_at')` so the API always returns newest first. Our frontend then sorts again for “oldest first” or “title A–Z” in JS.

### Saving Objects
- **Create:** `Task.objects.create(title='...', description='...', completed=False)` or, with a serializer, `serializer.save()`. Django runs INSERT.
- **Update:** Get the instance, change attributes, call `task.save()`, or use `serializer.save()`. Django runs UPDATE.

### Deleting Objects
- `task.delete()` or `Task.objects.filter(...).delete()`. Django runs DELETE.

So in this project the ORM is used by DRF: the ViewSet’s queryset and the serializer’s `.save()` trigger the actual SQL. You don’t write raw SQL.

---

## 9. FILTERING AND SORTING LOGIC

### How It Works in *This* Project (Frontend)
- **No** `?status=completed` or `?order=newest` in the backend. The API returns **all** tasks.
- **Search:** In tasks.js, `applyClientFilters()` reads `searchInput.value`, filters `allTasks` where `title` or `description` contains that string (case-insensitive).
- **Status:** Reads `statusFilter.value` (`"all"`, `"completed"`, `"pending"`), keeps only tasks where `task.completed` matches.
- **Sort:** Reads `sortSelect.value` (e.g. `"-created_at"`, `"title"`). Sorts the filtered array by that field; minus means descending. Then `renderTaskList()` redraws the table.

So filtering and sorting are **client-side** on the `allTasks` array. One API call loads everything; the rest is JavaScript.

### How It *Could* Work With GET Parameters (Server-Side, for Learning)
If you wanted the **backend** to filter and sort, you would:
- Read `request.GET` in the view (or use DRF filter backends).
- Example: `status = request.GET.get('status')` then `if status == 'completed': queryset = queryset.filter(completed=True)`.
- Example: `order = request.GET.get('order')` then `if order == 'newest': queryset = queryset.order_by('-created_at')`.
- The frontend would then call e.g. `GET /api/tasks/?status=completed&order=newest` and the API would return only the filtered/sorted list. In our project we didn’t implement this; we did it all in the frontend.

---

## 10. COMPLETE USER FLOW

### User Creates a Task
1. User fills title (required), description (optional), completed (checkbox), clicks “Create Task”.
2. JS: `handleFormSubmit` → prevent default, validate form, build `payload = { title, description, completed }`.
3. JS: `createTask(payload)` → `POST /api/tasks/` with JSON body and CSRF header.
4. Backend: DRF receives POST, TaskSerializer validates, creates new Task row in DB, returns 201 + JSON of new task.
5. JS: Pushes new task into `allTasks`, calls `renderTaskList()`, resets form, shows success alert. Table updates without reload.

### User Marks a Task Complete
1. User clicks the checkbox in the task row.
2. JS: `handleTableClick` sees `.task-toggle` → `updateTask(id, { completed: true })` → `PATCH /api/tasks/<id>/` with JSON.
3. Backend: DRF loads task, updates `completed`, saves to DB, returns updated task JSON.
4. JS: Updates that task in `allTasks`, calls `renderTaskList()`. Row and badge show “Completed”.

### User Edits a Task
1. User clicks “Edit”. JS: `populateFormForEdit(task)` fills the form and shows “Edit Task” / “Save Changes” / “Cancel”.
2. User changes fields and clicks “Save Changes”. JS: `handleFormSubmit` sees hidden `task-id` → `updateTask(id, payload)` → `PATCH /api/tasks/<id>/`.
3. Backend: Same as above — load, update, save, return JSON.
4. JS: Replaces task in `allTasks`, `renderTaskList()`, reset form, success alert.

### User Deletes a Task
1. User clicks “Delete”. JS opens Bootstrap modal and stores `taskToDeleteId`.
2. User clicks “Delete” in modal. JS: `deleteTask(taskToDeleteId)` → `DELETE /api/tasks/<id>/`.
3. Backend: DRF loads task, calls `.delete()` on it; row removed from DB; returns 204.
4. JS: Removes task from `allTasks`, `renderTaskList()`, closes modal, success alert.

### User Filters Tasks
1. User types in search box or changes status/sort dropdowns.
2. JS: `input`/`change` triggers debounced `renderTaskList()`.
3. `applyClientFilters(allTasks)` returns a new filtered and sorted array (no API call).
4. Table body is cleared and refilled with rows for that array. `allTasks` itself is unchanged.

---

## 11. IMPORTANT DJANGO CONCEPTS USED

### MVC vs MVT
- **MVC:** Model (data), View (logic), Controller (request handling).
- **Django is often described as MVT:** Model (data), View (request handler + logic), Template (presentation). So “View” in Django is closer to “Controller + part of View” in MVC; the Template is the “View” (what the user sees).
- In **our** project: **Model** = Task. **View** = TaskViewSet (returns JSON) and TemplateView (returns HTML). **Template** = index.html (structure only; data view is built in JS).

### Django ORM
- Lets you use Python (e.g. `Task.objects.all()`, `Task.objects.filter(completed=True)`) instead of writing SQL. Django generates SQL and maps rows to model instances.

### URL Routing
- `urlpatterns` list: each `path()` maps a URL pattern to a view (or include another urlconf). First match wins. So `/api/tasks/` is handled by the router in tasks/urls.py, which maps to TaskViewSet actions.

### Template Engine
- Renders HTML from templates + context. Supports variables `{{ }}`, tags `{% %}`, and inheritance. We use it only to serve the initial page and static URLs.

### Forms
- In classic Django you’d use `ModelForm` and post to a view. Here we use a plain HTML form and handle submit in JavaScript, sending JSON to the API. So “forms” are UI; validation and persistence are in the API (serializer + model).

### CSRF Protection
- Django rejects POST/PUT/PATCH/DELETE without a valid CSRF token to avoid cross-site request forgery. We send the token from the cookie in the `X-CSRFToken` header so the API accepts our fetch requests.

---

## 12. INTERVIEW EXPLANATION SECTION

**Q: Explain your Django project.**  
“It’s a task manager with a REST API built using Django and Django REST Framework. The backend exposes task CRUD at `/api/tasks/` and returns JSON. The frontend is a single Bootstrap page; JavaScript loads and updates tasks via that API, with client-side search, filter, and sort. So the backend is purely an API; the UI is a client that consumes it.”

**Q: How does Django handle requests?**  
“A request comes in; middleware runs; then URL routing matches the path to a view. For `/` we use a TemplateView that renders the HTML page. For `/api/tasks/` we use a DRF ViewSet that runs a query, serializes the result to JSON, and returns it. So the same Django app serves both the HTML and the API depending on the URL.”

**Q: How does Django interact with the database?**  
“Through the ORM. We define a Task model in Python; Django creates and updates the table via migrations. In the ViewSet we use `Task.objects.all()` to fetch rows; DRF and the serializer turn those into JSON. Create/update/delete go through the serializer’s save() or the model’s delete(), and the ORM runs the right INSERT/UPDATE/DELETE.”

**Q: What is Django ORM?**  
“The Object-Relational Mapper: we work with Python classes and methods like `Task.objects.all()` or `Task.objects.filter(completed=True)` instead of writing SQL. Django translates that to SQL for the database we configured (here SQLite) and maps rows back to model instances.”

**Q: How did you implement filtering and sorting?**  
“In this project I did it in the frontend. The API returns all tasks once. JavaScript keeps them in an array and applies search (title/description), status (completed/pending), and sort (newest/oldest, title A–Z/Z–A) in memory, then re-renders the table. So no extra API calls for filter/sort. I could also implement server-side filtering by reading query parameters in the view and filtering the queryset, or by using DRF’s filter backends.”

---

## 13. POSSIBLE IMPROVEMENTS

- **Django REST Framework:** Already used. You could add pagination (e.g. `PageNumberPagination`) so the API returns e.g. 10 tasks per page.
- **Authentication:** Add login (e.g. session auth or JWT with djangorestframework-simplejwt) so only logged-in users can create/edit/delete tasks.
- **Pagination:** In DRF, add a pagination class so `GET /api/tasks/` returns a page of results and a `next` link instead of all tasks at once.
- **AJAX:** The project already uses fetch() (AJAX-style). You could add loading spinners or disable buttons during requests (partially there) for better UX.
- **React frontend:** Replace the current HTML+JS with a React app that still calls the same `/api/tasks/` endpoints. Backend stays the same.
- **Deployment:** Use a production WSGI server (e.g. Gunicorn), a reverse proxy (e.g. Nginx), switch to PostgreSQL, set DEBUG=False and proper ALLOWED_HOSTS and SECRET_KEY, serve static files via CDN or Nginx.

---

## 14. LEARNING NOTES (Core Backend Concepts)

### Request–Response
- Browser sends HTTP request (method + URL + headers + optional body). Server runs code, then sends HTTP response (status + headers + body). In our case the body is either HTML (for `/`) or JSON (for `/api/tasks/`).

### REST
- REST is a style for APIs: resources (e.g. “tasks”) have URLs; HTTP methods mean actions (GET = read, POST = create, PATCH = update, DELETE = delete). Our API is RESTful: one resource `/api/tasks/` and `/api/tasks/<id>/` with standard methods.

### API
- Application Programming Interface. Here the “interface” is HTTP + JSON: the frontend “programs” against the backend by sending and receiving JSON over specific URLs.

### CRUD
- Create (POST), Read (GET one or list), Update (PUT/PATCH), Delete (DELETE). Our ViewSet provides all four for the Task resource.

### Serialization
- Converting in-memory objects (Task instances) to a format that can be sent over the network (JSON). Deserialization is the reverse (JSON → validation → Task). TaskSerializer does both.

### Middleware
- Code that runs around every request/response (e.g. security, sessions, CSRF). Django runs middleware in order before the view and after the view.

### Migrations
- Versioned, repeatable changes to the database schema. You change the model → makemigrations → migrate. That way the DB stays in sync with your code across environments.

---

You can use this guide to understand every part of This Task Manager project
