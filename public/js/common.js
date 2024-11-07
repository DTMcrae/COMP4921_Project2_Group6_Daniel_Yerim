document.addEventListener("DOMContentLoaded", function () {
  const themeToggleCheckbox = document.querySelector(".theme-toggle-checkbox");
  const body = document.body;

  // Check if the user has a saved theme preference
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-theme");
    themeToggleCheckbox.checked = true;
  } else {
    body.classList.remove("dark-theme");
    themeToggleCheckbox.checked = false;
  }

  themeToggleCheckbox.addEventListener("change", function () {
    if (this.checked) {
      body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  });
});
