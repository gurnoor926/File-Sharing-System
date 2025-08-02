function formData(req, res, next) {
  const { name, email, password } = req.body;

  if (!email || !password || (req.path === "/register" && !name)) {
    return res.status(400).json({ message: "All required fields must be filled." });
  }

  // Attach data for cleaner use in handlers (optional)
  req.cleanedData = { name, email, password };
  next();
}
export default formData;