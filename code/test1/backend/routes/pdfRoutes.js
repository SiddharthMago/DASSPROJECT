const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Endpoint to compare two PDFs
router.post('/compare-pdfs', async (req, res) => {
    const { pdf1Path, pdf2Path } = req.body;

    if (!pdf1Path || !pdf2Path) {
        return res.status(400).json({ success: false, message: 'Both PDF paths are required' });
    }

    const outputDir = path.join(__dirname, '../temp');
    const outputFile = path.join(outputDir, `compare_${Date.now()}`);

    // Ensure the temp directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const command = `python3 ${path.join(__dirname, '../utils/pdf_compare.py')} ${path.join(__dirname, "../", pdf1Path)} ${path.join(__dirname, "../", pdf2Path)} -o ${outputFile}`;

    console.log("Executing command: ", command);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing pdf_compare.py:', error);
            console.error('stderr:', stderr);
            return res.status(500).json({ success: false, message: 'Error comparing PDFs' });
        }

        console.log('PDF comparison output:', stdout);

        // Serve the generated HTML file
        res.json({ success: true, htmlPath: `/temp/${path.basename(outputFile)}/pdf_diff.html` });

        // Delete the directory after a delay (1 minute)
        setTimeout(() => {
            const folderPath = outputFile;
            if (fs.existsSync(folderPath)) {
                // Remove directory recursively
                fs.rm(folderPath, { recursive: true, force: true }, (err) => {
                    if (err) {
                        console.error('Error deleting temporary folder:', err);
                    } else {
                        console.log('Deleted temporary folder:', folderPath);
                    }
                });
            }
        }, 10 * 60 * 1000); // 10 minutes
    });
});

module.exports = router;