const express = require("express")
const router = express.Router()

const db = require("../data/database")

router.get("/", function (request, response) {
    response.redirect("/posts")
})

// Route to list posts
router.get("/posts", async function (request, response) {
    const query = `
        SELECT posts.*, authors.name AS author_name FROM posts
        INNER JOIN authors ON posts.author_id = authors.id
        ORDER BY posts.date DESC`
    const [posts] = await db.query(query)
    response.render("posts-list", { posts: posts })
})

// Route to display create-post.ejs view and send list of authors to the page
router.get("/new-post", async function (request, response) {
    const [authors] = await db.query("SELECT * FROM authors")
    response.render("create-post", { authors: authors })
})

// Route for sending post data to server and saving to posts DB
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

// Dynamic route to display post detail
router.get("/posts/:id", async function (request, response) {
    const query = `
        SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts
        INNER JOIN authors ON posts.author_id = authors.id
        WHERE posts.id = ?
    `
    const [posts] = await db.query(query, [request.params.id])
    // request.params.id received as request parameters

    if (!posts || posts.length === 0) {
        return response.status(404).render("404")
    }

    // Modify "posts" array's date toISOString() & add more keys with date formatted data to the array
    const postData = {
        ...posts[0],    // Received from line # 41 as an array
        date: posts[0].date.toISOString(),
        humanReadableDate: posts[0].date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    response.render("post-detail", { post: postData })
})

// Dynamic route for fetching post detail
router.get("/posts/:id/edit", async function (request, response) {
    const query = `
    SELECT * FROM posts WHERE id = ?
    `
    const [posts] = await db.query(query, [request.params.id])

    if (!posts || posts.length === 0) {
        return response.status(404).render("404")
    }
    response.render("update-post", { post: posts[0] })
})

// Dynamic route for updating post data
router.post("/posts/:id/edit", async function (request, response) {
    const query = `
        UPDATE posts SET title = ?, summary = ?, body = ?
        WHERE posts.id = ?
    `
    const parameters = [
        request.body.title,
        request.body.summary,
        request.body.content,
        request.params.id
    ]
    await db.query(query, parameters)
    response.redirect("/posts")
})

// Dynamic route for deleting a post data inside posts DB
router.post("/posts/:id/delete", async function (request, response) {
    const query = `
        DELETE FROM posts WHERE posts.id = ?
    `
    await db.query(query, [request.params.id])
    response.redirect("/posts")
})

module.exports = router