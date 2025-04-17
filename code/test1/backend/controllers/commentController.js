exports.addComment = async (req, res, next) => {
  try {
    const { content, fileId } = req.body;

    if (!content || !fileId) {
      return next(new ErrorResponse(`Please provide all required fields`, 400));
    }

    const comment = await Comment.create({
      content,
      file: fileId,
      author: req.user.id // Use the authenticated user's ID
    });

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (err) {
    next(err);
  }
}; 