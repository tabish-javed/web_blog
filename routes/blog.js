const express = require("express")
const router = express.Router()

const db = require("../data/database")

router.get("/", function (request, response) {
    response.redirect("/posts")
})

router.get("/posts", async function (request, response) {
    const query = `
        SELECT posts.*, authors.name AS author_name FROM posts
        INNER JOIN authors ON posts.author_id = authors.id`
    const [posts] = await db.query(query)
    response.render("posts-list", { posts: posts })
})

router.get("/new-post", async function (request, response) {
    const [authors] = await db.query("SELECT * FROM authors")
    response.render("create-post", { authors: authors })
})

router.post("/posts", async function (request, response) {
    const data = [
        request.body.title,
        request.body.summary,
        request.body.content,
        request.body.author
    ]
    await db.query("INSERT INTO posts (title, summary, body, author_id) VALUES (?)", [data])
    response.redirect("/posts")
})

// Post's detail router
router.get("/posts/:id", async function (request, response) {
    const query = `
        SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts
        INNER JOIN authors ON posts.author_id = authors.id
        WHERE posts.id = ?
    `
    const [posts] = await db.query(query, [request.params.id])

    if (!posts || posts.length === 0) {
        return response.status(404).render("404")
    }
    response.render("post-detail", { posts: posts[0] })
})

module.exports = router