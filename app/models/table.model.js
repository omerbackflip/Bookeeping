module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      table_id: Number,
      table_code: Number,
      description: String,
      textValue: String,
      numeric: Number
    },
    { timestamps: true }
  );

  // schema.method("toJSON", function() {
  //   const { __v, _id, ...object } = this.toObject();
  //   object.id = _id;
  //   return object;
  // });

  const Table = mongoose.model("table", schema);
  return Table;
};