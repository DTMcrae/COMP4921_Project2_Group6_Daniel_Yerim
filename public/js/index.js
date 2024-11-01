$(document).ready(function () {
  $("#searchButton").on("click", function () {
    const searchTerm = $("#searchInput").val().trim();
    if (searchTerm) {
      $.ajax({
        url: "/search_threads",
        type: "POST",
        data: { query: searchTerm },
        success: function (data) {
          // Clear existing threads and populate with search results
          $("#threadSearchResults").empty();
          data.results.forEach((thread) => {
            $("#threadSearchResults").append(`
                <div class="col-md-4">
                  <div class="thread-card p-3 mb-2 d-flex flex-column justify-content-between">
                    <div class="d-flex justify-content-between">
                      <div class="d-flex flex-row align-items-center">
                        <div class="thread-card-profile">
                          ${
                            thread.profile_id
                              ? `<img src="${thread.cloudinary_url}" alt="Profile Icon" class="profile-icon" />`
                              : `<i class="bx bxl-mailchimp"></i>`
                          }
                        </div>
                        <div class="ms-2 c-details">
                          <h6 class="mb-0 thread-card-username">${
                            thread.username
                          }</h6>
                          <span></span>
                        </div>
                      </div>
                    </div>
                    <div class="mt-5">
                      <h3 class="thread-card-title">${thread.title}</h3>
                      <div class="thread-card-text">${thread.text}</div>
                    </div>
                    <div class="mt-3">
                      <i class="bx bx-like"></i>
                      <span class="thread-card-likes ms-1">${
                        thread.likes
                      }</span>
                      <i class="bx bx-comment-detail ms-3"></i>
                      <span class="thread-card-likes ms-1">${
                        thread.comments
                      }</span>
                    </div>
                  </div>
                </div>
              `);
          });
        },
        error: function (error) {
          console.error("Error fetching threads:", error);
        },
      });
    }
  });
});
