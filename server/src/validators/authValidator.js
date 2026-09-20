const USERNAME_RE = /^[a-z0-9_.-]{3,32}$/;

export function validateUsername(username) {
  const value = String(username || "").trim().toLowerCase();

  if (!USERNAME_RE.test(value)) {
    throw Object.assign(
      new Error(
        "Username must be 3-32 characters and may contain letters, numbers, dots, underscores, or hyphens."
      ),
      { status: 400 }
    );
  }

  return value;
}

export function validatePassword(password) {
  const value = String(password || "");

  if (value.length < 8) {
    throw Object.assign(
      new Error("Password must contain at least 8 characters."),
      { status: 400 }
    );
  }

  return value;
}

export function validateName(name) {
  const value = String(name || "").trim();

  if (!value || value.length > 100) {
    throw Object.assign(new Error("Name is required and must be under 100 characters."), {
      status: 400,
    });
  }

  return value;
}

export function validateLoginInput(body = {}) {
  return {
    username: validateUsername(body.username),
    password: validatePassword(body.password),
  };
}

export function validateRegistrationInput(body = {}) {
  return {
    username: validateUsername(body.username),
    password: validatePassword(body.password),
    name: validateName(body.name),
  };
}
