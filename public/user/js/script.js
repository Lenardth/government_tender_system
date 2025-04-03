// Global variables
let map;
let markers = [];
let tenders = [];
let news = [];
let investments = [];
let tokenCount = 0;

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    initMap();
    
    // Load data
    loadTenders();
    loadNews();
    loadInvestments();
    
    // Initialize the dashboard
    updateDashboard();
    
    // Show back to top button when scrolling down
    window.addEventListener('scroll', function() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.getElementById('backToTop').style.display = 'block';
        } else {
            document.getElementById('backToTop').style.display = 'none';
        }
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').textContent = '☀️';
    }
});

// Toggle between light and dark theme
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize the Leaflet map
function initMap() {
    // Create a map centered on South Africa
    map = L.map('map').setView([-30.5595, 22.9375], 5);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add sample tender locations
    addTenderLocations();
}

// Add sample tender locations to the map
function addTenderLocations() {
    const locations = [
        { lat: -33.9249, lng: 18.4241, title: 'Cape Town Infrastructure Project', budget: 'R25 million' },
        { lat: -29.8587, lng: 31.0218, title: 'Durban Port Expansion', budget: 'R50 million' },
        { lat: -26.2041, lng: 28.0473, title: 'Johannesburg Solar Energy Initiative', budget: 'R15 million' },
        { lat: -33.0145, lng: 27.9116, title: 'East London Hospital Renovation', budget: 'R30 million' },
        { lat: -25.7479, lng: 28.2293, title: 'Pretoria Public Transport System', budget: 'R40 million' }
    ];
    
    locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng]).addTo(map);
        marker.bindPopup(`<b>${location.title}</b><br>Budget: ${location.budget}`);
        markers.push(marker);
    });
}

// Load sample tender data
function loadTenders() {
    tenders = [
        {
            id: 1,
            title: 'Cape Town Infrastructure Project',
            category: 'construction',
            budget: 25000000,
            deadline: '2025-06-30',
            description: 'Development of road infrastructure in Cape Town metropolitan area.',
            location: 'Cape Town',
            status: 'Open'
        },
        {
            id: 2,
            title: 'Durban Port Expansion',
            category: 'construction',
            budget: 50000000,
            deadline: '2025-08-15',
            description: 'Expansion of Durban port facilities to increase cargo handling capacity.',
            location: 'Durban',
            status: 'Open'
        },
        {
            id: 3,
            title: 'Johannesburg Solar Energy Initiative',
            category: 'energy',
            budget: 15000000,
            deadline: '2025-07-10',
            description: 'Installation of solar panels on government buildings in Johannesburg.',
            location: 'Johannesburg',
            status: 'Open'
        },
        {
            id: 4,
            title: 'National Healthcare Database System',
            category: 'it',
            budget: 12000000,
            deadline: '2025-05-20',
            description: 'Development of a centralized healthcare database system for public hospitals.',
            location: 'Pretoria',
            status: 'Open'
        },
        {
            id: 5,
            title: 'East London Hospital Renovation',
            category: 'healthcare',
            budget: 30000000,
            deadline: '2025-09-01',
            description: 'Comprehensive renovation of East London General Hospital.',
            location: 'East London',
            status: 'Open'
        }
    ];
}

