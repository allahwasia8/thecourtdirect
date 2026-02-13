import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COURTS_FILE = path.join(__dirname, '../public/data/courts.json');
const POSTS_DIR = path.join(__dirname, '../public/data/posts');
const API_KEY = process.env.GROQ_API_KEY;

// Target Lengths
const TITLE_MIN = 50;
const TITLE_MAX = 64;
const DESC_MIN = 150;
const DESC_MAX = 160;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '10');

async function callGroq(prompt) {
    if (!API_KEY) {
        // console.warn("No GROQ_API_KEY found, using local patterns only.");
        return null;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: "You are an SEO expert. Output only the requested text. No quotes, no preamble." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 100
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim();
    } catch (error) {
        console.error("Groq API error:", error.message);
        return null;
    }
}

function generateMetadataLocal(item, type = 'court') {
    const name = item.name || item.title || "Court";
    const city = item.city || item.address?.split(',').slice(-2, -1)[0]?.trim() || "";
    const state = item.state || item.address?.split(',').slice(-1)[0]?.trim()?.split(' ')?.[0] || "";
    const phone = item.phone || "";
    const address = item.address || "";

    // Title Pattern: [Name] in [City], [State] | Address & Phone | The Court Direct
    let title = `${name} in ${city}, ${state} | Contact & Directions`;
    if (title.length > TITLE_MAX) {
        title = `${name} | ${city}, ${state} | Court Details`;
    }
    if (title.length > TITLE_MAX) {
        title = `${name} - ${city}, ${state}`;
    }
    if (title.length > TITLE_MAX) {
        // Ultimate truncation: Name only or Name + State
        title = `${name.substring(0, TITLE_MAX - 10)}... | ${state}`;
    }
    
    if (title.length < TITLE_MIN && !title.includes(" - Address, Phone & Hours")) {
        title = title + " - Address, Phone & Hours";
    }
    
    title = title.substring(0, TITLE_MAX).trim();

    // Description Pattern
    let desc = "";
    if (address && phone) {
        desc = `Official information for ${name} at ${address}. Contact the court at ${phone} for case search, dockets, and local legal resources in ${city}, ${state}.`;
    } else if (city && state) {
        desc = `Find ${name} information in ${city}, ${state}. Access court dockets, case search tools, and official judicial resources for ${name}.`;
    } else {
        desc = `Comprehensive guide to ${name}. Explore historical background, jurisdictional powers, court procedures, and essential resources for ${name}.`;
    }
    
    // Truncate or pad
    if (desc.length > DESC_MAX) {
        desc = desc.substring(0, DESC_MAX - 3) + "...";
    }
    
    return { title, desc };
}

async function processCourts() {
    if (!fs.existsSync(COURTS_FILE)) return;
    const courts = JSON.parse(fs.readFileSync(COURTS_FILE, 'utf8'));
    let updated = 0;

    console.log(`\n--- Processing Courts (Limit: ${LIMIT}) ---`);

    for (const court of courts) {
        if (updated >= LIMIT) break;

        const currentTitle = court.metaTitle || "";
        const currentDesc = court.metaDescription || "";

        // Check if needs update
        const needsTitle = currentTitle.length < TITLE_MIN || currentTitle.length > TITLE_MAX;
        const needsDesc = currentDesc.length < DESC_MIN || currentDesc.length > DESC_MAX || currentDesc.includes("xxx");

        if (needsTitle || needsDesc) {
            const local = generateMetadataLocal(court);
            
            let finalTitle = local.title;
            let finalDesc = local.desc;

            // Optional LLM refinement for descriptions that are too boilerplate
            if (!DRY_RUN && API_KEY) {
                const prompt = `Generate a unique SEO meta description (150-160 chars) for ${court.name} in ${court.city || ''}, ${court.state || ''}. Address: ${court.address || ''}. Phone: ${court.phone || ''}. Include a call to action.`;
                const llmDesc = await callGroq(prompt);
                if (llmDesc && llmDesc.length >= DESC_MIN && llmDesc.length <= DESC_MAX + 20) {
                    finalDesc = llmDesc.substring(0, DESC_MAX);
                }
            }

            console.log(`Court: ${court.id}`);
            if (needsTitle) console.log(`  Title: [${currentTitle.length}] -> [${finalTitle.length}] ${finalTitle}`);
            if (needsDesc) console.log(`  Desc:  [${currentDesc.length}] -> [${finalDesc.length}] ${finalDesc}`);

            if (!DRY_RUN) {
                court.metaTitle = finalTitle;
                court.metaDescription = finalDesc;
            }
            updated++;
        }
    }

    if (!DRY_RUN && updated > 0) {
        fs.writeFileSync(COURTS_FILE, JSON.stringify(courts, null, 2));
        console.log(`Saved ${updated} updates to courts.json`);
    }
}

async function processPosts() {
    if (!fs.existsSync(POSTS_DIR)) return;
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
    let updated = 0;

    console.log(`\n--- Processing Posts (Limit: ${LIMIT}) ---`);

    for (const file of files) {
        if (updated >= LIMIT) break;

        const filePath = path.join(POSTS_DIR, file);
        const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const currentTitle = post.metaTitle || "";
        const currentDesc = post.metaDescription || "";

        const needsTitle = !currentTitle || currentTitle.length < TITLE_MIN || currentTitle.length > TITLE_MAX;
        const needsDesc = !currentDesc || currentDesc.length < DESC_MIN || currentDesc.length > DESC_MAX;

        if (needsTitle || needsDesc) {
            // Extract address/phone from content if possible
            const addressMatch = post.content?.match(/Address:<\/strong>\s*([^<]+)/i);
            const phoneMatch = post.content?.match(/Phone:<\/strong>\s*([^<]+)/i);
            
            const cityStateMatch = addressMatch?.[1]?.match(/([^,]+),\s*([A-Z]{2})\s*\d{5}/);
            
            const item = {
                name: post.title,
                address: addressMatch?.[1]?.trim() || "",
                phone: phoneMatch?.[1]?.trim() || "",
                city: cityStateMatch?.[1]?.trim() || "",
                state: cityStateMatch?.[2]?.trim() || "",
            };

            const local = generateMetadataLocal(item, 'post');
            let finalTitle = local.title;
            let finalDesc = local.desc;

            if (!DRY_RUN && API_KEY) {
                const prompt = `Generate a unique SEO meta description (150-160 chars) for a blog post titled "${post.title}". Include these details: Address ${item.address}, Phone ${item.phone}.`;
                const llmDesc = await callGroq(prompt);
                if (llmDesc && llmDesc.length >= DESC_MIN) {
                    finalDesc = llmDesc.substring(0, DESC_MAX);
                }
            }

            console.log(`Post: ${file}`);
            if (needsTitle) console.log(`  Title: [${currentTitle.length}] -> [${finalTitle.length}] ${finalTitle}`);
            if (needsDesc) console.log(`  Desc:  [${currentDesc.length}] -> [${finalDesc.length}] ${finalDesc}`);

            if (!DRY_RUN) {
                post.metaTitle = finalTitle;
                post.metaDescription = finalDesc;
                fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
            }
            updated++;
        }
    }
}

async function main() {
    console.log(`Starting metadata optimization... (Dry Run: ${DRY_RUN})`);
    await processCourts();
    await processPosts();
    console.log("\nDone.");
}

main();
