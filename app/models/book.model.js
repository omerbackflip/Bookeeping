module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      company: String,
      asmchta_date: Date,
      record_id: Number,
      year: Number,
      record_schum: Number,
      pratim: String,
      asmacta1: String,
      schum_hova: Number,
      schum_zchut: Number,
      cust_lname: String,
      cust_fname: String,
      bs_item_name: String,
      bs_group_name: String,
    },
    { timestamps: true }
  );

  schema.index({ year: 1});
  schema.index({ company: 1});

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Book = mongoose.model("book", schema);
  return Book;
};