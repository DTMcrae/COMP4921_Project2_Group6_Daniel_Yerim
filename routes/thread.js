const router = require("express").Router();

const users = include("database/users");
const db_utils = include("database/db_utils");

router.get("/thread", async (req, res) => {

  const thread = {
    title: "Why does banning drug use not work?",
    owner: "Reddit",
    body: `My family is all voting for the Cons and I'm getting
                        worried. Their biggest gripe with the NDP is their free
                        safe injection site policy which they have somehow
                        magnified into a "infinite free drugs" madness in their
                        heads. They see more people on the streets and believe
                        the NDP is responsible for it (are they?). They aren't
                        skeptical about the Cons upholding their promise to keep
                        drug users off streets, don't have a problem with that
                        Rustad doesn't have a plan, and want to "let them try".
                        My knowledge in politics is limited and I don't know how
                        to explain to them why simply sweeping people off
                        streets will do nothing. Frankly, I myself am against
                        drug use and weed-smoking culture and think the safe
                        injection site policy could be a Band-Aid patch that
                        doesn't solve the long-term problem of addiction, so I
                        don't know what the best thing to vote for is. Please
                        educate me on your thoughts, thank you. Please no
                        personal attacks. I'm here to learn and openly accept
                        opinions but please don't attack me or my family. Edit:
                        wow, thanks for all the replies, I can't keep up so
                        sorry I'm not responding to all of them. I want to add
                        on what my family thinks. They want stricter enforcement
                        and drug abusers swept off the streets. They don't
                        necessarily want them dead and it's not that they don't
                        care about their lives, but they want drug users to
                        uphold their responsibility to stay off addiction. I
                        hope that helps`,
    likes: 12,
    uploadDate: "2 days ago",
    comments: 5,
  }

  const comments = [
    {
      depth: 0,
      username: "Dribble",
      commentDate: "2 day ago",
      body: "Have you tried not thinking about it?",
      likeCount: 1,
    },
    {
      depth: 0,
      username: "Dribble",
      commentDate: "1 day ago",
      body: "Have you tried not thinking about it?",
      likeCount: 0,
    },
    {
      depth: 1,
      username: "Reddit",
      commentDate: "1 day ago",
      body: "Stop commenting this.",
      likeCount: 12,
    },
    {
      depth: 2,
      username: "Dribble",
      commentDate: "1 day ago",
      body: "No",
      likeCount: 1,
    },
    {
      depth: 3,
      username: "Dribble",
      commentDate: "1 day ago",
      body: "No",
      likeCount: 1,
    },
    {
      depth: 4,
      username: "Dribble",
      commentDate: "1 day ago",
      body: "No",
      likeCount: 1,
    },
    {
      depth: 0,
      username: "Dribble",
      commentDate: "1 day ago",
      body: "Have you tried not thinking about it?",
      likeCount: 1,
    },
  ];

  let loggedIn = req.session.authenticated;
  let owner = false;

  res.render("thread", {loggedIn: loggedIn, owner: owner, thread: thread, comments:comments});
});

module.exports = router;
