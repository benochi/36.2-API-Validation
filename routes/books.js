const express = require("express");
const router = new express.Router();
const { validate, ValidationError } = require("jsonschema");
const bookSchemaNew = require("../schemas/bookSchemaNew");
const bookSchemaUpdate = require("../schemas/bookSchemaUpdate");
const router = new express.Router();

const Book = require("../models/book");


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:isbn", async function (req, res, next) { //use isbn for PK. 
  try {
    const book = await Book.findOne(req.params.isbn);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */
//Display an error message containing all of the validation errors if book creation or updating fails.

router.post("/", async function (req, res, next) {
  try {
    const result = validate(req.body, bookSchemaNew);
    if(!result.valid){
      return next({
        status: 400, error: result.errors.map(e => e.stack)
      });
    }
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    if("isbn" in req.body){
      return next({ 
        status: 400, 
        message: "ISBN is not allowed."
      });
    }
    const result = validate(req.body, bookSchemaUpdate); //check for valid entry vs schema"update"
    if(!result.valid){
      return next({ 
        status: 400,
        errors: result.error.map(e => e.stack) //if not valid return ALL errors from JSONschema
       });
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
