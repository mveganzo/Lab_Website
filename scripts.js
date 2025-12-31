// --- Configuration & Setup --- 
let currentPage = 'home'; 
const contentArea = document.getElementById('content-area'); 
const loadingSpinner = document.getElementById('loading-spinner'); 
const errorMessage = document.getElementById('error-message'); 
const dataCache = {}; 
const MAX_RETRIES = 3; 

// Added data paths.
const DATA_PATHS = { 
    team: './data/team/team.json', 
    research: './data/research/research.txt', 
    publications: './data/publications/publications.json', 
    home: './data/home/content.json',
    join: './data/join/join.md'
}; 

document.getElementById('current-year').textContent = new Date().getFullYear(); 

// --- Core Fetching Logic --- 
async function fetchData(key, path, isText = false) { 
    if (dataCache[key]) return dataCache[key]; 

    for (let i = 0; i < MAX_RETRIES; i++) { 
        try { 
            const response = await fetch(path); 
            if (!response.ok) { 
                if (response.status === 404) { 
                    console.warn(`Data file not found: ${path}. Assuming no content for this page.`); 
                    // Return empty structure for JSON or placeholder text for TXT 
                    return isText ? 'No content available yet.' : []; 
                } 
                throw new Error(`HTTP error! Status: ${response.status}`); 
            } 

            const data = isText ? await response.text() : await response.json(); 
            dataCache[key] = data; // Cache the result 
            return data; 

        } catch (error) { 
            console.error(`Attempt ${i + 1} failed for ${key} (${path}):`, error); 
            if (i < MAX_RETRIES - 1) { 
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay)); 
            } 
        } 
    } 
    return null; 
} 

// --- Rendering Functions (Pages) --- 
function renderNewsCarousel(sortedNews) {
    if (sortedNews.length === 0) return '';
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    
    // Generate HTML for all news slides
    const newsItemsHtml = sortedNews.map((item, index) => `
        <div class="news-slide p-5 transition-opacity duration-700 ease-in-out" data-index="${index}" style="${index === 0 ? '' : 'display: none;'}">
            <div class="flex flex-col md:flex-row items-center md:space-x-8">
                <div class="flex-shrink-0 w-full md:w-1/3 mb-4 md:mb-0">
                    <img class="w-full h-48 object-contain bg-white border border-gray-200 rounded-lg shadow-md" 
                    src="data/home/images/${item.image || 'default.jpg'}" 
                    alt="${item.title}"
                    onerror="this.onerror=null; this.src='https://placehold.co/400x192/f3f4f6/6b7280?text=NEWS'">
                </div>
                <div class="md:w-2/3">
                    <p class="text-sm font-medium text-gray-600 uppercase mb-2">${new Date(item.date).toLocaleDateString('en-US', dateOptions)}</p>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">${item.title}</h3>
                    <p class="text-gray-700">${item.summary}</p>
                    ${item.link ? `
                        <a href="${item.link}" target="_blank" class="text-blue-600 hover:underline font-medium mt-3 inline-block">
                            Read more &rarr;
                        </a>
                    ` : ''}
                    </div>
            </div>
        </div>
    `).join('');

    return `
        <div id="news-carousel" class="bg-white rounded-xl shadow-lg mb-8 relative overflow-hidden border-t-4 border-gray-500">
            <h2 class="text-3xl font-bold text-gray-900 text-center pt-6">Latest News</h2>
            <div id="news-slides-container" class="min-h-[250px] flex items-center">
                ${newsItemsHtml}
            </div>
            <button onclick="changeNewsSlide(-1)" class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white p-3 rounded-r-lg opacity-70 hover:opacity-100 transition duration-150 focus:outline-none focus:ring-4 focus:ring-blue-500 z-20">
                &lt;
            </button>
            <button onclick="changeNewsSlide(1)" class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white p-3 rounded-l-lg opacity-70 hover:opacity-100 transition duration-150 focus:outline-none focus:ring-4 focus:ring-blue-500 z-20">
                &gt;
            </button>
        </div>
    `;
}

