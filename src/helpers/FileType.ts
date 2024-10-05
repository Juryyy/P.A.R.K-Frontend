export const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'picture_as_pdf';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'image';
    case 'doc':
    case 'docx':
      return 'description';
    case 'xls':
    case 'xlsx':
      return 'table_chart';
    default:
      return 'insert_drive_file';
  }
};
