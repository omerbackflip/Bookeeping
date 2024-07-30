const xlsx = require('xlsx');
const { ServerApp } = require("../config/constants");

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


 exports.createExcel = (data, filename = '') => {

 	let excelFilename;

 	if(filename === ''){
 		excelFilename = 'invoices-data-' + Date.now() + '.xlsx';
 	}else{
 		excelFilename = filename;
 	}

 	const ws = xlsx.utils.json_to_sheet(data);
	const wb = xlsx.utils.book_new();
	xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

	try{
		const filePath = ServerApp.uploadFolderPath +  excelFilename;
		xlsx.writeFile(wb, filePath);

		let response = {
			filename: excelFilename,
			filePath: filePath,
		};

		return response;

	} catch (error) {
		return false;
	}

 }