// Load sample news data
function loadNews() {
    news = [
        {
            title: 'Government Announces New Tender Transparency Initiative',
            date: '2025-03-28',
            content: 'The South African government has announced a new initiative to improve transparency in the tender process, leveraging blockchain technology for verification.'
        },
        {
            title: 'Infrastructure Development Fund Increased by R10 Billion',
            date: '2025-03-25',
            content: 'The National Treasury has allocated an additional R10 billion to the Infrastructure Development Fund to accelerate key projects across the country.'
        },
        {
            title: 'New Regulations for Tender Applications Coming in May',
            date: '2025-03-20',
            content: 'The Department of Public Works has announced new regulations for tender applications, aimed at reducing bureaucracy and speeding up the approval process.'
        }
    ];
    
    // Display news
    const newsContainer = document.getElementById('newsContainer');
    news.forEach(item => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.date}</p>
            <p>${item.content}</p>
        `;
        newsContainer.appendChild(newsCard);
    });
}

// Load sample investment opportunities
function loadInvestments() {
    investments = [
        {
            title: 'Renewable Energy Projects',
            roi: '15-20%',
            minInvestment: 'R500,000',
            description: 'Investment opportunities in government-backed solar and wind energy projects across South Africa.'
        },
        {
            title: 'Public-Private Infrastructure Partnerships',
            roi: '12-18%',
            minInvestment: 'R1,000,000',
            description: 'Partner with government on critical infrastructure projects with stable long-term returns.'
        },
        {
            title: 'Healthcare Facility Modernization',
            roi: '10-15%',
            minInvestment: 'R750,000',
            description: 'Investment in the modernization of public healthcare facilities with equipment leasing arrangements.'
        }
    ];
    
    // Display investment opportunities
    const investmentContainer = document.getElementById('investmentContainer');
    investments.forEach(item => {
        const investmentCard = document.createElement('div');
        investmentCard.className = 'investment-card';
        investmentCard.innerHTML = `
            <h3>${item.title}</h3>
            <p><strong>Expected ROI:</strong> ${item.roi}</p>
            <p><strong>Minimum Investment:</strong> ${item.minInvestment}</p>
            <p>${item.description}</p>
        `;
        investmentContainer.appendChild(investmentCard);
    });
}

// Update the government efficiency dashboard with sample data
function updateDashboard() {
    // Simulate loading data
    document.getElementById('loadingSpinner').style.display = 'block';
    
    setTimeout(() => {
        // Update dashboard metrics with sample data
        document.getElementById('tendersAwarded').textContent = '157';
        document.getElementById('projectsCompleted').textContent = '89';
        document.getElementById('efficiencyScore').textContent = '76%';
        
        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
    }, 1500);
}

// Search functionality for tenders
function searchTenders() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        alert('Please enter a search term');
        return;
    }
    
    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';
    
    // Simulate search delay
    setTimeout(() => {
        const results = tenders.filter(tender => 
            tender.title.toLowerCase().includes(searchTerm) || 
            tender.description.toLowerCase().includes(searchTerm) ||
            tender.location.toLowerCase().includes(searchTerm)
        );
        
        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        
        // Display results (in a real application, this would navigate to a results page)
        if (results.length > 0) {
            alert(`Found ${results.length} tenders matching "${searchTerm}"`);
        } else {
            alert(`No tenders found matching "${searchTerm}"`);
        }
    }, 1000);
}

// Filter tenders based on category and budget
function filterTenders() {
    const category = document.getElementById('categoryFilter').value;
    const maxBudget = parseFloat(document.getElementById('budgetFilter').value) || Infinity;
    
    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';
    
    // Simulate filter delay
    setTimeout(() => {
        let results = tenders;
        
        // Filter by category if not "all"
        if (category !== 'all') {
            results = results.filter(tender => tender.category === category);
        }
        
        // Filter by budget
        results = results.filter(tender => tender.budget <= maxBudget);
        
        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        
        // Display results (in a real application, this would update the tender list)
        if (results.length > 0) {
            alert(`Found ${results.length} tenders matching your filters`);
        } else {
            alert('No tenders match your filters');
        }
    }, 1000);
}

// Calculate tender cost
function calculateTender() {
    const materialCost = parseFloat(document.getElementById('materialCost').value) || 0;
    const laborCost = parseFloat(document.getElementById('laborCost').value) || 0;
    const overhead = parseFloat(document.getElementById('overhead').value) || 0;
    const totalCost = materialCost + laborCost + overhead;
    document.getElementById('totalCost').innerText = `Total Cost: R${totalCost.toFixed(2)}`;
}

// Gamification - claim tokens
function claimTokens() {
    // Increment token count
    tokenCount += 10;
    
    // Show confirmation
    alert(`Congratulations! You've earned 10 tokens. Total tokens: ${tokenCount}`);
    
    // Save token count to localStorage
    localStorage.setItem('tokenCount', tokenCount);
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
