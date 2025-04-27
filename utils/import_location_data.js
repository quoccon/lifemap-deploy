const fs = require('fs').promises;
const path = require('path');

const readJsonFile = async (filePath) => {
    try {
        const absolutePath = path.resolve(__dirname, filePath);
        const data = await fs.readFile(absolutePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return [];
    }
};

module.exports = readJsonFile;