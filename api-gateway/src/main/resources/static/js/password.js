// js/password.js
// Forgot Password / Reset Password page logic

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetForm");
    if (!form) return;

    const emailEl = document.getElementById("email");
    const newPassEl = document.getElementById("newPassword");
    const confirmEl = document.getElementById("confirmPassword");
    const alertOk = document.getElementById("alertSuccess");
    const alertErr = document.getElementById("alertError");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) return;

      const email = emailEl.value.trim();
      const newPassword = newPassEl.value.trim();
      const confirmPassword = confirmEl.value.trim();

      alertOk.classList.add("d-none");
      alertErr.classList.add("d-none");

      if (newPassword !== confirmPassword) {
        alertErr.textContent = "Passwords do not match.";
        alertErr.classList.remove("d-none");
        return;
      }

      if (newPassword.length < 6) {
        alertErr.textContent = "Password must be at least 6 characters long.";
        alertErr.classList.remove("d-none");
        return;
      }

      try {
        await api.resetPassword(email, newPassword);
        alertOk.textContent = "Password reset successfully. You can now sign in with your new password.";
        alertOk.classList.remove("d-none");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } catch (err) {
        console.error(err);
        alertErr.textContent = err.message || "Failed to reset password.";
        alertErr.classList.remove("d-none");
      }
    });
  });
})();
