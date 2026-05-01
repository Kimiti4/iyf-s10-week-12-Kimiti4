/**
 * 🔹 Task 20.2: Validation Middleware
 */
const validatePost = (req, res, next) => {
  const { title, content, author, category } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) errors.push('Title ≥3 chars');
  if (!content || content.trim().length < 10) errors.push('Content ≥10 chars');
  if (!author || author.trim().length < 2) errors.push('Author name required');

  const validCategories = ['mtaani', 'skill', 'farm', 'gig', 'alert'];
  if (!category || !validCategories.includes(category)) {
    errors.push(`Category must be: ${validCategories.join('|')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: 'Validation failed', errors });
  }

  // Sanitize
  req.body.title = title.trim();
  req.body.content = content.trim();
  req.body.author = author.trim();

  next();
};

const validateComment = (req, res, next) => {
  const { content, author } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, error: 'Comment required' });
  if (!author?.trim()) return res.status(400).json({ success: false, error: 'Author required' });

  req.body.content = content.trim();
  req.body.author = author.trim();
  next();
};

module.exports = { validatePost, validateComment };
