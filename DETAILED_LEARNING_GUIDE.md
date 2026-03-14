# Task Manager — Detailed Learning Guide for Beginners

A step-by-step guide to understand every part of your Task Manager project. Written for someone new to backend development.

---

## 1. PROJECT OVERVIEW

### What This Project Does
This is a **Task Manager** web application. Users can add tasks (with a title and optional description), mark them complete, edit them, delete them, and filter or sort the list. The backend is a **REST API** that stores tasks in a database; the browser uses a single **HTML page** and **JavaScript** to talk to that API and update the screen without full page reloads.

### Purpose and Problem It Solves
- **Learning:** You see how a real backend (Django + Django REST Framework) exposes data as JSON and how a frontend consumes it.
- **Practical use:** You have a working app where data is stored in a database and can be shared across devices (same API could serve a mobile app later).

### Main Features

| Feature | What the user does | What happens |
|--------|---------------------|--------------|
| **Creating tasks** | Fills title (required), description (optional), completed switch; clicks "Create Task". | JavaScript sends the data to the API with `POST /api/tasks/`. The server saves a new row in the database and returns the new task as JSON. The table updates without reloading the page. |
| **Editing tasks** | Clicks "Edit" on a row, changes the form, clicks "Save Changes". | JavaScript sends the updated data with `PATCH /api/tasks/<id>/`. The server updates that row and returns the task as JSON. The list is redrawn. |
| **Deleting tasks** | Clicks "Delete", then confirms in the modal. | JavaScript sends `DELETE /api/tasks/<id>/`. The server deletes that row. The frontend removes the task from its list and redraws the table. |
| **Marking tasks completed** | Clicks the checkbox next to a task. | JavaScript sends `PATCH /api/tasks/<id>/` with `{ "completed": true }` or `false`. The server updates the row. The row and badge update on screen. |
| **Filtering tasks** | Uses the dropdown: "All statuses", "Completed", or "Pending". | No new request to the server. JavaScript filters the list it already has in memory and redraws the table. |
| **Sorting tasks** | Uses the dropdown: "Newest first", "Oldest first", "Title A–Z", "Title Z–A". | No new request. JavaScript sorts the list in memory and redraws the table. |
| **Search** | Types in the search box (title or description). | No new request. JavaScript filters the in-memory list by the typed text and redraws the table. |

So: **create, edit, delete, and mark complete** go through the API and database; **filter, sort, and search** are done in the browser on the data already loaded.

---

## 2. TECHNOLOGIES USED

### Python
- **Role:** The language everything is written in. Django and your app code (models, views, settings) are Python.
- **Why:** Django is a Python framework. You get a huge ecosystem (libraries, tutorials) and clear syntax.

### Django
- **Role:** The web framework. It handles HTTP requests, URL routing, database access (ORM), configuration, and security (e.g. CSRF).
- **Why:** You don’t build a server from scratch. Django gives you a standard structure (projects, apps, settings) and best practices.

### Django ORM (Object-Relational Mapper)
- **Role:** Lets you work with the database using Python (e.g. `Task.objects.all()`) instead of writing SQL. Django turns that into SQL for the database you use.
- **Why:** Fewer bugs, easier to read, and you can switch databases (e.g. from SQLite to PostgreSQL) without rewriting queries.

### Django REST Framework (DRF)
- **Role:** Turns your Django models into a REST API. It provides serialization (Python ↔ JSON), view sets (list, create, retrieve, update, delete), and URL routing for the API.
- **Why:** Without DRF you’d write a view per endpoint and manual JSON. With DRF, one `ModelViewSet` and one `ModelSerializer` give you the full CRUD API.

### HTML Templates
- **Role:** Django’s way to send HTML. In this project we use **one** template (`index.html`) that defines the page structure (navbar, form, table, modal). It does **not** loop over tasks; the task list is built by JavaScript from API data.
- **Why:** We still use Django to serve the initial HTML and to generate correct paths for CSS/JS (`{% static %}`).

### Bootstrap / CSS
- **Role:** Bootstrap (loaded from CDN) provides layout, buttons, forms, table, modal. Our own `tasks.css` adds a few styles (e.g. card radius, table hover).
- **Why:** Fast, good-looking, responsive UI without writing lots of custom CSS.

