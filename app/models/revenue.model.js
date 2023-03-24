module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      project: String,
      description: String,
      invoiceId: Number,
      amount: Number,
      date: Date,
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Revenue = mongoose.model("revenue", schema);
  return Revenue;
};