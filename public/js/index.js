$(document).ready(function () {
  $("#searchButton").on("click", function () {
    const searchTerm = $("#searchInput").val().trim();
    if (searchTerm) {
      $.ajax({
        url: "/search_threads",
        type: "POST",
        data: { query: searchTerm },
        success: function (data) {
          $("#threadSearchResults").empty();

          const results = [
            ...data.threads.map((thread) => ({ ...thread, type: "thread" })),
            ...data.comments.map((comment) => ({
              ...comment,
              type: "comment",
            })),
          ];

          results.forEach((item) => {
            if (item.type === "thread") {
              // Render thread card
              $("#threadSearchResults").append(`
                <div class="my-search-thread-card p-3 mb-2 d-flex flex-column" id="thread-card-${
                  item.thread_id
                }">
                  <div class="mt my-thread-header-container">
                    <div class="my-thread-card-time">
                      Created at <span>${new Date(
                        item.created_date
                      ).toLocaleString()}</span>
                    </div>
                  </div>
                  <div onclick="window.location.href='/thread/${
                    item.thread_id
                  }'" style="cursor: pointer">
                    <div class="mt">
                      <div class="d-flex flex-row">
                        <div class="thread-card-profile" id="thread-search-profile">
                          ${
                            item.profile_id == null
                              ? `<i class="bx bxl-mailchimp"></i>`
                              : `<img src="${item.cloudinary_url}" alt="Profile Icon" class="profile-icon" />`
                          }
                        </div>
                        <h6 class="mb-0 thread-card-username mt-3 px-2" id="thread-search-username">
                          ${item.username}
                        </h6>
                      </div>
                      <h3 class="my-thread-card-title">${item.title}</h3>
                      <div class="my-thread-card-text">${item.text}</div>
                    </div>
                    <div class="mt-1">
                      <i class="bx bx-like"></i>
                      <span class="my-thread-card-likes ms-1">${
                        item.likes
                      }</span>
                      <i class="bx bx-comment-detail ms-3"></i>
                      <span class="my-thread-card-likes ms-1">${
                        item.comments
                      }</span>
                    </div>
                  </div>
                </div>
              `);
            } else if (item.type === "comment") {
              // Render comment card
              $("#threadSearchResults").append(`
                <div class="my-search-comment-card p-3 mb-2 d-flex flex-column" id="comment-card-${
                  item.thread_id
                }">
                  <div class="mt my-thread-header-container">
                    <div class="my-thread-card-time">
                      Created at <span>${new Date(
                        item.created_date
                      ).toLocaleString()}</span>
                    </div>
                  </div>
                  <div onclick="window.location.href='/thread/${
                    item.thread_id
                  }'" style="cursor: pointer">
                    <div class="mt">
                      <h3 class="my-comment-card-title"><span>Commented On:</span> ${
                        item.title || "Thread"
                      }</h3>
                      <div class="my-thread-card-text">${item.text}</div>
                    </div>
                    <div class="mt-1">
                      <i class="bx bx-like"></i>
                      <span class="my-thread-card-likes ms-1">${
                        item.likes
                      }</span>
                    </div>
                  </div>
                </div>
              `);
            }
          });
        },

        error: function (error) {
          console.error("Error fetching threads:", error);
          $("#threadSearchResults").html(
            "<p>An error occurred while fetching results. Please try again later.</p>"
          );
        },
      });
    }
  });
});

// $(document).ready(function () {
//   $("#searchButton").on("click", function () {
//     const searchTerm = $("#searchInput").val().trim();
//     if (searchTerm) {
//       $.ajax({
//         url: "/search_threads",
//         type: "POST",
//         data: { query: searchTerm },
//         success: function (data) {
//           // Clear existing threads and populate with search results
//           $("#threadSearchResults").empty();
//           data.results.forEach((thread) => {
//             $("#threadSearchResults").append(`
//                 <div class="col-md-4">
//                   <div class="thread-card p-3 mb-2 d-flex flex-column justify-content-between">
//                     <div class="d-flex justify-content-between">
//                       <div class="d-flex flex-row align-items-center">
//                         <div class="thread-card-profile">
//                           ${
//                             thread.profile_id
//                               ? `<img src="${thread.cloudinary_url}" alt="Profile Icon" class="profile-icon" />`
//                               : `<i class="bx bxl-mailchimp"></i>`
//                           }
//                         </div>
//                         <div class="ms-2 c-details">
//                           <h6 class="mb-0 thread-card-username">${
//                             thread.username
//                           }</h6>
//                           <span></span>
//                         </div>
//                       </div>
//                     </div>
//                     <div class="mt-5">
//                       <h3 class="thread-card-title">${thread.title}</h3>
//                       <div class="thread-card-text">${thread.text}</div>
//                     </div>
//                     <div class="mt-3">
//                       <i class="bx bx-like"></i>
//                       <span class="thread-card-likes ms-1">${
//                         thread.likes
//                       }</span>
//                       <i class="bx bx-comment-detail ms-3"></i>
//                       <span class="thread-card-likes ms-1">${
//                         thread.comments
//                       }</span>
//                     </div>
//                   </div>
//                 </div>
//               `);
//           });
//         },
//         error: function (error) {
//           console.error("Error fetching threads:", error);
//         },
//       });
//     }
//   });
// });
