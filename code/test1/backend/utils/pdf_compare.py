#!/usr/bin/env python3
"""
Enhanced PDF Comparison Tool

This script compares two PDF files by:
1. Converting PDFs to text (with OCR support for image-based PDFs)
2. Finding differences between their content at both line and word level
3. Generating an HTML file with color-coded differences
4. Providing detailed statistics about the differences
"""

import os
import sys
import re
import pdfplumber
import difflib
import argparse
from datetime import datetime
from pathlib import Path
from tqdm import tqdm
import tempfile
import webbrowser

# Optional OCR support - will be used if available
try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

class PDFComparer:
    """Class to handle PDF comparison and visualization."""
    
    def __init__(self, pdf1_path, pdf2_path, output_path=None, page_range=None, 
                 use_ocr=False, word_level=False):
        """Initialize with paths to PDF files and comparison options.
        
        Args:
            pdf1_path: Path to the first PDF file
            pdf2_path: Path to the second PDF file
            output_path: Path for the HTML output file
            page_range: Tuple of (start_page, end_page) to compare specific pages
            use_ocr: Whether to use OCR for text extraction
            word_level: Whether to perform word-level comparison
        """
        self.pdf1_path = pdf1_path
        self.pdf2_path = pdf2_path
        self.page_range = page_range
        self.use_ocr = use_ocr
        self.word_level = word_level
        
        # Check OCR availability if requested
        if self.use_ocr and not HAS_OCR:
            print("Warning: OCR requested but pytesseract is not installed.")
            print("Installing with: pip install pytesseract pillow")
            print("You may also need to install Tesseract OCR on your system.")
            self.use_ocr = False
        
        # Create default output path if not provided
        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            self.output_path = f"pdf_diff_{timestamp}.html"
        else:
            self.output_path = output_path
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text content from a PDF file.
        
        Uses pdfplumber for text extraction, with optional OCR backup
        for pages where text extraction fails.
        """
        text = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Determine pages to process
                if self.page_range:
                    start, end = self.page_range
                    # Adjust for 0-based indexing
                    start = max(0, start - 1)
                    end = min(len(pdf.pages), end)
                    pages_to_process = range(start, end)
                else:
                    pages_to_process = range(len(pdf.pages))
                
                print(f"Extracting text from {Path(pdf_path).name}...")
                for i in tqdm(pages_to_process, desc="Extracting Pages"):
                    page = pdf.pages[i]
                    page_text = page.extract_text()
                    
                    # If no text found and OCR is enabled, try OCR
                    if not page_text and self.use_ocr:
                        page_text = self._extract_text_with_ocr(page)
                    
                    if page_text:
                        text.append(f"--- Page {i+1} ---\n{page_text}")
                    else:
                        text.append(f"--- Page {i+1} ---\n[No text found on this page]")
            
            return "\n\n".join(text)
        except Exception as e:
            print(f"Error extracting text from {pdf_path}: {e}")
            return ""
    
    def _extract_text_with_ocr(self, page):
        """Extract text from a PDF page using OCR."""
        if not HAS_OCR:
            return ""
        
        try:
            # Render the page as an image
            img = page.to_image(resolution=300)
            
            # Save image to a temporary file
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp:
                temp_filename = temp.name
                img.save(temp_filename)
            
            # Extract text using OCR
            text = pytesseract.image_to_string(Image.open(temp_filename))
            
            # Clean up temporary file
            os.unlink(temp_filename)
            
            return text
        except Exception as e:
            print(f"OCR processing error: {e}")
            return ""
    
    def compare_texts(self, text1, text2):
        """Compare two text strings and return a list of differences."""
        # Split text into lines for better comparison
        text1_lines = text1.splitlines()
        text2_lines = text2.splitlines()
        
        # Generate diff
        diff = difflib.HtmlDiff(wrapcolumn=80)
        diff_html = diff.make_file(text1_lines, text2_lines, 
                                  fromdesc=Path(self.pdf1_path).name, 
                                  todesc=Path(self.pdf2_path).name)
        
        return diff_html
    
    def word_level_comparison(self, text1, text2):
        """Perform word-level comparison and generate enhanced HTML."""
        # Split the texts into words
        def tokenize(text):
            # Split by whitespace but keep punctuation attached to words
            return re.findall(r'\S+', text)
        
        words1 = tokenize(text1)
        words2 = tokenize(text2)
        
        # Get the differences
        matcher = difflib.SequenceMatcher(None, words1, words2)
        
        result1 = []  # Original text with highlights
        result2 = []  # Modified text with highlights
        
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                # Add unchanged text
                result1.extend(words1[i1:i2])
                result2.extend(words2[j1:j2])
            elif tag == 'replace':
                # Highlight modified text
                result1.extend([f'<span class="diff-delete">{word}</span>' for word in words1[i1:i2]])
                result2.extend([f'<span class="diff-add">{word}</span>' for word in words2[j1:j2]])
            elif tag == 'delete':
                # Highlight deleted text
                result1.extend([f'<span class="diff-delete">{word}</span>' for word in words1[i1:i2]])
            elif tag == 'insert':
                # Highlight inserted text
                result2.extend([f'<span class="diff-add">{word}</span>' for word in words2[j1:j2]])
        
        # Reassemble the texts with highlights
        highlighted_text1 = ' '.join(result1)
        highlighted_text2 = ' '.join(result2)
        
        # Create HTML output
        html = f"""<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>PDF Comparison</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }}
                .container {{ display: flex; max-width: 100%; }}
                .column {{ flex: 1; padding: 10px; overflow-wrap: break-word; }}
                .column-left {{ background-color: #f9f9f9; border-right: 1px solid #ddd; }}
                .column-right {{ background-color: #f9f9f9; }}
                h1 {{ text-align: center; color: #333; }}
                h2 {{ color: #444; border-bottom: 1px solid #ddd; padding-bottom: 5px; }}
                .diff-add {{ background-color: #e6ffec; color: #24292f; }}
                .diff-delete {{ background-color: #ffebe9; color: #24292f; }}
                .comparison-header {{ margin-bottom: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; }}
                .summary {{ margin: 20px 0; padding: 15px; background-color: #fff; border: 1px solid #ddd; border-radius: 5px; }}
                pre {{ white-space: pre-wrap; }}
            </style>
        </head>
        <body>
            <div class="comparison-header">
                <h1>PDF Comparison Results (Word Level)</h1>
                <p><strong>Original PDF:</strong> {Path(self.pdf1_path).name}</p>
                <p><strong>Modified PDF:</strong> {Path(self.pdf2_path).name}</p>
                <p><strong>Generated on:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            </div>
            {self._generate_comparison_summary(text1, text2)}
            <div class="container">
                <div class="column column-left">
                    <h2>Original Document</h2>
                    <pre>{highlighted_text1}</pre>
                </div>
                <div class="column column-right">
                    <h2>Modified Document</h2>
                    <pre>{highlighted_text2}</pre>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def _generate_comparison_summary(self, text1, text2):
        """Generate a summary of the comparison statistics."""
        # Calculate statistics
        words1 = re.findall(r'\S+', text1)
        words2 = re.findall(r'\S+', text2)
        chars1 = len(text1)
        chars2 = len(text2)
        
        # Calculate similarity
        text_matcher = difflib.SequenceMatcher(None, text1, text2)
        text_similarity = round(text_matcher.ratio() * 100, 2)
        
        word_matcher = difflib.SequenceMatcher(None, words1, words2)
        word_similarity = round(word_matcher.ratio() * 100, 2)
        
        # Count differences
        changes = 0
        for tag, i1, i2, j1, j2 in word_matcher.get_opcodes():
            if tag != 'equal':
                changes += max(i2 - i1, j2 - j1)
        
        return f"""
        <div class="summary">
            <h2>Comparison Summary</h2>
            <ul>
                <li><strong>Original Document:</strong> {len(words1)} words, {chars1} characters</li>
                <li><strong>Modified Document:</strong> {len(words2)} words, {chars2} characters</li>
                <li><strong>Word Difference:</strong> {abs(len(words2) - len(words1))}</li>
                <li><strong>Character Difference:</strong> {abs(chars2 - chars1)}</li>
                <li><strong>Changed Words:</strong> {changes}</li>
                <li><strong>Text Similarity:</strong> {text_similarity}%</li>
                <li><strong>Word Similarity:</strong> {word_similarity}%</li>
            </ul>
        </div>
        """
    
    def enhance_diff_html(self, diff_html):
        """Enhance the default HTML output with better styling."""
        # Add custom CSS for better readability
        css = """
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            :root {
                --bg-color: #f8f9fa;
                --text-color: #333;
                --card-bg: #fff;
                --header-bg: #e9ecef;
                --border-color: #ddd;
                --diff-add-bg: #e6ffec;
                --diff-chg-bg: #ffefdb;
                --diff-sub-bg: #ffebe9;
                --diff-text: #24292f;
                --primary-color: #2563eb;
                --primary-hover: #1d4ed8;
                --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            }

            [data-theme="dark"] {
                --bg-color: #1a1a1a;
                --text-color: #f0f0f0;
                --card-bg: #2d2d2d;
                --header-bg: #333;
                --border-color: #444;
                --diff-add-bg: #1e4620;
                --diff-chg-bg: #5c3c00;
                --diff-sub-bg: #5c1a1a;
                --diff-text: #f0f0f0;
                --primary-color: #3b82f6;
                --primary-hover: #60a5fa;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: var(--bg-color);
                color: var(--text-color);
                transition: background-color 0.3s, color 0.3s;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
                flex: 1;
            }

            .comparison-header {
                margin-bottom: 2rem;
                padding: 2rem;
                background-color: var(--header-bg);
                border-radius: 12px;
                box-shadow: var(--shadow);
                text-align: center;
            }

            .comparison-header h1 {
                margin-bottom: 1.5rem;
                font-size: 2.5rem;
                color: var(--primary-color);
            }

            .file-info {
                margin: 1rem auto;
                padding: 1.5rem;
                background-color: var(--card-bg);
                border-radius: 12px;
                border: 1px solid var(--border-color);
                max-width: 600px;
                box-shadow: var(--shadow-sm);
            }

            .file-info p {
                margin: 0.75rem 0;
                color: var(--text-color);
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 0.5rem;
            }

            .file-info strong {
                color: var(--primary-color);
                font-weight: 500;
            }

            .file-info .timestamp {
                margin-top: 1.5rem;
                font-size: 0.9rem;
                opacity: 0.8;
            }

            .summary {
                margin: 2rem auto;
                padding: 2rem;
                background-color: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                max-width: 800px;
                box-shadow: var(--shadow);
            }

            .summary h2 {
                text-align: center;
                margin-bottom: 2rem;
                color: var(--primary-color);
            }

            .summary-stats {
                display: flex;
                justify-content: center;
                gap: 3rem;
                margin-top: 1rem;
            }

            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 1.5rem;
                background-color: var(--header-bg);
                border-radius: 12px;
                min-width: 180px;
                box-shadow: var(--shadow-sm);
                transition: transform 0.2s, box-shadow 0.2s;
            }

            .stat-item:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow);
            }

            .stat-label {
                font-size: 1rem;
                color: var(--text-color);
                opacity: 0.8;
                margin-bottom: 0.75rem;
            }

            .stat-value {
                font-size: 2rem;
                font-weight: 600;
                color: var(--primary-color);
            }

            table.diff {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.95rem;
                background-color: var(--card-bg);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow);
                margin: 2rem auto;
            }

            .theme-toggle {
                position: fixed;
                top: 2rem;
                right: 2rem;
                padding: 0.75rem 1.5rem;
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s;
                z-index: 1000;
                box-shadow: var(--shadow);
            }

            .theme-toggle:hover {
                background-color: var(--primary-hover);
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            @media (max-width: 768px) {
                .container {
                    padding: 1rem;
                }

                .comparison-header {
                    padding: 1.5rem;
                }

                .comparison-header h1 {
                    font-size: 2rem;
                }

                .file-info {
                    padding: 1rem;
                }

                .summary {
                    padding: 1.5rem;
                }

                .summary-stats {
                    flex-direction: column;
                    gap: 1rem;
                }

                .stat-item {
                    width: 100%;
                }

                .theme-toggle {
                    top: 1rem;
                    right: 1rem;
                }
            }
        </style>
        
        <script>
            // Theme toggle functionality
            document.addEventListener('DOMContentLoaded', function() {
                const themeToggle = document.createElement('button');
                themeToggle.className = 'theme-toggle';
                themeToggle.textContent = 'Toggle Dark Mode';
                document.body.appendChild(themeToggle);

                themeToggle.addEventListener('click', function() {
                    const html = document.documentElement;
                    const currentTheme = html.getAttribute('data-theme');
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    html.setAttribute('data-theme', newTheme);
                });

                // Add page navigation functionality
                const pageHeaders = document.querySelectorAll('tr:has(td:contains("--- Page"))');
                if (pageHeaders.length > 0) {
                    const jumpDiv = document.createElement('div');
                    jumpDiv.id = 'pagejump';
                    
                    const label = document.createElement('label');
                    label.textContent = 'Jump to Page:';
                    jumpDiv.appendChild(label);
                    
                    const select = document.createElement('select');
                    pageHeaders.forEach(header => {
                        const pageText = header.textContent.match(/--- Page (\\d+) ---/);
                        if (pageText && pageText[1]) {
                            const option = document.createElement('option');
                            option.value = header.id || '';
                            option.textContent = pageText[1];
                            select.appendChild(option);
                        }
                    });
                    
                    select.addEventListener('change', function() {
                        if (this.value) {
                            document.getElementById(this.value).scrollIntoView({
                                behavior: 'smooth'
                            });
                        }
                    });
                    
                    jumpDiv.appendChild(select);
                    document.body.appendChild(jumpDiv);
                }
            });
        </script>
        """
        
        # Insert our custom CSS and JavaScript in the head
        enhanced_html = diff_html.replace("</head>", f"{css}</head>")
        
        # Add a better header/title section with file info cards
        header = f"""
        <div class="container">
            <div class="comparison-header">
                <h1>PDF Comparison Results</h1>
                <div class="file-info">
                    <p><strong>Original:</strong> {Path(self.pdf1_path).name}</p>
                    <p><strong>Modified:</strong> {Path(self.pdf2_path).name}</p>
                    <p class="timestamp"><strong>Generated on:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
                </div>
            </div>
        </div>
        """
        
        enhanced_html = enhanced_html.replace("<body>", f"<body>{header}")
        return enhanced_html
    
    def add_summary(self, html, text1, text2):
        """Add a summary section with statistics about differences."""
        text1_lines = text1.splitlines()
        text2_lines = text2.splitlines()
        
        # Calculate basic stats
        # Use SequenceMatcher to get more detailed difference info
        matcher = difflib.SequenceMatcher(None, text1, text2)
        text_similarity = round(matcher.ratio() * 100, 2)
        
        # Count differences more precisely
        s = difflib.SequenceMatcher(None, text1_lines, text2_lines)
        changes = 0
        for tag, i1, i2, j1, j2 in s.get_opcodes():
            if tag != 'equal':
                changes += max(i2 - i1, j2 - j1)
        
        summary = f"""
        <div class="summary">
            <h2>Comparison Summary</h2>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">Similarity</span>
                    <span class="stat-value">{text_similarity}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Changed Lines</span>
                    <span class="stat-value">{changes}</span>
                </div>
            </div>
        </div>
        """
        
        # Insert after the header
        header_end = html.find("</div>", html.find("comparison-header")) + 6
        enhanced_html = html[:header_end] + summary + html[header_end:]
        return enhanced_html
    
    def compare_pdfs(self):
        """Compare PDFs and generate HTML output with differences."""
        print(f"Extracting text from {self.pdf1_path}...")
        text1 = self.extract_text_from_pdf(self.pdf1_path)
        
        print(f"Extracting text from {self.pdf2_path}...")
        text2 = self.extract_text_from_pdf(self.pdf2_path)
        
        if not text1 or not text2:
            print("Error: Failed to extract text from one or both PDFs.")
            return False
        
        print("Comparing texts...")
        
        # Choose comparison method based on options
        if self.word_level:
            print("Generating word-level comparison...")
            diff_html = self.word_level_comparison(text1, text2)
            
            print(f"Writing comparison to {self.output_path}...")
            with open(self.output_path, 'w', encoding='utf-8') as f:
                f.write(diff_html)
        else:
            print("Generating line-level comparison...")
            diff_html = self.compare_texts(text1, text2)
            
            print("Enhancing HTML output...")
            enhanced_html = self.enhance_diff_html(diff_html)
            enhanced_html = self.add_summary(enhanced_html, text1, text2)
            
            print(f"Writing comparison to {self.output_path}...")
            with open(self.output_path, 'w', encoding='utf-8') as f:
                f.write(enhanced_html)
        
        print(f"Comparison complete! Results saved to {self.output_path}")
        return True

def main():
    """Parse command line arguments and run the comparison."""
    parser = argparse.ArgumentParser(description="Compare two PDF files and highlight differences")
    parser.add_argument("pdf1", help="Path to the first PDF file")
    parser.add_argument("pdf2", help="Path to the second PDF file")
    parser.add_argument("-o", "--output", help="Path to the output HTML file", default=None)
    parser.add_argument("-p", "--pages", help="Page range to compare (e.g., '1-5')", default=None)
    parser.add_argument("--ocr", action="store_true", help="Use OCR for text extraction when needed")
    parser.add_argument("--word-level", action="store_true", help="Perform word-level comparison")
    args = parser.parse_args()
    
    if not os.path.isfile(args.pdf1):
        print(f"Error: First PDF file '{args.pdf1}' not found.")
        return 1
    
    if not os.path.isfile(args.pdf2):
        print(f"Error: Second PDF file '{args.pdf2}' not found.")
        return 1
    
    # Parse page range if provided
    page_range = None
    if args.pages:
        try:
            start, end = map(int, args.pages.split('-'))
            page_range = (start, end)
        except ValueError:
            print(f"Error: Invalid page range '{args.pages}'. Format should be 'start-end', e.g., '1-5'.")
            return 1
    
    # Ensure fileComparison folder exists
    output_folder = ensure_file_comparison_folder()
    
    # If output path is not provided, create one in the fileComparison folder
    if args.output is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        args.output = output_folder / f"pdf_diff_{timestamp}.html"
    
    comparer = PDFComparer(
        args.pdf1, 
        args.pdf2, 
        args.output, 
        page_range=page_range,
        use_ocr=args.ocr,
        word_level=args.word_level
    )
    
    success = comparer.compare_pdfs()
    
    if success:
        # Open the HTML file in the default browser
        open_html_file(args.output)
    
    return 0 if success else 1

def ensure_file_comparison_folder():
    """Ensure the fileComparison folder exists and return its path."""
    folder_path = Path("fileComparison")
    folder_path.mkdir(exist_ok=True)
    return folder_path

def open_html_file(file_path):
    """Open the HTML file in the default web browser."""
    try:
        webbrowser.open(f'file://{os.path.abspath(file_path)}')
    except Exception as e:
        print(f"Warning: Could not open HTML file automatically: {e}")

if __name__ == "__main__":
    sys.exit(main())