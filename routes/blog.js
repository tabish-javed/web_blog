const express = require("express")
const router = express.Router()

const db = require("../data/database")

router.get("/", function (request, response) {
    response.redirect("/posts")
})

router.get("/posts", function (request, response) {
    response.render("posts-list")
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

module.exports = router