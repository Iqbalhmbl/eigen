require('dotenv').config();
const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Swagger definition
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: "Library System API",
            version: "1.0.0",
            description: "API documentation for the Library System"
        },
        servers: [{ url: "http://localhost:3000" }]
    },
    apis: ["./app.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Connect to MongoDB (NoSQL database)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Define the schemas and models
const bookSchema = new mongoose.Schema({
    code: String,
    title: String,
    author: String,
    stock: Number,
    borrowedBy: { type: String, default: null }
});

const memberSchema = new mongoose.Schema({
    code: String,
    name: String,
    borrowedBooks: { type: Array, default: [] },
    penaltyUntil: { type: Date, default: null }
});

const Book = mongoose.model('Book', bookSchema);
const Member = mongoose.model('Member', memberSchema);

// Initial Data Insertion
const initialBooks = [
    { code: "JK-45", title: "Harry Potter", author: "J.K Rowling", stock: 1 },
    { code: "SHR-1", title: "A Study in Scarlet", author: "Arthur Conan Doyle", stock: 1 },
    { code: "TW-11", title: "Twilight", author: "Stephenie Meyer", stock: 1 },
    { code: "HOB-83", title: "The Hobbit, or There and Back Again", author: "J.R.R. Tolkien", stock: 1 },
    { code: "NRN-7", title: "The Lion, the Witch and the Wardrobe", author: "C.S. Lewis", stock: 1 }
];

const initialMembers = [
    { code: "M001", name: "Angga" },
    { code: "M002", name: "Ferry" },
    { code: "M003", name: "Putri" }
];

// Insert initial data if not already present
Book.insertMany(initialBooks, { ordered: false })
    .catch(err => console.log('Books already exist or error:', err));

Member.insertMany(initialMembers, { ordered: false })
    .catch(err => console.log('Members already exist or error:', err));

/**
 * @swagger
 * /:
 *   get:
 *     description: Get all books and members
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       title:
 *                         type: string
 *                       author:
 *                         type: string
 *                       stock:
 *                         type: integer
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 */
app.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        const members = await Member.find();
        res.render('index', { books: books, members: members });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
});

/**
 * @swagger
 * /borrow:
 *   post:
 *     description: Borrow a book
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               memberCode:
 *                 type: string
 *               bookCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book borrowed successfully
 */
app.post('/borrow', async (req, res) => {
    try {
        const memberCode = req.body.memberCode;
        const bookCode = req.body.bookCode;
        const member = await Member.findOne({ code: memberCode });
        const book = await Book.findOne({ code: bookCode });

        if (!member || !book) {
            return res.status(404).send('Member or Book not found');
        }

        // Borrowing process
        member.borrowedBooks.push({ bookCode: book.code, borrowedAt: new Date() });
        book.borrowedBy = member.code;
        book.stock -= 1;
        await member.save();
        await book.save();
        // Redirect back to the home page
        res.redirect('/');
    } catch (err) {
        console.error('Error borrowing book:', err);
        res.status(500).send('Error borrowing book');
    }
});

/**
 * @swagger
 * /return:
 *   post:
 *     description: Return a book
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               memberCode:
 *                 type: string
 *               bookCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book returned successfully
 */
app.post('/return', async (req, res) => {
    try {
        const memberCode = req.body.memberCode;
        const bookCode = req.body.bookCode;
        const member = await Member.findOne({ code: memberCode });
        const book = await Book.findOne({ code: bookCode });

        if (!member || !book) {
            return res.status(404).send('Member or Book not found');
        }

        // Find the borrowed book
        const borrowedBookIndex = member.borrowedBooks.findIndex(b => b.bookCode === bookCode);
        if (borrowedBookIndex === -1) {
            return res.status(400).send('The book was not borrowed by this member');
        }

        // Return process
        member.borrowedBooks.splice(borrowedBookIndex, 1);
        book.borrowedBy = null;
        book.stock += 1;
        await member.save();
        await book.save();
        // Redirect back to the home page
        res.redirect('/');
    } catch (err) {
        console.error('Error returning book:', err);
        res.status(500).send('Error returning book');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
