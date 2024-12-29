const db = require('../config/db.config');

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const [books] = await db.execute(
            'SELECT * FROM books ORDER BY title'
        );
        
        res.json({
            success: true,
            data: books
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get book by ID
exports.getBookById = async (req, res) => {
    try {
        const [books] = await db.execute(
            'SELECT * FROM books WHERE id = ?',
            [req.params.id]
        );

        if (!books || books.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.json({
            success: true,
            data: books[0]
        });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Add new book (Admin only)
exports.addBook = async (req, res) => {
    try {
        // Debug logs
        console.log('Add book request received');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        console.log('User:', req.user);

        const { title, author, description, quantity } = req.body;

        // Validate input
        if (!title || !author || !quantity) {
            const missingFields = [];
            if (!title) missingFields.push('title');
            if (!author) missingFields.push('author');
            if (!quantity) missingFields.push('quantity');

            console.log('Missing fields:', missingFields);
            
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Insert book
        const [result] = await db.execute(
            'INSERT INTO books (title, author, description, quantity) VALUES (?, ?, ?, ?)',
            [title, author, description || '', parseInt(quantity)]
        );

        console.log('Book added successfully:', result);

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: {
                id: result.insertId,
                title,
                author,
                description,
                quantity: parseInt(quantity)
            }
        });

    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};