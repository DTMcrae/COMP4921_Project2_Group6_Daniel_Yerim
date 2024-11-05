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

document.addEventListener("DOMContentLoaded", function () {
  const createPostBtn = document.getElementById("createPostBtn");

  if (createPostBtn) {
    createPostBtn.addEventListener("click", function () {
      window.location.href = "/create";
    });
  } else {
    // console.error("createPostBtn element not found in the DOM");
  }
  // document
  //   .getElementById("createPostBtn")
  //   .addEventListener("click", function () {
  //     window.location.href = "/create";
  //   });
});

//Buttons for Overview, Posts, and Comments
document.addEventListener("DOMContentLoaded", () => {
  const overviewBtn = document.getElementById("overviewBtn");
  const postsBtn = document.getElementById("postsBtn");
  const commentsBtn = document.getElementById("commentsBtn");
  const myThreads = document.getElementById("myThreads");
  const myComments = document.getElementById("myComments");
  const buttons = document.querySelectorAll(".mypage-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      buttons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Default to showing Overview
  function showOverview() {
    myThreads.style.display = "block";
    myComments.style.display = "block";
  }

  // Show only Threads
  function showThreads() {
    myThreads.style.display = "block";
    myComments.style.display = "none";
  }

  // Show only Comments
  function showComments() {
    myThreads.style.display = "none";
    myComments.style.display = "block";
  }

  overviewBtn.addEventListener("click", showOverview);
  postsBtn.addEventListener("click", showThreads);
  commentsBtn.addEventListener("click", showComments);

  showOverview();
});

// Handle threads/comments deletion
$(document).ready(function () {
  $(".my-thread-delete").click(function () {
    const thread_id = $(this).data("id");
    if (confirm("Do you really want to delete your thread?")) {
      $.ajax({
        url: `/deleteThread/${thread_id}`,
        type: "POST",
        success: function (response) {
          if (response.success) {
            $(`#thread-card-${thread_id}`).remove();
            console.log("Successfully deleted");
          } else {
            alert("Failed to delete the thread");
          }
        },
        error: function (error) {
          alert("Error deleting the thread. Please try again.");
        },
      });
    }
  });

  $(".my-comment-delete").click(function () {
    const comment_id = $(this).data("id");
    if (confirm("Do you really want to delete your comment?")) {
      $.ajax({
        url: `/deleteComment/${comment_id}`,
        type: "POST",
        success: function (response) {
          if (response.success) {
            $(`#comment-card-${comment_id}`).remove();
            console.log("Successfully deleted");
          } else {
            alert("Failed to delete the comment");
          }
        },
        error: function (error) {
          alert("Error deleting the thread. Please try again.");
        },
      });
    }
  });
});
