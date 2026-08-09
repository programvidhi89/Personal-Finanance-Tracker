const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.includes("'http://localhost:8080/api")) {
                content = content.replace(/'http:\/\/localhost:8080\/api/g, "import.meta.env.VITE_API_BASE_URL + '");
                modified = true;
            }

            if (content.includes("`http://localhost:8080/api")) {
                content = content.replace(/`http:\/\/localhost:8080\/api/g, "`${import.meta.env.VITE_API_BASE_URL}");
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
