function fileData(req, res, next) {
  req.fileData = {
    filename: req.body.filename,
    filePath: req.file?.path,      // use optional chaining in case file is undefined
    description: req.body.description,
    userId: req.user?.id           // use optional chaining if user may not be attached
  };
  next();
}
export default fileData;