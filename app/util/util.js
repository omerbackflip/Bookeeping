exports.transformCSVData = (sheet_name_list, workbook) => {
	try {
		return sheet_name_list.map((y) => {
			var worksheet = workbook.Sheets[y];
			var headers = {};
			var data = [];

			Object.keys(worksheet).forEach((z) => {
				var tt = 0;
				for (var i = 0; i < z.length; i++) {
					if (!isNaN(z[i])) {
						tt = i;
						break;
					}
				};
				var col = z.substring(0, tt);
				var row = parseInt(z.substring(tt));
				var value = worksheet[z].v;

				if (row == 1 && value) {
					headers[col] = value;
				}

				if (!data[row]) data[row] = {};
				data[row][headers[col]] = value;
			})
			data.shift();
			data.shift();
			return data
		});
	} catch (error) {
		return false;
	}
}

exports.convertToJSON = (array) => {
	var first = array[0].join()
	var headers = first.split(',');
  
	var jsonData = [];
	for ( var i = 1, length = array.length; i < length; i++ )
	{
  
	  var myRow = array[i].join();
	  var row = myRow.split(',');
  
	  var data = {};
	  for ( var x = 0; x < row.length; x++ )
	  {
		data[headers[x]] = row[x];
	  }
	  jsonData.push(data);
  
	}
	return jsonData;
  };