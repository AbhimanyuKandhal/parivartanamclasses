// Clear URL hash to prevent browser auto-scrolling on reload
if (window.location.hash) {
    window.history.replaceState('', document.title, window.location.pathname + window.location.search);
}

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Initialize Lucide Icons
lucide.createIcons();

// --- 1. Initialize Lenis Smooth Scrolling ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
});

// Force Lenis to start at top
lenis.scrollTo(0, { immediate: true });

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if (target && target !== '#') {
            lenis.scrollTo(target);
        }
    });
});

// --- Hero Section Immediate Animation ---
gsap.to(".hero-animate-in", {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.2 // small delay to let layout settle
});

// --- 2. Mobile Menu Toggle ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

function toggleMobileMenu() {
    mobileMenu.classList.toggle('translate-x-full');
}
mobileMenuBtn.addEventListener('click', toggleMobileMenu);
closeMenuBtn.addEventListener('click', toggleMobileMenu);
mobileLinks.forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
});

// --- 3. Swiper 3D Cube Initialization ---
const swiper = new Swiper('.course-cube', {
    effect: 'cube',
    grabCursor: true,
    cubeEffect: {
        shadow: true,
        slideShadows: true,
        shadowOffset: 20,
        shadowScale: 0.94,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    // We remove loop and autoplay so we can link it to scroll
    loop: false,
    speed: 1000 // smoother transitions between slides
});

// Sync right-side dynamic details panel with active face
swiper.on('activeIndexChange', () => {
    const activeIndex = swiper.activeIndex;
    const details = document.querySelectorAll('.course-detail');
    
    details.forEach((detail, index) => {
        if (index === activeIndex) {
            detail.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
            detail.classList.add('opacity-100', 'translate-y-0');
        } else {
            detail.classList.remove('opacity-100', 'translate-y-0');
            detail.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        }
    });
});

// Idle floating animation for the cube to make it feel alive
gsap.to(".course-cube", {
    y: 10,
    rotationX: 2,
    rotationY: -3,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

// --- 4. GSAP & ScrollTrigger Animations ---
gsap.registerPlugin(ScrollTrigger);

// Connect GSAP and Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
});
gsap.ticker.lagSmoothing(0, 0);

// Link Swiper to ScrollTrigger with Pinning
let lastIndex = -1;
ScrollTrigger.create({
    trigger: "#courses",
    start: "center center",
    end: "+=3000",
    pin: true,
    scrub: true,
    onUpdate: (self) => {
        // total 5 slides. We want each slide to take exactly 20% of the scroll distance.
        let slideIndex = Math.floor(self.progress * 5);
        if (slideIndex > 4) slideIndex = 4; // cap at the last slide
        
        if (lastIndex !== slideIndex) {
            lastIndex = slideIndex;
            swiper.slideTo(slideIndex, 800); // explicit 800ms speed
        }
    }
});

// Philosophy card gliding effect (scrub parallax)
gsap.fromTo("#philosophy .glass-panel", 
    { y: 250, opacity: 0 },
    {
        scrollTrigger: {
            trigger: "#philosophy",
            start: "top bottom", // Start when section enters
            end: "center center",
            scrub: 1
        },
        y: 0,
        opacity: 1,
        ease: "none"
    });

// Smooth reveal for individual elements
gsap.utils.toArray('.gs_reveal_up').forEach(elem => {
    if(elem.closest('#philosophy')) return; // skip philosophy card
    if(elem.closest('.stagger-grid')) return; // handled separately

    gsap.from(elem, {
        scrollTrigger: {
            trigger: elem,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
    });
});

// Grouped smooth reveal for grid elements (staggered)
gsap.utils.toArray('.stagger-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.gs_reveal_up');
    if(cards.length > 0) {
        gsap.from(cards, {
            scrollTrigger: {
                trigger: grid,
                start: "top 90%",
                toggleActions: "play none none none",
                once: true
            },
            y: 40,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.1
        });
    }
});

gsap.utils.toArray('.gs_reveal_left').forEach(elem => {
    gsap.from(elem, {
        scrollTrigger: {
            trigger: elem,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true
        },
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    });
});

gsap.utils.toArray('.gs_reveal_right').forEach(elem => {
    // Skip cube container as we scrub it manually
    if(elem.querySelector('.course-cube')) return; 
    
    gsap.from(elem, {
        scrollTrigger: {
            trigger: elem,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true
        },
        x: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    });
});

gsap.utils.toArray('.gs_reveal').forEach(elem => {
    gsap.from(elem, {
        scrollTrigger: {
            trigger: elem,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true
        },
        opacity: 0,
        scale: 0.98,
        duration: 0.8,
        ease: "power2.out"
    });
});

