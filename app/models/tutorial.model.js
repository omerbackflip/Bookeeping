module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      company: String,
      project: String,
      description: String,
      published: false,
      amount: Number,
      vat: Number,
      total: Number,
      group: Number,
      date: Date,
      supplier: String,
      invoiceId: String,
      remark: String,
      excelRecID: Number,
      year: Number,
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Tutorial = mongoose.model("tutorial", schema);
  return Tutorial;
};