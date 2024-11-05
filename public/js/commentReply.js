document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("replyModal");
  var span = document.getElementsByClassName("close")[0];

  // Function to open the modal
  function openModal(commentBody, commentId) {
    document.getElementById("modalCommentBody").innerText = commentBody;
    document.getElementById("parent_id").value = commentId; // Set parent_id for reply
    console.log("Setting parent_id to:", commentId); // Debugging
    modal.style.display = "block";
  }

  // Close modal when clicking the "x" button
  span.onclick = function () {
    modal.style.display = "none";
    document.getElementById("parent_id").value = ""; // Clear parent_id on close
  };

  // Close modal when clicking outside of it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      document.getElementById("parent_id").value = ""; // Clear parent_id on close
    }
  };

  // Attach event listeners to all reply buttons
  document.querySelectorAll(".reply-button").forEach(function (button) {
    button.addEventListener("click", function () {
      var commentId = this.getAttribute("data-comment-id");
      var commentBody =
        this.closest(".comment-container").querySelector(
          ".comment-body p"
        ).innerText;
      console.log("Opening modal for comment ID:", commentId); // Debugging
      openModal(commentBody, commentId);
    });
  });

  console.log("Comment Reply script loaded."); // Debugging
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll(".like-button, .dislike-button")
    .forEach((button) => {
      button.addEventListener("click", async function () {
        const entityId = this.getAttribute("data-entity-id");
        const entityType = this.getAttribute("data-entity-type");
        const isLike = this.classList.contains("like-button");

        try {
          const response = await fetch(`/${entityType}/${entityId}/like`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_like: isLike }),
          });

          if (response.ok) {
            const data = await response.json();

            // Find the like and dislike buttons
            const likeButton = this.closest(
              ".like-dislike-buttons"
            ).querySelector(".like-button");
            const dislikeButton = this.closest(
              ".like-dislike-buttons"
            ).querySelector(".dislike-button");

            // Update like count
            const likeCountElement =
              this.closest(".like-parent").querySelector(".likes-count");
            if (likeCountElement) {
              likeCountElement.textContent = data.updatedLikes;
            }

            // Toggle button styles based on the current action
            if (isLike) {
              // Liking an item
              if (likeButton.classList.contains("active")) {
                // If already liked, toggle off (unlike)
                likeButton.classList.remove("active");
              } else {
                // If not liked, activate like and deactivate dislike
                likeButton.classList.add("active");
                dislikeButton.classList.remove("active");
              }
            } else {
              // Disliking an item
              if (dislikeButton.classList.contains("active")) {
                // If already disliked, toggle off (undislike)
                dislikeButton.classList.remove("active");
              } else {
                // If not disliked, activate dislike and deactivate like
                dislikeButton.classList.add("active");
                likeButton.classList.remove("active");
              }
            }
          } else {
            console.error("Error toggling like/dislike");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      });
    });
});
