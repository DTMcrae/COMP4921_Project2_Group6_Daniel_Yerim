document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".thread-card-title").forEach((title) => {
        if (title.textContent.length >= 500) {
            title.classList.add("extra-long-title");
        } else if (title.textContent.length > title.clientWidth) {
            title.classList.add("long-title");
        }
    });
});
