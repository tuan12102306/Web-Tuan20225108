const db = require('../config/db.config');

exports.getAllNews = async (req, res) => {
    try {
        const [news] = await db.execute('SELECT * FROM news ORDER BY createdAt DESC');
        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.createNews = async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const [result] = await db.execute(
            'INSERT INTO news (title, content, author) VALUES (?, ?, ?)',
            [title, content, author]
        );
        res.status(201).json({
            success: true,
            message: 'News created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : undefined;

    let sql = 'UPDATE news SET title = ?, content = ?';
    let params = [title, content];

    if (image) {
      sql += ', image = ?';
      params.push(image);
    }

    sql += ' WHERE id = ? AND author = ?';
    params.push(id, req.user.id);

    const [result] = await db.execute(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'News not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'News updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM news WHERE id = ? AND (author = ? OR ? = "admin")',
      [req.params.id, req.user.id, req.user.role]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'News not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};