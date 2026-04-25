const db = require('../models');

const MODEL_MAP = {
  Book: db.books,
  Holder: db.holders,
  Invoice: db.invoices,
  Revenue: db.revenues,
  Table: db.tables
};

function getModel(modelName) {
  const model = MODEL_MAP[modelName];

  if (!model) {
    throw new Error(`Unknown model: ${modelName}`);
  }

  return model;
}

module.exports = {
  getModel
};