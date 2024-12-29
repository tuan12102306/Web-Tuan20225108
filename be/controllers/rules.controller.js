const db = require('../config/db.config');

exports.getAllRules = async (req, res) => {
    try {
        const [rules] = await db.execute('SELECT * FROM rules');
        res.json({
            success: true,
            data: rules
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateRule = async (req, res) => {
    try {
        const { title, content } = req.body;
        const [result] = await db.execute(
            'UPDATE rules SET content = ? WHERE id = ?',
            [content, req.params.id]
        );
        res.json({
            success: true,
            message: 'Rule updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 