### SQLite Database
- **Role:** Stores all tasks in a single file (`db.sqlite3`). Django talks to it through the ORM.
- **Why:** No separate database server; ideal for learning and small projects. You can switch to PostgreSQL or MySQL later by changing settings.

### How They Work Together

```
Python runs Django
    → Django uses ORM to read/write SQLite
    → DRF uses the same Task model and TaskSerializer to expose JSON at /api/tasks/
    → The template sends the initial HTML; Bootstrap styles it
    → JavaScript in the browser calls /api/tasks/ and updates the page
```

So: **Python + Django + ORM + SQLite** = backend and database; **DRF** = REST API layer; **HTML + Bootstrap + JS** = frontend that uses that API.

---

## 3. DJANGO PROJECT STRUCTURE

```
task_manager_api/
├── manage.py
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── tasks/
│   ├── __init__.py
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── admin.py
│   ├── apps.py
│   ├── templates/
│   │   └── index.html
│   └── migrations/
│       └── 0001_initial.py
├── static/
│   ├── css/
│   │   └── tasks.css
│   └── js/
│       └── tasks.js
├── templates/          (optional project-level)
└── db.sqlite3
```

### Purpose of Each Part

| File or folder | Purpose |
|----------------|--------|
| **manage.py** | Entry point for Django. It sets `DJANGO_SETTINGS_MODULE` to `config.settings` and runs commands like `runserver`, `migrate`, `makemigrations`, `shell`. You run it from the project root. |
| **config/** | Project configuration package (not an app with models). |
| **config/settings.py** | Central config: INSTALLED_APPS (including `rest_framework` and `tasks`), DATABASES (SQLite), TEMPLATES (where to find HTML), STATIC files, ROOT_URLCONF, middleware. |
| **config/urls.py** | Root URL routing: which path goes to which view or app. Here: `/admin/`, `api/` (to tasks), and `''` (home page). |
| **config/wsgi.py, asgi.py** | Entry points for production servers (e.g. Gunicorn, Uvicorn). |
| **tasks/** | One Django “app”: one unit of functionality (task CRUD). |
| **tasks/models.py** | Defines the `Task` model (database table). |
| **tasks/views.py** | Defines `TaskViewSet` (DRF). Handles list, create, retrieve, update, delete for tasks. |
| **tasks/serializers.py** | Defines how a `Task` is converted to/from JSON (TaskSerializer). |
| **tasks/urls.py** | Registers the TaskViewSet with the DRF router so we get `/api/tasks/` and `/api/tasks/<id>/`. |
| **tasks/admin.py** | Optional: register models in Django admin. (Task is not registered in your code; you could add it.) |
| **tasks/templates/** | Templates that belong to this app. Django finds `index.html` here (or in project TEMPLATES DIRS). |
| **tasks/migrations/** | Files that describe database changes (e.g. create Task table). Applied with `migrate`. |
| **static/** | Your CSS and JS. Served at `/static/` (e.g. `/static/js/tasks.js`). |
| **db.sqlite3** | SQLite database file. Created after first `migrate`. |

### Why Django Is Structured This Way
- **Separation:** Config (config/) vs business logic (tasks app). Each app can have its own models, views, URLs, templates.
- **Reuse:** The `tasks` app could be reused in another project.
- **Clarity:** New developers know where to find settings, URLs, models, and API routes.

---

## 4. DJANGO REQUEST → RESPONSE FLOW

### When the user opens the site (GET /)

```
1. Browser sends:  GET http://127.0.0.1:8000/

2. Django receives the request
   → Middleware runs (security, session, CSRF, etc.)

3. URL routing (config/urls.py)
   → path('', TemplateView.as_view(template_name='index.html'))  matches
   → Django calls TemplateView to handle the request

4. TemplateView
   → Loads index.html (from tasks/templates/ or project templates/)
   → Renders it (only static structure; no task list from DB)
   → Returns an HTML response

5. Browser receives HTML
   → Parses it, loads Bootstrap (CDN), tasks.css, tasks.js
   → Fires DOMContentLoaded → JavaScript init() runs → fetchTasks() is called
```

At this point **no** task has been loaded from the database. The page is just the shell.

### When the frontend loads tasks (GET /api/tasks/)

```
1. JavaScript runs:  fetch('/api/tasks/', { method: 'GET' })

2. Browser sends:  GET http://127.0.0.1:8000/api/tasks/

3. URL routing (config/urls.py)
   → path('api/', include('tasks.urls'))  matches
   → Remaining path "tasks/" is passed to tasks.urls

4. tasks/urls.py (DRF router)
   → Router matches "tasks/" and method GET
   → Calls TaskViewSet.list()

5. TaskViewSet.list()
   → Uses queryset: Task.objects.all()
   → Django ORM runs:  SELECT * FROM tasks_task;
   → Returns a QuerySet of Task instances

6. TaskSerializer
   → Converts each Task to a dict (id, title, description, completed, created_at)
   → DRF converts that to a JSON array

7. Response
   → HTTP 200, body: [ {"id": 1, "title": "...", "description": "...", "completed": false, "created_at": "..."}, ... ]
   → JavaScript receives this and stores it in allTasks, then renders the table
```

### Simple text diagram: request flow

```
┌──────────────┐     GET /      ┌─────────────────────────────────────────┐
│   Browser    │ ──────────────►│  Django (config.urls)                     │
│              │                │    ''  → TemplateView → index.html        │
│  (user       │                │    api/ → tasks.urls                      │
│   visits     │                └─────────────────────────────────────────┘
│   page)      │                              │
└──────────────┘                              │ GET /api/tasks/
       │                                      ▼
       │                     ┌─────────────────────────────────────────┐
       │                     │  tasks.urls (DRF router)                 │
       │                     │    GET tasks/ → TaskViewSet.list()       │
       │                     └─────────────────────────────────────────┘
       │                                      │
       │                                      ▼
       │                     ┌─────────────────────────────────────────┐
       │                     │  TaskViewSet                             │
       │                     │    queryset = Task.objects.all()         │
       │                     │    TaskSerializer → JSON               │
       │                     └─────────────────────────────────────────┘
       │                                      │
       │                                      ▼
       │                     ┌─────────────────────────────────────────┐
       │                     │  SQLite (db.sqlite3)                     │
       │                     │    SELECT * FROM tasks_task;            │
       │                     └─────────────────────────────────────────┘
       │
       │  HTML (for GET /)   or   JSON array (for GET /api/tasks/)
       ▼
┌──────────────┐
│   Browser    │  If GET /api/tasks/ → JS updates table from JSON
│   displays   │  If GET /          → JS runs and then fetches /api/tasks/
│   result     │
└──────────────┘
```

---

## 5. DATABASE MODEL EXPLANATION

### Task model (tasks/models.py)

```python
class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
```

### What each field represents

| Field | Type | Represents | Why this type |
|-------|------|------------|----------------|
| **id** | (auto) | Unique identifier for each task. | Django adds a primary key (BigAutoField) so every row is unique. |
| **title** | CharField(max_length=255) | Short text, the task name. | CharField = limited length; 255 is enough for a title and keeps the DB efficient. |
| **description** | TextField(blank=True) | Longer text, optional details. | TextField = no length limit. blank=True = form/API can omit it. |
| **completed** | BooleanField(default=False) | Whether the task is done. | Only two states (true/false). default=False so new tasks start as not completed. |
| **created_at** | DateTimeField(auto_now_add=True) | When the task was created. | auto_now_add=True: Django sets it on first save and does not change it on later saves. |

### How Django turns the model into a table
- Django uses the **app label** and **model name** for the table: app `tasks`, model `Task` → table **tasks_task**.
- Each field becomes a column:
  - CharField → VARCHAR(255)
  - TextField → TEXT
  - BooleanField → INTEGER (0/1) or BOOLEAN depending on DB
  - DateTimeField → DATETIME
  - id → primary key, auto-increment
- **Migrations** record these definitions. When you run `migrate`, Django runs the corresponding SQL (CREATE TABLE, etc.) on your database.

### Migrations

- **What they are:** Migration files are Python that describe changes to the database schema (add/remove/change tables or columns). They live in `tasks/migrations/`.
- **Why they’re required:** Your model is Python; the database only understands SQL. Migrations are the bridge: “add a Task table with these columns.” They are versioned so you can replay them on another machine or in production.
- **How Django updates the schema:**
  1. You change `models.py` (e.g. add a field).
  2. Run `python manage.py makemigrations` → Django creates a new migration file.
  3. Run `python manage.py migrate` → Django runs pending migrations and executes the SQL (e.g. CREATE TABLE or ALTER TABLE).

Never edit migration files by hand unless you know what you’re doing; let Django generate them.

---

## 6. DJANGO ORM EXPLANATION

The project uses the ORM through the **Task** model and through DRF’s use of the ViewSet’s `queryset`.

### Task.objects.all()
- **Meaning:** “Return all rows from the tasks_task table as Task instances.”
- **Behind the scenes:** Something like `SELECT * FROM tasks_task;`
- **Used in:** TaskViewSet’s `queryset = Task.objects.all()` so list/retrieve have a base set of rows to work with.

### Task.objects.filter(completed=True)
- **Meaning:** “Return only tasks where completed is True.”
- **Behind the scenes:** `SELECT * FROM tasks_task WHERE completed = 1;`
- **Note:** In this project the ViewSet doesn’t filter by status; the frontend does that in memory. You could add filtering in the ViewSet later (e.g. with `request.GET` or DRF filters).

### Task.objects.order_by('-created_at')
- **Meaning:** “Return tasks sorted by created_at descending (newest first).”
- **Behind the scenes:** `SELECT * FROM tasks_task ORDER BY created_at DESC;`
- **Note:** You could set `queryset = Task.objects.all().order_by('-created_at')` in the ViewSet so the API always returns newest first. The frontend then re-sorts for “oldest” or “title” in JavaScript.

### task.save()
- **Meaning:** Insert a new row or update an existing one. If the instance has no `id`, Django does INSERT; if it has an `id`, Django does UPDATE.
- **Behind the scenes:** `INSERT INTO tasks_task (...) VALUES (...);` or `UPDATE tasks_task SET ... WHERE id = ...;`
- **Used in:** DRF’s create/update call `serializer.save()`, which uses the model’s `save()`.

### task.delete()
- **Meaning:** Remove this row from the table.
- **Behind the scenes:** `DELETE FROM tasks_task WHERE id = ...;`
- **Used in:** TaskViewSet’s destroy action when the client sends `DELETE /api/tasks/<id>/`.

So in this project, the ORM is used by DRF: the ViewSet’s queryset and the serializer’s save/delete trigger the actual SQL. You don’t write raw SQL.

---

## 7. VIEW LOGIC EXPLANATION

In this project, “views” that handle task data are **DRF ViewSet actions**, not classic Django views that return HTML. They return **JSON**.

### TaskViewSet (tasks/views.py)

```python
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
```

- **queryset:** All Task rows. DRF uses it for list (and to look up one task by id for retrieve/update/delete).
- **serializer_class:** Converts Task instances to/from JSON.

### What each “view” (action) does

| Request | Action | What it receives | DB operation | Response |
|--------|--------|-------------------|--------------|----------|
| GET /api/tasks/ | list | No body | Task.objects.all() | 200 + JSON array of tasks |
| POST /api/tasks/ | create | JSON body (title, description?, completed?) | Validate → create new Task → save() | 201 + JSON of new task |
| GET /api/tasks/5/ | retrieve | id=5 from URL | Task.objects.get(pk=5) | 200 + JSON of that task |
| PATCH /api/tasks/5/ | partial_update | id=5 + JSON body (only sent fields) | Load task, update fields, save() | 200 + JSON of updated task |
| PUT /api/tasks/5/ | update | id=5 + full JSON body | Same as partial but expects full representation | 200 + JSON |
| DELETE /api/tasks/5/ | destroy | id=5 from URL | Load task, task.delete() | 204 No Content |

### Creating tasks
- Client: POST /api/tasks/ with body like `{"title": "Learn Django", "description": "...", "completed": false}`.
- DRF calls TaskSerializer with that data → validation (e.g. title required).
- serializer.save() creates a new Task and inserts a row.
- Response: 201 and the new task as JSON (including id and created_at).

### Updating tasks
- Client: PATCH /api/tasks/5/ with e.g. `{"title": "Updated title"}` or `{"completed": true}`.
- DRF loads the task with id=5, passes request data to the serializer for partial update, then save().
- Response: 200 and the updated task as JSON.

### Deleting tasks
- Client: DELETE /api/tasks/5/.
- DRF loads the task with id=5 and calls .delete().
- Response: 204 No Content (no body).

### Filtering, sorting, searching in this project
- **In the backend:** The ViewSet does **not** filter, sort, or search. It always returns all tasks (and doesn’t set a default order in the code you have).
- **In the frontend:** JavaScript keeps all tasks in `allTasks`. When the user changes search, status filter, or sort dropdown, `applyClientFilters(allTasks)` filters and sorts that array and `renderTaskList()` redraws the table. So filtering, sorting, and search are **client-side**.

---

## 8. FILTERING AND SORTING LOGIC

### How it works in this project (frontend)

- The API does **not** use query parameters. GET /api/tasks/ returns **all** tasks.
- **Filtering and sorting** are done in the browser in `static/js/tasks.js`:

  - **Search:** User types in the search box → `applyClientFilters()` filters `allTasks` by whether `title` or `description` contains the text (case-insensitive).
  - **Status:** User selects “All statuses” / “Completed” / “Pending” → filter by `task.completed`.
  - **Sort:** User selects “Newest first” / “Oldest first” / “Title A–Z” / “Title Z–A” → sort the filtered array by `created_at` or `title` (with direction), then redraw the table.

So there are **no** URLs like `?status=completed` or `?order=newest` in the current backend. Everything is in JavaScript on the already-loaded list.

### How it could work with GET parameters (for learning)

If you wanted the **backend** to filter and sort, you would:

1. **Read the request:** In a normal Django view you’d use `request.GET.get('status')` and `request.GET.get('order')`. In DRF you can use filter backends or override `get_queryset()` and use `self.request.query_params.get('status')`.
2. **Modify the queryset:**
   - `?status=completed` → `queryset = queryset.filter(completed=True)`
   - `?status=pending` → `queryset = queryset.filter(completed=False)`
   - `?order=newest` → `queryset = queryset.order_by('-created_at')`
   - `?order=oldest` → `queryset = queryset.order_by('created_at')`
3. **Frontend:** Would then call e.g. `GET /api/tasks/?status=completed&order=newest` and the API would return only the filtered/sorted list.

Example (conceptual) in a ViewSet:

```python
def get_queryset(self):
    qs = Task.objects.all()
    status = self.request.query_params.get('status')
    if status == 'completed':
        qs = qs.filter(completed=True)
    elif status == 'pending':
        qs = qs.filter(completed=False)
    order = self.request.query_params.get('order', 'newest')
    if order == 'oldest':
        qs = qs.order_by('created_at')
    else:
        qs = qs.order_by('-created_at')
    return qs
```

So: **request.GET** (or DRF’s **request.query_params**) holds the query string; you use it to filter and order the queryset before returning the response.

---

## 9. TEMPLATE SYSTEM EXPLANATION

### How Django templates work in this project

- We use **one** template: `index.html`. It is rendered by **TemplateView** with **no** task-related context. So there are no `{{ task.title }}` or `{% for task in tasks %}` for task data.
- The template provides:
  - The HTML structure: navbar, form (title, description, completed, submit/cancel), table (header + empty tbody), delete modal, alert container.
  - **Template tags:** `{% load static %}` and `{% static 'css/tasks.css' %}` / `{% static 'js/tasks.js' %}` so Django outputs the correct `/static/...` URLs.

### Template rendering
- TemplateView loads the template, optionally passes a context (we pass none for task data), and returns the rendered HTML. So “rendering” here = one pass over index.html to resolve `{% static %}` and send HTML.

### Passing context data
- In a normal Django view you’d pass a dict: `context = {'tasks': tasks}` and use `{% for task in tasks %}` in the template. Here we don’t pass tasks; the task list is loaded later by JavaScript from the API.

### Loops and displaying tasks
- Task rows are **not** rendered by the template. They are created in JavaScript: `fetchTasks()` gets JSON, stores it in `allTasks`, and `renderTaskList()` builds table rows (e.g. with `renderTaskRow(task)`) and appends them to the table body.

### HTML forms
- The form in the template is plain HTML with `id="task-form"`. It is **not** a Django ModelForm that posts to a Django view. On submit, JavaScript calls `event.preventDefault()` and sends the data via **fetch()** to the API (POST or PATCH) as JSON.

### CSRF protection
- Django requires a CSRF token for POST/PUT/PATCH/DELETE. The token is in a cookie. Our JavaScript reads it with `getCsrfToken()` and sends it in the **X-CSRFToken** header on every mutating request. So the form is “submitted” by JS, and Django’s CSRF middleware accepts the request because of the header.

### How the frontend talks to the backend
- **All** task data goes over the **REST API** as JSON:
  - Load list: GET /api/tasks/ → JSON array → `allTasks` → table drawn by JS.
  - Create: form → POST /api/tasks/ with JSON → response added to `allTasks` → table redrawn.
  - Edit: form → PATCH /api/tasks/<id>/ with JSON → response used to update `allTasks` → table redrawn.
  - Toggle complete: checkbox → PATCH /api/tasks/<id>/ with `{"completed": true/false}` → update `allTasks` → table redrawn.
  - Delete: modal confirm → DELETE /api/tasks/<id>/ → remove from `allTasks` → table redrawn.

So: **template** = static page structure; **backend** = REST API; **communication** = fetch() + JSON + X-CSRFToken header.

---

## 10. COMPLETE USER ACTION FLOW

### User creates a task
1. User fills title (required), description (optional), completed (checkbox), clicks “Create Task”.
2. JS: `handleFormSubmit` runs, prevents default submit, validates form, builds `payload = { title, description, completed }`.
3. JS: `createTask(payload)` → `POST /api/tasks/` with JSON and `X-CSRFToken` header.
4. Backend: DRF creates a new Task (serializer validates, then save() → INSERT).
5. Backend returns 201 and JSON of the new task.
6. JS: Pushes that task into `allTasks`, calls `renderTaskList()`, resets form, shows success alert. Table updates.

### User edits a task
1. User clicks “Edit” on a row. JS: `populateFormForEdit(task)` fills the form and shows “Edit Task” / “Save Changes” / “Cancel”.
2. User changes fields and clicks “Save Changes”. JS: `handleFormSubmit` sees hidden task-id → `updateTask(id, payload)` → `PATCH /api/tasks/<id>/` with JSON.
3. Backend: DRF loads task, updates fields, save() → UPDATE. Returns 200 + JSON.
4. JS: Replaces that task in `allTasks`, `renderTaskList()`, reset form, success alert.

### User deletes a task
1. User clicks “Delete”. JS sets `taskToDeleteId` and opens the Bootstrap modal.
2. User clicks “Delete” in the modal. JS: `deleteTask(taskToDeleteId)` → `DELETE /api/tasks/<id>/`.
3. Backend: DRF loads task, calls `.delete()` → DELETE row. Returns 204.
4. JS: Removes task from `allTasks`, `renderTaskList()`, closes modal, success alert.

### User marks a task completed
1. User clicks the row’s checkbox. JS: `handleTableClick` sees `.task-toggle` → `updateTask(id, { completed: true })` → `PATCH /api/tasks/<id>/`.
2. Backend: DRF updates `completed`, save() → UPDATE. Returns 200 + JSON.
3. JS: Updates that task in `allTasks`, `renderTaskList()`. Row and badge show “Completed”.

### User filters tasks
1. User types in the search box or changes status/sort dropdowns.
2. JS: `input` or `change` triggers debounced `renderTaskList()`.
3. `applyClientFilters(allTasks)` returns a new filtered and sorted array (no API call).
4. Table body is cleared and filled with rows for that array. `allTasks` is unchanged.

---

## 11. DJANGO CORE CONCEPTS USED

### MVC vs MVT
- **MVC:** Model (data), View (what user sees), Controller (handles input and logic).
- **Django is often described as MVT:** Model (data), View (request handler + logic), Template (what user sees). So Django’s “View” is closer to a controller; the Template is the “view” in the display sense.
- **In this project:** Model = Task. View = TaskViewSet (returns JSON) and TemplateView (returns HTML). Template = index.html (structure only; data “view” is the table built by JS).

### Django ORM
- You use Python (e.g. `Task.objects.all()`, `.filter()`, `.order_by()`) instead of SQL. Django generates SQL and maps rows to model instances.

### URL routing
- `urlpatterns` in `config/urls.py` and `tasks/urls.py` map paths to views (or include another urlconf). First match wins. So `/` goes to TemplateView, `/api/tasks/` goes to the DRF router → TaskViewSet.

### Templates
- HTML with variables `{{ }}` and tags `{% %}`. Rendered with a context. Here we use one template for the page shell; no task context.

### Forms
- In classic Django you’d use ModelForm and POST to a view. Here we use a normal HTML form and submit via JavaScript as JSON to the API. Validation and saving are in the API (serializer + model).

### CSRF protection
- Django blocks unsafe methods (POST, etc.) without a valid CSRF token. We send the token from the cookie in the `X-CSRFToken` header so our fetch() requests are allowed.

---

## 12. INTERVIEW PREPARATION SECTION

**Q: Explain your Django project.**  
“It’s a task manager with a REST API built with Django and Django REST Framework. The backend exposes full CRUD for tasks at `/api/tasks/` and returns JSON. The frontend is a single Bootstrap page; JavaScript loads and updates tasks via that API. Filtering, sorting, and search are done in the frontend on the loaded list, so the backend stays a simple REST API.”

**Q: How does Django handle requests?**  
“A request hits Django; middleware runs; then URL routing matches the path to a view. For `/` we use a TemplateView that returns the HTML page. For `/api/tasks/` we use a DRF ViewSet that runs a queryset, serializes to JSON, and returns it. So the same project serves both the web page and the API.”

**Q: What is Django ORM?**  
“It’s the Object-Relational Mapper: we use Python like `Task.objects.all()` or `Task.objects.filter(completed=True)` instead of writing SQL. Django translates that to SQL for our database (SQLite) and maps rows back to Task instances.”

**Q: How does your project interact with the database?**  
“Through the ORM. The Task model defines the table. The ViewSet uses `Task.objects.all()` for listing; create and update go through the serializer’s save(), which runs INSERT or UPDATE; delete runs task.delete(). I don’t write raw SQL.”

**Q: How did you implement filtering and sorting?**  
“In this project I did it in the frontend. The API returns all tasks once. JavaScript keeps them in an array and applies search (title/description), status (completed/pending), and sort (newest/oldest, title A–Z/Z–A) in memory, then re-renders the table. So no extra API calls. I could also add server-side filtering using query parameters and filter/order_by on the queryset in the ViewSet.”

---

## 13. POSSIBLE IMPROVEMENTS

- **Django REST Framework API:** Already in use. You could add pagination (e.g. PageNumberPagination) so the API returns e.g. 10 tasks per page.
- **User authentication:** Add login (session auth or JWT with djangorestframework-simplejwt) so only logged-in users can create/edit/delete, and tasks can be scoped per user.
- **Pagination:** In DRF, set a pagination class so GET /api/tasks/ returns a page of results and a `next` link instead of all tasks at once.
- **AJAX / dynamic updates:** The app already uses fetch() (AJAX). You could add more polish: loading states, optimistic updates, or WebSockets for live updates.
- **React frontend:** Replace the current HTML+JS with a React app that still calls the same `/api/tasks/` endpoints. Backend stays unchanged.
- **Deployment:** Use Gunicorn (or similar) as WSGI server, Nginx as reverse proxy, PostgreSQL in production, DEBUG=False, proper ALLOWED_HOSTS and SECRET_KEY, and serve static files via Nginx or a CDN.
- **Security:** Use environment variables for SECRET_KEY, add rate limiting, ensure HTTPS in production, and keep dependencies updated.

---

## 14. VISUAL FLOW DIAGRAMS

### 1. Request flow (high level)

```
    Browser                    Django                      Database
       |                          |                            |
       |  GET /                   |                            |
       |------------------------->|                            |
       |                          |  TemplateView              |
       |                          |  render index.html         |
       |  HTML                    |                            |
       |<-------------------------|                            |
       |                          |                            |
       |  GET /api/tasks/         |                            |
       |------------------------->|  TaskViewSet.list()        |
       |                          |--------------------------->|  SELECT *
       |                          |<---------------------------|  FROM tasks_task
       |                          |  serialize to JSON         |
       |  JSON [ {...}, ... ]     |                            |
       |<-------------------------|                            |
       |                          |                            |
       |  POST /api/tasks/        |                            |
       |  Body: {"title":"..."}   |  TaskViewSet.create()      |
       |------------------------->|--------------------------->|  INSERT
       |                          |<---------------------------|
       |  201 + JSON new task     |                            |
       |<-------------------------|                            |
```

### 2. Database interaction (ORM → SQL)

```
    Python (ViewSet/Serializer)     Django ORM              SQLite
           |                            |                      |
           |  Task.objects.all()        |                      |
           |--------------------------->|  SELECT *            |
           |                            |  FROM tasks_task;    |
           |                            |--------------------->|
           |                            |<---------------------|  rows
           |  QuerySet [Task, Task,…]   |                      |
           |<---------------------------|                      |
           |                            |                      |
           |  serializer.save()        |  INSERT INTO         |
           |  (create)                 |  tasks_task (...)    |
           |--------------------------->|--------------------->|
           |                            |<---------------------|  new id
           |  Task instance            |                      |
           |<---------------------------|                      |
           |                            |                      |
           |  task.delete()            |  DELETE FROM         |
           |                           |  tasks_task          |
           |--------------------------->|  WHERE id = ?;      |
           |                            |--------------------->|
```

### 3. Frontend ↔ backend communication

```
    User action          JavaScript (tasks.js)           Backend (DRF)
         |                        |                            |
    [Create task]                 |                            |
         |  submit form           |  createTask(payload)       |
         |----------------------->|  POST /api/tasks/         |
         |                        |  Body: JSON                |
         |                        |  Header: X-CSRFToken       |
         |                        |--------------------------->|  create()
         |                        |<---------------------------|  201 + JSON
         |                        |  allTasks.unshift(task)    |
         |                        |  renderTaskList()          |
         |  table updates         |                            |
         |<-----------------------|                            |
         |                        |                            |
    [Click checkbox]              |                            |
         |  toggle complete       |  updateTask(id,            |
         |----------------------->|    {completed: true})      |
         |                        |  PATCH /api/tasks/<id>/    |
         |                        |--------------------------->|  partial_update()
         |                        |<---------------------------|  200 + JSON
         |                        |  update allTasks[idx]     |
         |                        |  renderTaskList()         |
         |  row shows Completed   |                            |
         |<-----------------------|                            |
         |                        |                            |
    [Change filter dropdown]      |                            |
         |  status = "completed"  |  applyClientFilters()     |
         |----------------------->|  (no fetch)               |
         |                        |  filter allTasks in memory|
         |                        |  renderTaskList()         |
         |  table shows only      |                            |
         |  completed tasks       |  (no request to server)   |
         |<-----------------------|                            |
```

### 4. Where filtering and sorting happen

```
    In this project:

    ┌─────────────────────────────────────────────────────────────┐
    │  Backend (Django + DRF)                                      │
    │  • GET /api/tasks/  →  returns ALL tasks (no filter/sort)   │
    │  • POST/PATCH/DELETE  →  create/update/delete one task      │
    └─────────────────────────────────────────────────────────────┘
                                    │
                                    │  JSON
                                    ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  Frontend (tasks.js)                                         │
    │  • allTasks = [ ... ]   (full list in memory)                │
    │  • applyClientFilters(allTasks)  →  filter by search +      │
    │    status, then sort by created_at or title                  │
    │  • renderTaskList()  →  draw table from filtered array      │
    └─────────────────────────────────────────────────────────────┘
```

---

You can use this guide to understand each part of your Task Manager, explain it in interviews, and plan improvements (e.g. server-side filtering, auth, pagination, or a different frontend).
