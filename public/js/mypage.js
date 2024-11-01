$(document).ready(function () {
  $("#profileInput").on("change", async function (event) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await $.ajax({
          url: "/upload_profile_photo",
          type: "POST",
          data: formData,
          contentType: false,
          processData: false,
        });

        if (response.success) {
          $("#profileImage").attr("src", response.url);
        } else {
          console.error("Failed to upload profile photo:", response.error);
        }
      } catch (error) {
        console.error("Error during file upload:", error);
      }
    }
  });
});

// document.addEventListener("DOMContentLoaded", function () {
//     document
//         .getElementById("createPostBtn")
//         .addEventListener("click", function () {
//             window.location.href = "/create";
//         });
// });