// Refresh ScrollTrigger after window load to account for images
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

// --- 5. Modal Logic ---
// --- 5. Modal Logic ---
const modal = document.getElementById('lead-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const closeBtn = document.getElementById('close-modal-btn');
const heroDownloadBtn = document.getElementById('hero-download-btn');
const resourceDlBtns = document.querySelectorAll('.resource-dl-btn');
const courseDlBtns = document.querySelectorAll('.course-download-btn');
const targetPdfInput = document.getElementById('download-target-pdf');
const downloadExamSelect = document.querySelector('#download-form select[name="exam"]');

// Map of default PDFs for each exam
const EXAM_PDF_MAP = {
    'CUET UG': '/Syllabus/CUET%20UG%20Syllabus.pdf',
    'CUET PG': '/Syllabus/CUET%20PG%20Syllabus.pdf',
    'UGC NET': '/Syllabus/UGC%20NET%20Paper%202.pdf',
    'GATE': '/Syllabus/Gate%20psychology%20syllabus.pdf',
    'M.Clinical Psychology': '/Syllabus/CUET%20PG%20Syllabus.pdf'
};

function openModal(examName = '', pdfUrl = '') {
    if (downloadExamSelect && examName) {
        downloadExamSelect.value = examName;
    }
    if (targetPdfInput) {
        targetPdfInput.value = pdfUrl || (examName ? EXAM_PDF_MAP[examName] : '');
    }

    modal.classList.remove('hidden');
    // slight delay to allow display:block to apply before animating opacity
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
    lenis.stop(); // Prevent scrolling while modal is open
}

function closeModal() {
    modal.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300); // match transition duration
    lenis.start();
}

if (heroDownloadBtn) {
    heroDownloadBtn.addEventListener('click', () => openModal());
}

resourceDlBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        // Map resource cards to their respective syllabus or default
        const examKeys = ['CUET UG', 'CUET PG', 'UGC NET', 'GATE', 'M.Clinical Psychology'];
        const exam = examKeys[index] || '';
        openModal(exam, EXAM_PDF_MAP[exam]);
    });
});

courseDlBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const exam = btn.getAttribute('data-exam') || '';
        const pdf = btn.getAttribute('data-pdf') || EXAM_PDF_MAP[exam] || '';
        openModal(exam, pdf);
    });
});

closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Google Apps Script Webhook for automatic lead capture
const GOOGLE_LEADS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzoeAJPBKe1tPcen3IBcavltjqmOEcpm-GjHjtf18HKZacbxlXHKM3wK-iT6haGxRmL/exec";

