module.exports = {
  driveFolderId: process.env.BACKUP_DRIVE_FOLDER_ID,
  zipPrefix: 'book-backup',

  models: [
    {
      key: 'books',
      modelName: 'Book',
      archiveName: 'books.csv'
    },
    {
      key: 'holders',
      modelName: 'Holder',
      archiveName: 'holders.csv'
    },
    {
      key: 'invoices',
      modelName: 'Invoice',
      archiveName: 'invoices.csv'
    },
    {
      key: 'revenues',
      modelName: 'Revenue',
      archiveName: 'revenues.csv'
    },
    {
      key: 'tables',
      modelName: 'Table',
      archiveName: 'tables.csv'
    }
  ]
};