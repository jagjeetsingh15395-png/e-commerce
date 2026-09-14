const fs = require('fs');

// Read the file
const filePath = 'C:\\Users\\ACER\\OneDrive\\Documents\\starting\\project\\portfolio\\front\\src\\pages\\AdminPanel.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of axios. with axiosInstance.
content = content.replace(/axios\./g, 'axiosInstance.');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Successfully replaced all axios. calls with axiosInstance. in AdminPanel.js');