// --- 6. Form Submission Logic ---
async function handleFormSubmit(e, statusElementId) {
    e.preventDefault();
    const form = e.target;
    const statusEl = document.getElementById(statusElementId);
    
    // UI Feedback
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Unlocking... <i data-lucide="loader-2" class="animate-spin w-5 h-5 inline-block"></i>';
    submitBtn.disabled = true;
    lucide.createIcons(); // refresh icons

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        // Silently send details to Google Sheet in background
        fetch(GOOGLE_LEADS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors', // standard cross-origin for Google Apps Script Web Apps
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
                name: data.name || '',
                phone: data.phone || '',
                exam: data.exam || '',
                message: data.message || '',
                formType: data.formType || 'Inquiry'
            })
        }).catch(err => console.warn('Background lead capture note:', err));

        // If it's the contact form, open native mail client as backup
        if (data.formType === 'Contact Form') {
            const subject = `Website Inquiry: ${data.exam || 'General'}`;
            const body = `Name: ${data.name}\nPhone: ${data.phone}\nExam: ${data.exam}\n\nMessage:\n${data.message || 'No message provided'}`;
            window.location.href = `mailto:parivartanamclasses@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            statusEl.textContent = "Thank you! We have received your inquiry.";
            statusEl.className = "text-sm text-center font-bold mt-2 text-emerald-600 block";
            form.reset();
        }

        // If it's the download form, trigger download of the target PDF immediately without opening mail app
        if (data.formType === 'Syllabus Download') {
            statusEl.textContent = "Details verified! Preparing your syllabus...";
            statusEl.className = "text-sm text-center font-bold mt-2 text-emerald-600 block";

            const pdfToDownload = data.targetPdf || EXAM_PDF_MAP[data.exam] || '/Syllabus/CUET%20UG%20Syllabus.pdf';
            
            setTimeout(() => {
                // Programmatically trigger PDF download
                const downloadLink = document.createElement('a');
                downloadLink.href = pdfToDownload;
                downloadLink.download = decodeURIComponent(pdfToDownload.split('/').pop());
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                statusEl.textContent = "Your download has started!";
                statusEl.className = "text-sm text-center font-bold mt-2 text-emerald-600 block";
                
                setTimeout(() => {
                    form.reset();
                    closeModal();
                }, 1000);
            }, 600);
        }
    } catch (error) {
        statusEl.textContent = "An error occurred. Please try again.";
        statusEl.className = "text-sm text-center font-bold mt-2 text-red-600 block";
    } finally {
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            lucide.createIcons(); // refresh icons
        }, 1200);
    }
}

document.getElementById('contact-form').addEventListener('submit', (e) => handleFormSubmit(e, 'contact-status'));
document.getElementById('download-form').addEventListener('submit', (e) => handleFormSubmit(e, 'download-status'));

// --- 7. Live Notice Board (Google Sheets Integration) ---
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUVtdgTR8osX_h2Ph_0_3rmmPn6VJKT360pkj1IOn1tOKHMBPwGc_p_PaKZVIxFsaBy6GSmUGC7tg9/pub?gid=0&single=true&output=csv";

// Helper to parse standard CSV line taking into account quotes
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return []; // Only header or empty
    
    const results = [];
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const row = [];
        let inQuotes = false;
        let token = "";
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(token.trim().replace(/^"|"$/g, ''));
                token = "";
            } else {
                token += char;
            }
        }
        row.push(token.trim().replace(/^"|"$/g, ''));
        results.push(row);
    }
    return results;
}

async function loadNoticeBoard() {
    const feed = document.getElementById('notice-board-feed');
    if (!feed) return;

    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        if (!response.ok) throw new Error("Failed to fetch sheet");
        
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
        // Filter active rows: [Date, Category, Title, Link, Status]
        const activeNotices = rows.filter(row => {
            const status = (row[4] || '').toLowerCase().trim();
            const title = (row[2] || '').trim();
            // Show if title exists and status is either 'active', blank, or not explicitly 'inactive'
            return title && status !== 'inactive';
        });

        if (activeNotices.length === 0) {
            feed.innerHTML = `
                <div class="text-center py-8 text-stone-500">
                    <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                    </div>
                    <p class="text-sm font-semibold text-stone-700">All caught up!</p>
                    <p class="text-xs text-stone-400 mt-0.5">No new exam alerts at this moment.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Render notices (latest first if user added rows sequentially)
        feed.innerHTML = activeNotices.map((row) => {
            const date = row[0] || 'Recent';
            const tag = row[1] || 'Alert';
            const title = row[2] || '';
            const link = (row[3] || '').trim();

            const isExternal = link.startsWith('http');
            const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

            // Color badge matching category
            const tagLower = tag.toLowerCase();
            let badgeBg = "bg-emerald-100 text-emerald-800 border-emerald-200/80";
            if (tagLower.includes('cuet')) {
                badgeBg = "bg-amber-100 text-amber-900 border-amber-200/80";
            } else if (tagLower.includes('ugc') || tagLower.includes('net')) {
                badgeBg = "bg-blue-100 text-blue-900 border-blue-200/80";
            } else if (tagLower.includes('gate')) {
                badgeBg = "bg-purple-100 text-purple-900 border-purple-200/80";
            } else if (tagLower.includes('urgent') || tagLower.includes('important')) {
                badgeBg = "bg-red-100 text-red-800 border-red-200/80";
            }

            return `
                <div class="p-3.5 rounded-xl bg-white/70 hover:bg-white border border-stone-200/70 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow group">
                    <div class="flex items-center justify-between gap-2 mb-1.5">
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeBg}">
                            ${tag}
                        </span>
                        <span class="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                            ${date}
                        </span>
                    </div>
                    <p class="text-xs sm:text-sm font-semibold text-stone-800 leading-snug group-hover:text-emerald-900 transition-colors">
                        ${title}
                    </p>
                    ${link ? `
                        <div class="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-end">
                            <a href="${link}" ${targetAttr} class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                                <span>View Details</span>
                                <i data-lucide="external-link" class="w-3 h-3"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        lucide.createIcons();
    } catch (err) {
        console.error("Notice board error:", err);
        feed.innerHTML = `
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 text-center">
                <i data-lucide="info" class="w-4 h-4 mx-auto mb-1 text-stone-400"></i>
                <p>Unable to load notices right now. Please refresh or check back shortly.</p>
            </div>
        `;
        lucide.createIcons();
    }
}

// Initial fetch on page load
loadNoticeBoard();
