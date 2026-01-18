const fs = require('fs');
const https = require('https');
const path = require('path');

const PEXELS_API_KEY = 'QtGASQFn9Ah3Rw1pO58DOQ7QGGwdEv9DXPTupysI6mvI1vH8wgZ0BQyh';
const OUTPUT_DIR = 'captcha-images';
const TOTAL_IMAGES = 150;
const PEOPLE_PERCENTAGE = 0.30; // 30% with people
const PEOPLE_COUNT = Math.floor(TOTAL_IMAGES * PEOPLE_PERCENTAGE); // ~45 images
const NON_PEOPLE_COUNT = TOTAL_IMAGES - PEOPLE_COUNT; // ~105 images

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// People queries
const peopleQueries = ['people', 'person', 'human', 'crowd', 'group of people', 'family', 'friends', 'team', 'portrait', 'woman', 'man'];

// Non-people queries
const nonPeopleQueries = ['traffic light', 'crosswalk', 'street', 'building', 'nature', 'animal', 'mountain', 'ocean', 'tree', 'car', 'bicycle', 'architecture', 'landscape', 'city', 'park', 'road', 'sky', 'clouds', 'grass', 'flower'];

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirects
                file.close();
                fs.unlinkSync(filename);
                downloadImage(response.headers.location, filename).then(resolve).catch(reject);
            } else {
                file.close();
                fs.unlinkSync(filename);
                reject(new Error(`Failed to download: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(filename)) {
                fs.unlinkSync(filename);
            }
            reject(err);
        });
    });
}

function fetchPexelsImages(query, count, page = 1) {
    return new Promise((resolve, reject) => {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=80&page=${page}&orientation=square`;
        
        https.get(url, {
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const photos = json.photos || [];
                    // Use tiny images (lowest resolution)
                    const urls = photos.map(p => p.src.tiny || p.src.small || p.src.medium).slice(0, count);
                    resolve(urls);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

async function downloadAllImages() {
    console.log(`Downloading ${TOTAL_IMAGES} images (${PEOPLE_COUNT} with people, ${NON_PEOPLE_COUNT} without)...`);
    
    let downloaded = 0;
    let peopleDownloaded = 0;
    let nonPeopleDownloaded = 0;
    
    // Download people images
    console.log(`\nDownloading ${PEOPLE_COUNT} images with people...`);
    const peopleQueriesToUse = [...peopleQueries];
    let peopleIndex = 0;
    
    while (peopleDownloaded < PEOPLE_COUNT) {
        const query = peopleQueriesToUse[peopleIndex % peopleQueriesToUse.length];
        const page = Math.floor(Math.random() * 5) + 1; // Random page 1-5
        const needed = PEOPLE_COUNT - peopleDownloaded;
        const toFetch = Math.min(needed + 10, 80); // Fetch a bit extra in case some fail
        
        try {
            const urls = await fetchPexelsImages(query, toFetch, page);
            
            for (const url of urls) {
                if (peopleDownloaded >= PEOPLE_COUNT) break;
                
                const filename = path.join(OUTPUT_DIR, `people_${peopleDownloaded + 1}.jpg`);
                
                try {
                    await downloadImage(url, filename);
                    peopleDownloaded++;
                    downloaded++;
                    process.stdout.write(`\rPeople images: ${peopleDownloaded}/${PEOPLE_COUNT} | Total: ${downloaded}/${TOTAL_IMAGES}`);
                } catch (err) {
                    console.error(`\nFailed to download ${url}: ${err.message}`);
                }
            }
        } catch (err) {
            console.error(`\nError fetching people images for "${query}": ${err.message}`);
        }
        
        peopleIndex++;
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Download non-people images
    console.log(`\n\nDownloading ${NON_PEOPLE_COUNT} images without people...`);
    const nonPeopleQueriesToUse = [...nonPeopleQueries];
    let nonPeopleIndex = 0;
    
    while (nonPeopleDownloaded < NON_PEOPLE_COUNT) {
        const query = nonPeopleQueriesToUse[nonPeopleIndex % nonPeopleQueriesToUse.length];
        const page = Math.floor(Math.random() * 5) + 1; // Random page 1-5
        const needed = NON_PEOPLE_COUNT - nonPeopleDownloaded;
        const toFetch = Math.min(needed + 10, 80); // Fetch a bit extra in case some fail
        
        try {
            const urls = await fetchPexelsImages(query, toFetch, page);
            
            for (const url of urls) {
                if (nonPeopleDownloaded >= NON_PEOPLE_COUNT) break;
                
                const filename = path.join(OUTPUT_DIR, `nonpeople_${nonPeopleDownloaded + 1}.jpg`);
                
                try {
                    await downloadImage(url, filename);
                    nonPeopleDownloaded++;
                    downloaded++;
                    process.stdout.write(`\rNon-people images: ${nonPeopleDownloaded}/${NON_PEOPLE_COUNT} | Total: ${downloaded}/${TOTAL_IMAGES}`);
                } catch (err) {
                    console.error(`\nFailed to download ${url}: ${err.message}`);
                }
            }
        } catch (err) {
            console.error(`\nError fetching non-people images for "${query}": ${err.message}`);
        }
        
        nonPeopleIndex++;
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n\n✅ Complete! Downloaded ${downloaded} images:`);
    console.log(`   - ${peopleDownloaded} with people`);
    console.log(`   - ${nonPeopleDownloaded} without people`);
    console.log(`\nImages saved to: ${OUTPUT_DIR}/`);
}

downloadAllImages().catch(console.error);