async function renderHome() {
    // Fetch all necessary data for the home page
    const homeData = await fetchData('home', DATA_PATHS.home);

    const hasOpenPositions = homeData ? (homeData.hasOpenPositions === true) : false;
    const newsData = homeData?.news || [];
    const sponsorsData = homeData?.sponsors || [];

    // Sort news by date descending for display
    const sortedNews = Array.isArray(newsData) && newsData.length > 0
    ? newsData.sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

    // --- 0. TOP TITLE ---
    const topTitle = `
        <h1 class="text-4xl md:text-3xl font-medium text-gray-900 mb-5 leading-tight">
            Welcome to the Artificial Intelligence and Computer Vision Laboratory
        </h1>
    `;

    // --- 1. HERO SECTION ---
    const heroSection = `
        <div class="relative bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-6 h-[350px] md:h-[450px] flex items-center justify-center">
            <img class="w-full h-full object-cover" 
                    src="data/home/images/lab_pic.jpg" 
                    alt="AICV Lab Main Photo"
                    onerror="this.onerror=null; this.src='https://placehold.co/1200x450/374151/D1D5DB?text=AICV+Lab+Image';">
        </div>
    `;

    // --- 2. ABOUT SECTION ---
     const aboutSection = `
        <div class="mb-6 p-8 bg-gray-50 rounded-xl border border-gray-200">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Who we are</h2>
            <p class="text-gray-700 leading-relaxed mb-4">
                We aim to advance research in computer vision, robotics, and medical imaging. Over the past few years, we have made significant progress in these fields through our cutting-edge research and collaboration with leading experts in the field. Our work has resulted in numerous publications in top-tier conferences and journals, and we continue to push the boundaries of what is possible with our advanced machine learning techniques, particularly in the areas of deep neural networks. We are excited to continue our research and contribute to the field of computer vision, robotics, and medical imaging.
            </p>
            <a href="#" onclick="navigate('research'); return false;" class="text-blue-600 hover:underline font-medium inline-block">Learn more about our research &rarr;</a>
        </div>
    `;

    // --- 3. OPEN POSITIONS ALERT ---
    let positionsAlert = '';
    if (hasOpenPositions) { 
        positionsAlert = `
            <div class="mb-6 p-4 text-center bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 rounded-lg shadow-inner">
                <p class="font-medium">
                    We are currently accepting applications! 
                    <a href="#" onclick="navigate('join'); return false;" class="underline hover:text-yellow-900 font-bold">See open positions &rarr;</a>
                </p>
            </div>
        `;
    }

    // --- 4. DYNAMIC NEWS CAROUSEL ---
    const newsCarousel = renderNewsCarousel(sortedNews);

    // --- 5. SPONSORS/AFFILIATIONS SECTION ---
    let sponsorsSection = '';
    if (sponsorsData && sponsorsData.length > 0) {
        const logoHtml = sponsorsData.map(sponsor => `
            <div class="p-4 flex items-center justify-center">
                <img src="data/home/images/${sponsor.logo}" alt="${sponsor.name} Logo" 
                    class="h-16 w-auto object-contain"
                    onerror="this.onerror=null; this.src='https://placehold.co/120x64/f3f4f6/6b7280?text=LOGO'">
            </div>
        `).join('');

        sponsorsSection = `
            <div class="mt-16 pt-8 border-t border-gray-200">
                <h2 class="text-2xl font-bold text-center text-gray-700 mb-8">Our Sponsors & Affiliations</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    ${logoHtml}
                </div>
            </div>
        `;
    }

    // Combine all sections: Title -> Hero -> About -> Positions -> News -> Sponsors
    return topTitle + heroSection + aboutSection + positionsAlert + newsCarousel + sponsorsSection;
}

function renderCard(title, description, page) { 
    return ` 
        <div class="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border-t-4 border-gray-300"> 
            <h3 class="text-2xl font-semibold text-gray-900">${title}</h3> 
            <p class="mt-2 text-gray-500">${description}</p> 
            <!-- Link color changed to gray-800 --> 
            <a href="#" onclick="navigate('${page}'); return false;" class="mt-4 inline-block text-gray-800 font-medium hover:underline">Go to ${title} &rarr;</a> 
        </div> 
    `; 
} 

// --- Global Variable for Team Data ---
let globalTeamData = [];

