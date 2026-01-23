const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/data/posts/legal-terminology.json');
const outputPath = path.join(__dirname, '../src/data/legalTerms.json');
const outputTsPath = path.join(__dirname, '../src/data/legalTerms.ts');

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const json = JSON.parse(rawData);
    const content = json.content;

    // Split by h2 tags to get chunks
    // Note: The first chunk is before the first h2, so we skip it or check it.
    const chunks = content.split('<h2 class="wp-block-heading">');
    
    const terms = [];

    // Skip the first chunk (intro text before first term)
    for (let i = 1; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Structure: TERM TITLE</h2> ... <p>DEFINITION</p> ...
        
        const h2EndIndex = chunk.indexOf('</h2>');
        if (h2EndIndex === -1) continue;

        let rawTitle = chunk.substring(0, h2EndIndex).trim();
        
        // Clean Title
        // Remove HTML entities like &#8211; (–), &#8220; (“), &#8221; (”)
        rawTitle = rawTitle.replace(/&#8211;/g, '-').replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8217;/g, "'");
        // Remove strong tags if present
        rawTitle = rawTitle.replace(/<\/?strong>/g, '');
        
        // Remove trailing " - ..." if present (often the title is "TERM - Definition summary")
        // We generally want just the TERM part for the card header
        let term = rawTitle;
        if (term.includes(' - ')) {
            term = term.split(' - ')[0].trim();
        } else if (term.includes(' – ')) { // En dash
             term = term.split(' – ')[0].trim();
        }
        
        // Now find the definition in <p> tags
        // It might be immediate or after some whitespace
        const pStart = chunk.indexOf('<p>', h2EndIndex);
        if (pStart === -1) continue;
        
        const pEnd = chunk.indexOf('</p>', pStart);
        if (pEnd === -1) continue;
        
        let definition = chunk.substring(pStart + 3, pEnd).trim();
        
        // Clean Definition
        definition = definition.replace(/&#8211;/g, '-').replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#8217;/g, "'").replace(/&#8230;/g, '...');
        
        if (term && definition) {
            terms.push({
                term: term,
                definition: definition
            });
        }
    }

    // Sort alphabetically
    terms.sort((a, b) => a.term.localeCompare(b.term));

    // Write to JSON
    // Ensure dir exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(terms, null, 2));
    
    // Write a TS wrapper for easy import
    const tsContent = `export interface LegalTerm {
  term: string;
  definition: string;
}

export const legalTerms: LegalTerm[] = ${JSON.stringify(terms, null, 2)};
`;
    fs.writeFileSync(outputTsPath, tsContent);

    console.log(`Successfully extracted ${terms.length} legal terms.`);

} catch (err) {
    console.error('Error extracting terms:', err);
    process.exit(1);
}
