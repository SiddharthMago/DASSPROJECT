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

    // Ensure the temp directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const command = `python3 ${path.join(__dirname, '../utils/pdf_compare.py')} ${path.join(__dirname, "../", pdf1Path)} ${path.join(__dirname, "../", pdf2Path)}`;

    console.log("Executing command: ", command);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing pdf_compare.py:', error);
            console.error('stderr:', stderr);
            return res.status(500).json({ success: false, message: 'Error comparing PDFs' });
        }

        console.log('PDF comparison output:', stdout);

        // Extract the report path from Python script output
        // The Python script returns the full path to comparison_report.html
        const reportPathMatch = stdout.match(/Report saved: (.+)/);
        if (!reportPathMatch) {
            console.error('Could not find report path in Python output');
            return res.status(500).json({ success: false, message: 'Could not locate comparison report' });
        }

        const fullReportPath = reportPathMatch[1].trim();
        console.log('Full report path:', fullReportPath);
        
        // Extract the relative path from backend/temp/
        const tempDir = path.join(__dirname, '../temp');
        const relativePath = path.relative(tempDir, fullReportPath);
        const htmlPath = `/temp/${relativePath.replace(/\\/g, '/')}`;  // Ensure forward slashes for URL
        
        console.log('Serving HTML at:', htmlPath);

        // Serve the generated HTML file
        res.json({ success: true, htmlPath: htmlPath });

        // Delete the directory after a delay (10 minutes)
        setTimeout(() => {
            const comparisonDir = path.dirname(fullReportPath);
            if (fs.existsSync(comparisonDir)) {
                // Remove directory recursively
                fs.rm(comparisonDir, { recursive: true, force: true }, (err) => {
                    if (err) {
                        console.error('Error deleting temporary folder:', err);
                    } else {
                        console.log('Deleted temporary folder:', comparisonDir);
                    }
                });
            }
        }, 10 * 60 * 1000); // 10 minutes
    });
});

module.exports = router;