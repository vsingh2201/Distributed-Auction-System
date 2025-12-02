

(function () {

  // -------- Login page (index.html) --------
  function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) return; // not on this page

    const emailEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");
    const msgEl = document.getElementById("msg");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      if (msgEl) msgEl.classList.add("d-none");

      try {
        const user = await api.login(
          emailEl.value.trim(),
          passwordEl.value.trim()
        );
        setUserSession(user);
        window.location.href = "catalogue.html";
      } catch (err) {
        console.error(err);
        if (msgEl) {
          msgEl.textContent = "Invalid username or password";
          msgEl.classList.remove("d-none");
        } else {
          alert("Login failed");
        }
      }
    });
  }

  // -------- Sign-up page (signup.html) --------
  function initSignupPage() {
    const form = document.getElementById("form");
    if (!form) return; // not on this page

    const alertSuccess = document.getElementById("alertSuccess");
    const alertError   = document.getElementById("alertError");

    const u      = document.getElementById("u");      // email (used as username too)
    const p      = document.getElementById("p");
    const fn     = document.getElementById("fn");
    const ln     = document.getElementById("ln");
    const street = document.getElementById("street");
    const number = document.getElementById("number");
    const city   = document.getElementById("city");
    const country= document.getElementById("country");
    const postal = document.getElementById("postal");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      if (alertSuccess) alertSuccess.classList.add("d-none");
      if (alertError)   alertError.classList.add("d-none");

      const fullName = `${fn.value.trim()} ${ln.value.trim()}`.trim();
      const email    = u.value.trim();

      const payload = {
        // match backend DTO (like your teammate's Create.html)
        name: fullName,
        email: email,
        username: email,                 // email used as username
        password: p.value.trim(),
        address: {
          streetNumber: number.value.trim(),
          streetName:   street.value.trim(),
          city:         city.value.trim(),
          country:      country.value.trim(),
          postalCode:   postal.value.trim(),
        },
      };

      try {
        await api.signup(payload);
        if (alertSuccess) {
          alertSuccess.classList.remove("d-none");
        } else {
          alert("Account created! Redirecting to login…");
        }
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1200);
      } catch (err) {
        console.error(err);
        if (alertError) {
          alertError.classList.remove("d-none");
        } else {
          alert("Sign-up failed");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLoginPage();
    initSignupPage();
  });

})();