async function renderTeamPage() {
    const teamData = await fetchData('team', DATA_PATHS.team);
    globalTeamData = teamData || []; // Store data globally so the modal can find it later

    if (!teamData || teamData.length === 0) {
        return `<h2 class="text-3xl font-bold text-gray-900 mb-6">Our Team</h2><p>No team data available. Please populate the <code>${DATA_PATHS.team}</code> file.</p>`;
    }

    // --- Define Custom Sorting Order ---
    const positionOrder = {
        "Principal Investigator": 1, "Researcher": 2, "PhD Student": 3,
        "Masters Student": 4, "Undergraduate Student": 5, "Visiting Scholar": 6, "Alumni": 7, "Other": 99
    };

    // --- Group Data ---
    const groupedData = teamData.reduce((acc, member) => {
        const positionKey = member.position || 'Other';
        if (!acc[positionKey]) acc[positionKey] = [];
        acc[positionKey].push(member);
        return acc;
    }, {});
    
    // --- Sort Groups ---
    const sortedPositions = Object.keys(groupedData).sort((a, b) => {
        const orderA = positionOrder[a] || positionOrder['Other'];
        const orderB = positionOrder[b] || positionOrder['Other'];
        return orderA - orderB;
    });

    // --- Generate HTML ---
    const sectionsHtml = sortedPositions.map(position => {
        const members = groupedData[position];

        const membersCardsHtml = members.map((member) => {
             // Create a safe ID for the click handler
             const memberId = member.email || member.name;
             const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2);
             const timeDisplay = member.years || '';

             return `
                <div onclick="openTeamModal('${memberId}')" class="cursor-pointer group bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col items-center text-center transform hover:-translate-y-1">
                    
                    <div class="relative w-48 h-48 mb-4">
                        ${member.photo ?
                            `<img src="data/team/images/${member.photo}" alt="${member.name}" 
                            class="w-full h-full object-contain rounded-md shadow-sm" 
                            onerror="this.onerror=null; this.src='https://placehold.co/200/e5e7eb/9ca3af?text=${initials}'">`
                            :
                            `<div class="w-full h-full rounded-md bg-gray-100 flex items-center justify-center text-4xl text-gray-500 font-bold border border-gray-200">
                                ${initials}
                            </div>`
                        }
                    </div>

                    <h3 class="text-xl font-bold text-gray-900 leading-tight">${member.name}</h3>
                    
                    <p class="text-sm font-medium text-gray-500 mt-2">${timeDisplay}</p>
                    
                    <p class="text-xs text-blue-600 mt-3 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Profile &rarr;</p>
                </div>
            `;
        }).join('');

        return `
            <div class="pt-8">
                <h3 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 border-gray-300">${position}</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${membersCardsHtml}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl font-extrabold text-gray-900 mb-8 border-b-4 pb-3 border-gray-500">Our Team</h2>
            ${sectionsHtml}
        </div>
    `;
}

// --- Modal Functions ---

function openTeamModal(memberId) {
    // 1. Find the member
    const member = globalTeamData.find(m => (m.email || m.name) === memberId);
    if (!member) return;

    const modal = document.getElementById('team-modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;

    const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2);

    // A. Render Links (Format: "Label: Link")
    const renderLinks = (links) => {
        if (!links || !Array.isArray(links)) return '';
        
        return links.map(link => {
            // Determine button text based on the URL or Label
            const isPdf = link.url.toLowerCase().endsWith('.pdf');
            const linkText = isPdf ? 'Download PDF' : 'Visit Link';

            return `
                <div class="mb-3 flex items-center text-sm">
                    <span class="font-bold text-gray-900 w-32 shrink-0">${link.label}</span>
                    <a href="${link.url}" 
                    target="_blank" 
                    class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                        ${linkText}
                        <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                </div>
            `;
        }).join('');
    };

    // B. Render Details Sections (Main Body)
    const renderSections = (sections) => {
        if (!sections || !Array.isArray(sections)) return '';
        
        return sections.map(section => {
            let listHtml = '';

            if (Array.isArray(section.data)) {
                const isComplex = typeof section.data[0] === 'object';

                if (isComplex) {
                    listHtml = section.data.map(item => `
                        <li class="mb-3 last:mb-0">
                            <div class="flex justify-between items-start">
                                <div>
                                    <span class="block font-bold text-gray-900">${item.title}</span>
                                    ${item.subtitle ? `<span class="block text-sm text-gray-600">${item.subtitle}</span>` : ''}
                                </div>
                                ${item.date ? `<span class="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap ml-2">${item.date}</span>` : ''}
                            </div>
                        </li>
                    `).join('');
                } else {
                    listHtml = section.data.map(item => `
                        <li class="mb-2 flex items-start text-gray-700">
                            <span class="mr-2 text-black mt-1">•</span> ${item}
                        </li>
                    `).join('');
                }
            } else if (typeof section.data === 'string') {
                listHtml = `<p class="text-gray-700 leading-relaxed">${section.data}</p>`;
            }

            return `
                <section class="mb-6 last:mb-0">
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">${section.heading}</h4>
                    <ul class="${typeof section.data === 'string' ? '' : ''}">
                        ${listHtml}
                    </ul>
                </section>
            `;
        }).join('');
    };

    // --- BUILD CONTENT ---
    
    let linksArray = member.links || [];
    let allLinksHtml = '';
    
    // Prepend Email (Format: "Email: [address]")
    if (member.email) {
        allLinksHtml += `
        <div class="mb-2 text-sm">
            <span class="font-bold text-gray-900 mr-1">Email:</span>
            <a href="mailto:${member.email}" class="text-blue-600 hover:underline break-all">
                ${member.email}
            </a>
        </div>`;
    }
    allLinksHtml += renderLinks(linksArray);

    const detailsHtml = renderSections(member.details);

    // Inject into Modal
    content.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-start gap-8">
            
            <div class="sm:w-1/3 flex flex-col items-center sm:items-start space-y-6">
                <div class="h-48 w-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm mx-auto sm:mx-0">
                     ${member.photo ?
                        `<img src="data/team/images/${member.photo}" class="h-full w-full object-contain" onerror="this.onerror=null; this.src='https://placehold.co/200/e5e7eb/9ca3af?text=${initials}'">`
                        : `<div class="h-full w-full flex items-center justify-center text-4xl font-bold text-gray-400">${initials}</div>`
                    }
                </div>
                
                <div class="w-full flex flex-col items-start space-y-2">
                    ${allLinksHtml}
                </div>
            </div>
            
            <div class="sm:w-2/3 w-full text-left">
                <div class="border-b border-gray-200 pb-3 mb-4">
                    <h3 class="text-3xl font-bold text-gray-900 leading-tight">${member.name}</h3>
                    <p class="text-lg text-black font-semibold mt-1">${member.position}</p>
                    <p class="text-sm text-gray-500">${member.years || ''}</p>
                </div>

                <div class="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    
                    <section class="mb-6">
                        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Overview</h4>
                        <p class="text-gray-700 leading-relaxed text-sm">${member.bio || "No biography available."}</p>
                    </section>

                    ${detailsHtml}
                    
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeTeamModal() {
    const modal = document.getElementById('team-modal');
    if(modal) modal.classList.add('hidden');
}

async function renderResearchPage() { 
    
} 

async function renderPublicationsPage() { 
    const pubData = await fetchData('publications', DATA_PATHS.publications); 

    if (!pubData || pubData.length === 0) {
        return `<h2 class="text-3xl font-bold text-gray-900 mb-6">Publications</h2><p>No publications found. Please populate the <code>${DATA_PATHS.publications}</code> file.</p>`; 
    }

    // --- 1. Helper to Render a Single Card ---
    const renderCard = (pub) => {
        const hasImage = pub.image && pub.image.trim() !== '';
        return `
        <div class="flex flex-col md:flex-row gap-6 py-6 border-b border-gray-100 last:border-0">
            <div class="flex-shrink-0 w-full md:w-48">
                ${hasImage ? 
                    `<img src="data/publications/images/${pub.image}" 
                          alt="Paper Thumbnail" 
                          class="w-full h-28 object-cover rounded-lg shadow-sm border border-gray-200"
                          onerror="this.onerror=null; this.src='https://placehold.co/300x200/e5e7eb/9ca3af?text=PAPER'">`
                    : 
                    `<div class="w-full h-28 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
                        <span class="text-xs font-bold uppercase">No Image</span>
                    </div>`
                }
            </div>
            
            <div class="flex-grow flex flex-col justify-center">
                <h4 class="text-lg font-bold text-gray-900 leading-snug mb-2">
                    <a href="${pub.url || '#'}" target="_blank" class="hover:text-gray-600 transition-colors hover:underline decoration-gray-400 underline-offset-2">
                        ${pub.title}
                    </a>
                </h4>
                <p class="text-gray-600 text-sm font-medium leading-relaxed">
                    ${pub.authors}
                </p>
            </div>
        </div>`;
    };

    // --- 2. Group Data by Year ---
    const groupedByYear = {};
    pubData.forEach(pub => {
        const year = pub.year || 'Unknown';
        if (!groupedByYear[year]) groupedByYear[year] = [];
        groupedByYear[year].push(pub);
    });

    // --- 3. Sort Years Descending ---
    const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);

    // --- 4. Build HTML ---
    const contentHtml = sortedYears.map(year => {
        const pubs = groupedByYear[year];

        // Filter by Type
        const journals = pubs.filter(p => p.type && p.type.toLowerCase().includes('journal'));
        const conferences = pubs.filter(p => p.type && p.type.toLowerCase().includes('conference'));

        return `
            <div class="mb-12 last:mb-0">
                <div class="flex items-center mb-6">
                    <h3 class="text-3xl font-extrabold text-gray-900 mr-4">${year}</h3>
                    <div class="flex-grow h-1 bg-gray-200 rounded"></div>
                </div>

                ${journals.length > 0 ? `
                    <div class="mb-8">
                        <h4 class="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wider">Journals</h4>
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 px-6">
                            ${journals.map(renderCard).join('')}
                        </div>
                    </div>
                ` : ''}

                ${conferences.length > 0 ? `
                    <div class="mb-8">
                        <h4 class="text-xl font-bold text-gray-800 mb-4 uppercase tracking-wider">Conferences</h4>
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 px-6">
                            ${conferences.map(renderCard).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    return ` 
        <div class="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-4xl font-extrabold text-gray-900 mb-10 border-b-4 pb-3 border-gray-500">Publications</h2> 
            <div class=""> 
                ${contentHtml} 
            </div> 
        </div>
    `; 
}

async function renderJoinPage() {
    const path = DATA_PATHS.join || './data/join/join.md';

    try {
        const response = await fetch(path);
        if (!response.ok) {
            if (response.status === 404) {
                return `<div class="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h2 class="text-4xl font-extrabold text-gray-900 mb-10 border-b-4 pb-3 border-gray-500">Join Us</h2><p>No join content found.</p></div>`;
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const markdownText = await response.text();

        // Fallback parser logic (same as before)
        let contentHtml;
        if (typeof marked !== 'undefined' && marked.parse) {
            contentHtml = marked.parse(markdownText);
        } else {
             contentHtml = markdownText
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .split('\n')
                .map(line => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('# ')) return `<h2 class="text-3xl font-bold text-gray-900 mt-6 mb-3">${trimmed.substring(2)}</h2>`;
                    if (trimmed.startsWith('## ')) return `<h3 class="text-2xl font-semibold text-gray-800 mt-4 mb-2">${trimmed.substring(3)}</h3>`;
                    if (trimmed.startsWith('- ')) return `<li class="ml-6 list-disc mb-1">${trimmed.substring(2)}</li>`;
                    if (trimmed === '---') return `<hr class="my-6 border-gray-200">`;
                    if (trimmed === '') return '';
                    return `<p class="mb-4 leading-relaxed">${trimmed}</p>`;
                })
                .join('');
        }

        // Updated Return Block to match "Publications" style
        return `
            <div class="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-4xl font-extrabold text-gray-900 mb-10 border-b-4 pb-3 border-gray-500">Join Us</h2>
                <div class="bg-white p-8 rounded-xl shadow-lg">
                    ${contentHtml}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error rendering Join page:', error);
        return `<div class="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h2 class="text-4xl font-extrabold text-gray-900 mb-10 border-b-4 pb-3 border-gray-500">Join Us</h2><p class="text-red-600">Error loading content.</p></div>`;
    }
}

function renderContactPage() { 
    return ` 
        <!-- Title color changed to gray-900 --> 
        <h2 class="text-4xl font-bold text-gray-900 mb-8 border-b-2 pb-2 border-gray-200">Contact Us</h2> 
        <div class="grid md:grid-cols-2 gap-8 bg-white p-8 rounded-xl shadow-lg"> 
            <div> 
                <h3 class="text-2xl font-semibold text-gray-900 mb-4"></h3> 
                <p class="text-gray-700"> 
                    
                </p> 
            </div> 
            <div> 
                <h3 class="text-2xl font-semibold text-gray-900 mb-4"></h3> 
                <!-- Text color changed to gray-700 --> 
                <p class="mb-2"><span class="font-medium text-gray-700"></span> <a href="mailto:info@researchgroup.edu" class="text-blue-600 hover:underline"></a></p> 
                <p><span class="font-medium text-gray-700"></span> </p> 
            </div> 
        </div> 

    `; 
} 

// --- News Carousel Logic ---

let currentNewsIndex = 0;
let newsSlides = [];
let newsInterval;

/**
 * Shows a specific news slide and hides others.
 * @param {number} n The index to move to.
 */
function showNewsSlide(n) {
    if (!newsSlides || newsSlides.length === 0) return;

    // Calculate new index, wrapping around
    currentNewsIndex = (n + newsSlides.length) % newsSlides.length;

    // Update visibility
    newsSlides.forEach((slide, index) => {
        if (index === currentNewsIndex) {
            slide.style.display = 'block';
            slide.style.opacity = '1';
        } else {
            slide.style.display = 'none';
            slide.style.opacity = '0';
        }
    });
}

/**
 * Changes the news slide index manually via buttons, and resets the auto-rotate timer.
 * @param {number} n The direction to move (-1 for back, 1 for forward).
 */
function changeNewsSlide(n) {
    // Clear the auto interval and set a new one after manual change
    if (newsInterval) {
        clearInterval(newsInterval);
        startNewsAutoRotate();
    }
    showNewsSlide(currentNewsIndex + n);
}

/**
 * Starts the automatic rotation of the news carousel.
 */
function startNewsAutoRotate() {
    newsInterval = setInterval(() => {
        showNewsSlide(currentNewsIndex + 1);
    }, 8000); // Change news every 8 seconds
}

/**
 * Initializes the news carousel DOM elements and starts rotation.
 */
function setupNewsCarousel() {
    // Stop any running interval first
    if (newsInterval) clearInterval(newsInterval);

    const container = document.getElementById('news-carousel');
    if (container) {
        newsSlides = Array.from(container.querySelectorAll('.news-slide'));
        
        // Only start if there's content
        if (newsSlides.length > 0) {
            currentNewsIndex = 0; 
            showNewsSlide(0);
            
            // Start auto-rotate only if there is more than one slide
            if (newsSlides.length > 1) {
                 startNewsAutoRotate();
            }
        }
    }
}


// --- Main Application Logic --- 

/** 
* Main function to route and render the page content. 
*/ 
async function loadContent() { 
    contentArea.style.opacity = '0'; 
    errorMessage.classList.add('hidden'); 
    loadingSpinner.classList.remove('hidden'); 
    contentArea.innerHTML = ''; // Clear previous content 

    let htmlContent; 
    try { 
        switch (currentPage) { 
            case 'home': 
                htmlContent = await renderHome(); 
                break; 
            case 'team': 
                htmlContent = await renderTeamPage(); 
                break; 
            case 'research': 
                htmlContent = await renderResearchPage(); 
                break; 
            case 'publications': 
                htmlContent = await renderPublicationsPage(); 
                break; 
            case 'join': 
                htmlContent = await renderJoinPage(); 
                break; 
            case 'contact': 
                htmlContent = renderContactPage(); 
                break; 
            default: 
                htmlContent = await renderHome(); // Fallback to home 
                break; 
        } 
        contentArea.innerHTML = htmlContent; 
    } catch (error) { 
        console.error('Error rendering page:', error); 
        errorMessage.classList.remove('hidden'); 
    } finally { 
        loadingSpinner.classList.add('hidden'); 
        document.querySelectorAll('.nav-link').forEach(link => { 
            link.classList.remove('text-gray-900', 'font-bold', 'border-b-2', 'border-gray-900'); 
            link.classList.add('text-gray-600', 'font-medium'); 
        }); 
        const activeLink = document.getElementById(`nav-${currentPage}`); 
        if (activeLink) { 
            activeLink.classList.remove('text-gray-600', 'font-medium'); 
            activeLink.classList.add('text-gray-900', 'font-bold', 'border-b-2', 'border-gray-900'); 
        } 

        if (currentPage === 'home') {
            setupNewsCarousel();
        }

        // Scroll to top and make content visible 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
        contentArea.style.opacity = '1'; 
    } 
} 

/** 
* Navigation handler that updates the state and URL hash. 
*/ 
function navigate(page) { 
    currentPage = page; 
    window.location.hash = page === 'home' ? '' : page; 
    loadContent(); 
} 

/** 
* Initializes the application based on the URL hash. 
*/ 
function init() { 
    const hash = window.location.hash.replace('#', ''); 
    if (hash && hash !== 'home' && ['team', 'research', 'publications', 'join', 'contact'].includes(hash)) { 
        currentPage = hash; 
    } else { 
        currentPage = 'home'; 
    } 
    loadContent(); 
} 

// Listen for hash changes to handle navigation
window.addEventListener('hashchange', init); 

// Start the application 
init();