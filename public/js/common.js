document.addEventListener("DOMContentLoaded", function () {
    document
        .querySelector(".theme-toggle-checkbox")
        .addEventListener("change", function () {
            console.log("checkbox clicked");
            const body = document.body;

            if (this.checked) {
                body.classList.add("dark-theme");
            } else {
                body.classList.remove("dark-theme");
            }
        });
});
