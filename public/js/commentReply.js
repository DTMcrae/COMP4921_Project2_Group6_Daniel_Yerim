
var modal = document.getElementById("replyModal");

var span = document.getElementsByClassName("close")[0];

function openModal(commentBody, commentId) {
  document.getElementById("modalCommentBody").innerText = commentBody;
  document.getElementById("parentCommentId").value = commentId;
  modal.style.display = "block";
}

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};


document.querySelectorAll(".reply-button").forEach(function (button) {
  button.addEventListener("click", function () {
    var commentId = this.getAttribute("data-comment-id");
    var commentBody =
      this.closest(".comment-container").querySelector(
        ".comment-body"
      ).innerText;
    openModal(commentBody, commentId);
  });
});
