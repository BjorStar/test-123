from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
import secrets
import time

app = FastAPI()

# In-memory user storage
users = {}  # {"username": "password"}
account_created = set()  # users who already created an account

# In-memory session storage
sessions = {}  # session_id -> {"username": ..., "expires": ...}


# -----------------------------
# SESSION HELPERS
# -----------------------------
def create_session(username: str, remember: bool = False):
    session_id = secrets.token_hex(32)
    expiry = time.time() + (60 * 60 * 24 * 30 if remember else 60 * 60)
    sessions[session_id] = {"username": username, "expires": expiry}
    return session_id


def get_current_user(request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id:
        return None

    session = sessions.get(session_id)
    if not session:
        return None

    if session["expires"] < time.time():
        del sessions[session_id]
        return None

    return session["username"]


# -----------------------------
# PAGE LAYOUT
# -----------------------------
def page_layout(content: str, username: str | None = None):
    # Top-right login or username display
    if username:
        auth_box = f"""
        <div style='position:absolute; top:20px; right:20px;'>
            Logged in as <b>{username}</b> |
            <a href="/logout">Logout</a>
        </div>
        """
    else:
        auth_box = """
        <div style='position:absolute; top:20px; right:20px;'>
            <form action="/login" method="post" style="display:flex; gap:5px;">
                <input name="username" placeholder="Username" style="padding:5px;">
                <input name="password" type="password" placeholder="Password" style="padding:5px;">
                <label style="display:flex; align-items:center; gap:3px;">
                    <input type="checkbox" name="remember"> Remember
                </label>
                <button type="submit" style="padding:5px;">Login</button>
            </form>
        </div>
        """

    # Hide create account if user already created one
    if username in account_created:
        create_section = ""
    else:
        create_section = """
        <div style="text-align:center; margin-top:40px;">
            <h3>Create Account</h3>
            <form action="/create" method="post">
                <input name="new_username" placeholder="New Username" style="padding:5px;"><br><br>
                <input name="new_password" type="password" placeholder="New Password" style="padding:5px;"><br><br>
                <button type="submit" style="padding:5px;">Create Account</button>
            </form>
        </div>
        """

    return f"""
    <html>
    <body style="font-family:Arial; margin:0; padding:0;">
        {auth_box}

        <div style="text-align:center; padding-top:100px;">
            <h1 style="font-size:48px; margin-bottom:10px;">Welcome to Sutakutu</h1>
            {content}
        </div>

        {create_section}
    </body>
    </html>
    """


# -----------------------------
# ROUTES
# -----------------------------
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    user = get_current_user(request)
    return page_layout("<p>Your personalized homepage.</p>", username=user)


@app.post("/create", response_class=HTMLResponse)
def create_account(new_username: str = Form(...), new_password: str = Form(...)):
    if new_username in users:
        return page_layout("<h3>Username already exists.</h3>")

    users[new_username] = new_password
    account_created.add(new_username)

    # Auto-login after account creation
    session_id = create_session(new_username, remember=True)
    response = RedirectResponse("/", status_code=302)
    response.set_cookie("session_id", session_id, httponly=True, max_age=60 * 60 * 24 * 30)
    return response


@app.post("/login")
def login(
    username: str = Form(...),
    password: str = Form(...),
    remember: bool = Form(False)
):
    if username in users and users[username] == password:
        session_id = create_session(username, remember)
        response = RedirectResponse("/", status_code=302)
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            max_age=60 * 60 * 24 * 30 if remember else None
        )
        return response

    return RedirectResponse("/", status_code=302)


@app.get("/logout")
def logout(request: Request):
    session_id = request.cookies.get("session_id")
    if session_id in sessions:
        del sessions[session_id]

    response = RedirectResponse("/", status_code=302)
    response.delete_cookie("session_id")
    return response
