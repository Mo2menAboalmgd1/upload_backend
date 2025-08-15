const db = require("../config/db");
const { SUPABASE_BUCKET } = require("../config/env");
const supabase = require("../config/supabase");
const { getObjectPath } = require("../helpers/getObjectPath");

async function uploadOne(file) {
  const { originalname, mimetype, size, buffer } = file;
  const objectPath = getObjectPath(mimetype, originalname);
  if (!SUPABASE_BUCKET) throw new Error("SUPABASE_BUCKET is not set");

  const { error: upErr } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(objectPath, buffer, { contentType: mimetype, upsert: false });
  if (upErr) throw upErr;

  const { data, error: urlErr } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(objectPath);
  if (urlErr) throw urlErr;

  return {
    originalname,
    mimetype,
    size,
    objectPath,
    publicUrl: data.publicUrl,
  };
}

async function deleteMany(paths = []) {
  if (!paths.length) return;
  await supabase.storage.from(SUPABASE_BUCKET).remove(paths);
}

async function uploadFiles(req, res) {
  let client;
  let tx = false;
  const uploadedPaths = [];

  try {
    const files = req.files || [];
    if (!files.length)
      return res.status(400).json({ message: "No files uploaded" });

    // 1) ارفع كل الملفات مع بعض
    const staged = await Promise.all(files.map(uploadOne));
    staged.forEach((s) => uploadedPaths.push(s.objectPath));

    // 2) ترانزكشن قصيرة لإدخالات الـDB
    client = await db.connect();
    await client.query("BEGIN");
    tx = true;

    const insertSql = `
      INSERT INTO uploaded_files (original_name, stored_name, mime_type, size_bytes, relative_url)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id, created_at
    `;
    const rows = [];
    for (const s of staged) {
      const { rows: r } = await client.query(insertSql, [
        s.originalname,
        s.objectPath,
        s.mimetype,
        s.size,
        s.publicUrl, // NB: relative_url = publicUrl
      ]);
      rows.push({
        id: r[0].id,
        created_at: r[0].created_at,
        original_name: s.originalname,
        stored_name: s.objectPath,
        mime_type: s.mimetype,
        size_bytes: s.size,
        url: s.publicUrl,
      });
    }

    await client.query("COMMIT");
    tx = false;
    return res
      .status(201)
      .json({ message: "Files uploaded successfully", data: rows });
  } catch (error) {
    // نظّف الستورج لو DB فشلت بعد الرفع
    console.log(error)
    if (uploadedPaths.length) {
      try {
        await deleteMany(uploadedPaths);
      } catch (_) {}
    }
    if (client && tx) {
      try {
        await client.query("ROLLBACK");
      } catch (_) {}
    }

    // لوج مختصر مفيد
    console.error("[UPLOAD_FILES_ERROR]", {
      code: error.code || error.status,
      msg: error.message,
    });

    // تصنيف سريع
    let status = 500,
      details = "An error occurred while uploading files.";
    if (error.status === 409 || /exists|Duplicate/i.test(error.message)) {
      status = 409;
      details = "File already exists in storage (name conflict).";
    } else if (/bucket|not found|Invalid bucket/i.test(error.message)) {
      details = "Storage bucket misconfiguration.";
    } else if (/column .* does not exist/i.test(error.message)) {
      details = "Database schema mismatch (column name).";
    } else if (/violates not-null constraint/i.test(error.message)) {
      status = 400;
      details = "Database NOT NULL constraint violated.";
    }

    return res.status(status).json({ error: "Internal Server Error", details });
  } finally {
    if (client) client.release();
  }
}

module.exports = { uploadFiles };
