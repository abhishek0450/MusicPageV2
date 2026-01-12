import DataUriParser from "datauri/parser.js";
import path from "path";

const getBuffer = (file: any) => {
  const parser = new DataUriParser(); // Create a new instance of DataUriParser
    
  const extName = path.extname(file.originalname).toString(); // Get the file extension from the original name
 
  return parser.format(extName, file.buffer); // Format the file buffer with the extension
};

export default getBuffer;