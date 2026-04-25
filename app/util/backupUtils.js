// app/utils/backupUtils.js
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const csv = require('fast-csv');
const archiver = require('archiver');

/**
 * Write rows (array of objects) to CSV at filePath.
 * Flattens arrays to newline-separated strings and converts _id to string.
 * Resolves when file is fully written.
 */
async function writeCsv(filePath, rows, headerOrder = null) {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(filePath);

    // Write UTF-8 BOM so Excel (Windows) recognizes UTF-8 and shows Hebrew correctly
    ws.write('\uFEFF', 'utf8');

    // Get headers from first row if not explicitly provided
    let headers = headerOrder;
    if (!headers && rows && rows.length > 0) {
      headers = Object.keys(rows[0]);
    }

    const csvStream = csv.format({ headers: headers || true });

    ws.on('finish', () => resolve());
    ws.on('error', err => reject(err));
    csvStream.on('error', err => reject(err));

    csvStream.pipe(ws);

    for (const rawRow of (rows || [])) {
      const row = { ...rawRow };
      for (const k of Object.keys(row)) {
        if (Array.isArray(row[k])) row[k] = row[k].join(',');
        if (k === '_id' && typeof row[k] === 'object') row[k] = String(row[k]);
      }
      csvStream.write(row);
    }
    csvStream.end();
  });
}


/**
 * Create a zip at zipPath with files array: [{ path: absolutePath, name: archiveName }, ...]
 */
async function zipFiles(zipPath, files) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', () => resolve());
    output.on('error', err => reject(err));
    archive.on('error', err => reject(err));

    archive.pipe(output);
    for (const f of files) {
      archive.file(f.path, { name: f.name }); // keep archive name simple
    }
    archive.finalize();
  });
}

module.exports = {
  writeCsv,
  zipFiles
};
