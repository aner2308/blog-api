const router = require("express").Router();
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");

//Hämta alla inlägg
router.get("/", async (req, res) => {

    //Sorterar så senaste hamnar först
    const posts = (await Post.find()).sort({ createdAt: -1 });

    res.json(posts);
});

//Hämta specifikt inlägg
router.get("/:id", async (req, res) => {

    const post = await Post.findById(req.params.id);

    res.json(post);
});

//Skapa nytt inlägg
router.post("/", auth, async (req, res) => {

    const newPost = new Post(req.body);
    const savedPost = await newPost.save();

    res.json(savedPost);
});

//Uppdatera inlägg
router.put("/:id", auth, async (req, res) => {

    const updated = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updated);
});

//Radera inlägg
router.delete("/:id", auth, async (req, res) => {

    await Post.findByIdAndDelete(req.params.id);

    res.json("Inlägget är raderat");
});

module.exports = router;