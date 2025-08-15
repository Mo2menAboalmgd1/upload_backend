function pad2(n) {
  return String(n).padStart(2, "0");
}

exports.getObjectPath = (mimetype, originalname) => {
  const type = mimetype.startsWith("image/")
    ? "images"
    : mimetype.startsWith("video/")
    ? "videos"
    : mimetype.startsWith("audio/")
    ? "audios"
    : mimetype.startsWith("application/")
    ? "documents"
    : "other";
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());
  const folders = [type, yyyy, mm, dd].join("/");
  const uniqueName = [
    Date.now(),
    Math.floor(Math.random() * 1e9),
    originalname,
  ].join("_");
  const objectPath = `${folders}/${uniqueName}`;
  return objectPath;
};
