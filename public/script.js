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
            start: "top 95%",
            toggleActions: "play none none reverse"
        },
        y: 40,
        opacity: 0,
        duration: 0.5,
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
                start: "top 95%",
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 0.5,
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
            toggleActions: "play none none reverse"
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
            toggleActions: "play none none reverse"
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
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        scale: 0.98,
        duration: 0.8,
        ease: "power2.out"
    });
});

// --- 5. Modal Logic ---
const modal = document.getElementById('lead-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const closeBtn = document.getElementById('close-modal-btn');
const heroDownloadBtn = document.getElementById('hero-download-btn');
const resourceDlBtns = document.querySelectorAll('.resource-dl-btn');

function openModal() {
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

heroDownloadBtn.addEventListener('click', openModal);
resourceDlBtns.forEach(btn => btn.addEventListener('click', openModal));
closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// --- 6. Form Submission Logic ---
async function handleFormSubmit(e, statusElementId) {
    e.preventDefault();
    const form = e.target;
    const statusEl = document.getElementById(statusElementId);
    
    // UI Feedback
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending... <i data-lucide="loader-2" class="animate-spin w-5 h-5 inline-block"></i>';
    submitBtn.disabled = true;
    lucide.createIcons(); // refresh icons

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        // Construct the email body
        const subject = `Website Inquiry: ${data.exam || 'General'}`;
        const body = `Name: ${data.name}
Phone: ${data.phone}
Exam: ${data.exam}

Message:
${data.message || 'No message provided'}`;

        // Trigger native mail client
        window.location.href = `mailto:parivartanamclasses@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        statusEl.textContent = "Opening your email client...";
        statusEl.className = "text-sm text-center font-bold mt-2 text-emerald-600 block";
        form.reset();
        
        // If it's the download form, simulate download after a delay
        if (data.formType === 'Syllabus Download') {
            setTimeout(() => {
                alert("Downloading Syllabus...");
                closeModal();
            }, 1500);
        }
    } catch (error) {
        statusEl.textContent = "An error occurred. Please try again.";
        statusEl.className = "text-sm text-center font-bold mt-2 text-red-600 block";
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        lucide.createIcons(); // refresh icons
    }
}

document.getElementById('contact-form').addEventListener('submit', (e) => handleFormSubmit(e, 'contact-status'));
document.getElementById('download-form').addEventListener('submit', (e) => handleFormSubmit(e, 'download-status'));
