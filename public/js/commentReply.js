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
