module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      project: String,
      flatId: String,
      holderName: String,
      phone: String,
      signDate: Date,
      signPrice: Number,
      email: String,
      remark: String,
      // payments: [{
			// 	payment: {type: Number , default: 0},
      //   invoice: Number,	
      //   date: Date,
			// 	vat: {type: Number , default: 17},
      //   remark: String,
      //   redeemed: Boolean,
			// }],
    },
    { timestamps: true }
  );

  // schema.method("toJSON", function() {
  //   const { __v, _id, ...object } = this.toObject();
  //   object.id = _id;
  //   return object;
  // });

  const Holder = mongoose.model("holder", schema);
  return Holder;
};