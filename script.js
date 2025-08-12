// Global variables
let currentStep = 0;
let userAnswers = {};
let universities = [];
let matchedUniversities = [];

// Quiz steps configuration
const quizSteps = [
    'welcome',
    'step1', // Field of study
    'step2', // Academic level
    'step3', // Budget
    'step4', // City size
    'step5', // Ranking importance
    'step6', // English programs
    'step7'  // Chinese language level
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadUniversities();
    setupEventListeners();
});

// Load universities data
async function loadUniversities() {
    try {
        const response = await fetch('universities.json');
        const data = await response.json();
        // Transform the new data structure to match the expected format
        universities = transformUniversityData(data.universities);
        console.log('Loaded universities:', universities.length);
        console.log('Sample university:', universities[0]);
    } catch (error) {
        console.error('Error loading universities:', error);
        // Fallback data if JSON fails to load
        universities = [];
    }
}

// Transform new university data structure to match expected format
function transformUniversityData(universitiesData) {
    return universitiesData.map(uni => {
        // Map programs to expected fields
        const programFields = uni.programs || [];
        const fields = [];
        
        // Map program names to quiz field options
        programFields.forEach(program => {
            const programLower = program.toLowerCase();
            if (programLower.includes('engineering') || programLower.includes('computer') || programLower.includes('mechanical')) {
                if (!fields.includes('engineering')) fields.push('engineering');
            }
            if (programLower.includes('business') || programLower.includes('mba') || programLower.includes('economics') || programLower.includes('management')) {
                if (!fields.includes('business')) fields.push('business');
            }
            if (programLower.includes('medicine') || programLower.includes('health')) {
                if (!fields.includes('medicine')) fields.push('medicine');
            }
            if (programLower.includes('arts') || programLower.includes('humanities') || programLower.includes('literature')) {
                if (!fields.includes('arts')) fields.push('arts');
            }
            if (programLower.includes('science') || programLower.includes('physics') || programLower.includes('chemistry') || programLower.includes('biology')) {
                if (!fields.includes('science')) fields.push('science');
            }
            if (programLower.includes('social') || programLower.includes('psychology') || programLower.includes('sociology') || programLower.includes('education')) {
                if (!fields.includes('social')) fields.push('social');
            }
        });
        
        // If no fields mapped, add common ones based on university type
        if (fields.length === 0) {
            if (uni.admission?.key_features?.includes('STEM')) {
                fields.push('engineering', 'science');
            } else {
                fields.push('arts', 'social');
            }
        }
        
        // Create programs structure with accurate tuition data
        const programs = {
            undergraduate: {},
            graduate: {}
        };
        
        // Map tuition costs to programs using actual data
        if (uni.costs) {
            // Undergraduate programs
            if (uni.costs.ug_tuition_liberal_arts) {
                programs.undergraduate.arts = {
                    tuition: uni.costs.ug_tuition_liberal_arts,
                    englishPrograms: true,
                    chineseRequired: false
                };
                programs.undergraduate.social = {
                    tuition: uni.costs.ug_tuition_liberal_arts,
                    englishPrograms: true,
                    chineseRequired: false
                };
            }
            if (uni.costs.ug_tuition_stem) {
                programs.undergraduate.engineering = {
                    tuition: uni.costs.ug_tuition_stem,
                    englishPrograms: true,
                    chineseRequired: false
                };
                programs.undergraduate.science = {
                    tuition: uni.costs.ug_tuition_stem,
                    englishPrograms: true,
                    chineseRequired: false
                };
            }
            if (uni.costs.ug_tuition_medicine) {
                programs.undergraduate.medicine = {
                    tuition: uni.costs.ug_tuition_medicine,
                    englishPrograms: true,
                    chineseRequired: false
                };
            }
            
            // Graduate programs
            if (uni.costs.pg_tuition_liberal_arts) {
                programs.graduate.arts = {
                    tuition: uni.costs.pg_tuition_liberal_arts,
                    englishPrograms: true,
                    chineseRequired: false
                };
                programs.graduate.social = {
                    tuition: uni.costs.pg_tuition_liberal_arts,
                    englishPrograms: true,
                    chineseRequired: false
                };
            }
            if (uni.costs.pg_tuition_stem) {
                programs.graduate.engineering = {
                    tuition: uni.costs.pg_tuition_stem,
                    englishPrograms: true,
                    chineseRequired: false
                };
                programs.graduate.science = {
                    tuition: uni.costs.pg_tuition_stem,
                    englishPrograms: true,
                    chineseRequired: false
                };
            }
            if (uni.costs.pg_tuition_mba) {
                programs.graduate.business = {
                    tuition: uni.costs.pg_tuition_mba,
                    englishPrograms: true,
                    chineseRequired: false
                };
            }
        }
        
        // Determine city size based on city name
        let citySize = 'medium';
        if (uni.city === 'Beijing' || uni.city === 'Shanghai' || uni.city === 'Guangzhou' || uni.city === 'Shenzhen') {
            citySize = 'mega';
        } else if (uni.city === 'Nanjing' || uni.city === 'Hangzhou' || uni.city === 'Chengdu' || uni.city === 'Wuhan') {
            citySize = 'large';
        }
        
        // Get global ranking
        const globalRanking = uni.admission?.qs_rank_2025 || uni.admission?.the_rank_2025 || 1000;
        
        // Calculate acceptance rate based on admission difficulty
        const admissionDifficulty = uni.admission?.admission_difficulty_1to5 || 3;
        let acceptanceRate = 0.3; // Default 30%
        if (admissionDifficulty === 5) acceptanceRate = 0.05; // 5%
        else if (admissionDifficulty === 4) acceptanceRate = 0.15; // 15%
        else if (admissionDifficulty === 3) acceptanceRate = 0.25; // 25%
        else if (admissionDifficulty === 2) acceptanceRate = 0.4; // 40%
        else if (admissionDifficulty === 1) acceptanceRate = 0.6; // 60%
        
        // Create unique description based on university data
        let description = `${uni.name_en} is a prestigious university in ${uni.city}`;
        
        // Custom descriptions object for specific universities
        const customDescriptions = {
            'Tsinghua University': 'China\'s most prestigious university, renowned for engineering and technology excellence. Consistently ranks among the world\'s top universities.',
            'Peking University': 'One of China\'s oldest and most prestigious universities, known for its strong liberal arts programs and research excellence.',
            'Fudan University': 'A comprehensive research university known for its strong programs in medicine, humanities, and social sciences.',
            'Shanghai Jiao Tong University': 'A leading research university particularly strong in engineering, medicine, and business programs.',
            'Zhejiang University': 'One of China\'s most comprehensive universities, known for its innovative research and strong international partnerships.',
            'Nanjing University': 'One of China\'s oldest and most prestigious universities, known for its strong programs in humanities, sciences, and engineering.',
            'Wuhan University': 'A comprehensive research university known for its beautiful campus and strong programs in medicine, law, and engineering.',
            'Sun Yat-sen University': 'A leading university known for its strong programs in medicine, business, and international studies.',
            'Tongji University': 'A prestigious university particularly renowned for its architecture, engineering, and urban planning programs.'
        };
        
        // Use custom description if available
        if (customDescriptions[uni.name_en]) {
            description = `${uni.name_en} is ${customDescriptions[uni.name_en]}. Located in ${uni.city}`;
        } else {
            // Default descriptions based on features
            if (uni.admission?.key_features) {
                const features = uni.admission.key_features.split(',');
                if (features.includes('Top_Tier')) {
                    description = `${uni.name_en} is a top-tier university in ${uni.city}, known for academic excellence and research innovation`;
                } else if (features.includes('STEM_Strong')) {
                    description = `${uni.name_en} is a leading university in ${uni.city}, particularly strong in STEM fields and technological innovation`;
                } else if (features.includes('Liberal_Arts')) {
                    description = `${uni.name_en} is a comprehensive university in ${uni.city}, excelling in liberal arts, humanities, and cultural studies`;
                }
            }
        }
        
        // Add ranking information to description
        if (globalRanking <= 100) {
            description += ` and ranked among the top 100 universities globally`;
        } else if (globalRanking <= 500) {
            description += ` and ranked among the top 500 universities globally`;
        }
        
        // Add special programs info
        if (uni.admission?.total_international_students > 3000) {
            description += `. The university has a large international student community`;
        }
        
        return {
            id: uni.id,
            name: uni.name_en,
            abbreviation: uni.name_en.split(' ').map(word => word[0]).join(''),
            city: uni.city,
            citySize: citySize,
            globalRanking: globalRanking,
            fields: fields,
            programs: programs,
            description: description,
            website: uni.admission?.official_website || '',
            scholarships: ['Chinese Government Scholarship'],
            applicationDeadline: uni.admission?.application_deadline || 'March 31',
            acceptanceRate: acceptanceRate,
            // Add additional data for better matching
            admissionData: uni.admission,
            costsData: uni.costs,
            originalPrograms: uni.programs,
            // Add enhanced data
            scholarshipData: uni.scholarships,
            additionalData: uni.additional_info
        };
    });
}

// Setup event listeners
function setupEventListeners() {
    // Option card selection
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            selectOption(this);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && currentStep > 0) {
            nextStep();
        } else if (e.key === 'Escape' && currentStep > 1) {
            previousStep();
        }
    });
}

// Start the quiz
function startQuiz() {
    currentStep = 1;
    showStep('step1');
    updateNavigation();
}

// Show specific step
function showStep(stepId) {
    // Hide all steps
    document.querySelectorAll('.quiz-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.getElementById(stepId);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Update progress
    updateProgress();
}

// Update progress bar
function updateProgress() {
    const progress = ((currentStep - 1) / (quizSteps.length - 2)) * 100; // -2 because welcome doesn't count
    // You can add a progress bar here if needed
}

// Select an option
function selectOption(card) {
    // Remove selection from all cards in current step
    const currentStepElement = document.querySelector('.quiz-step.active');
    currentStepElement.querySelectorAll('.option-card').forEach(c => {
        c.classList.remove('selected');
    });
    
    // Select clicked card
    card.classList.add('selected');
    
    // Store the answer
    const stepId = currentStepElement.id;
    const value = card.getAttribute('data-value');
    userAnswers[stepId] = value;
    
    // Enable next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

// Next step
function nextStep() {
    if (currentStep < quizSteps.length - 1) {
        currentStep++;
        showStep(quizSteps[currentStep]);
        updateNavigation();
    } else {
        // Quiz completed, show results
        showResults();
    }
}

// Previous step
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(quizSteps[currentStep]);
        updateNavigation();
    }
}

// Update navigation buttons
function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.style.display = currentStep > 1 ? 'flex' : 'none';
    }
    
    if (nextBtn) {
        nextBtn.style.display = currentStep > 0 ? 'flex' : 'none';
        nextBtn.disabled = !userAnswers[quizSteps[currentStep]];
    }
}

// Show results
function showResults() {
    // Show loading screen
    document.getElementById('loadingScreen').style.display = 'flex';
    
    // Simulate processing time
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        
        // Hide quiz container
        document.getElementById('quizContainer').style.display = 'none';
        
        // Show results container
        document.getElementById('resultsContainer').style.display = 'block';
        
        // Generate matches
        matchedUniversities = generateMatches();
        
        // Display results
        displayResults();
        
        // Setup PayPal donation buttons
        setupPayPal();
        setupMainDonationButton();
    }, 2000);
}

// Generate university matches
function generateMatches() {
    const matches = [];
    console.log('Generating matches for answers:', userAnswers);
    console.log('Available universities:', universities.length);
    
    universities.forEach(university => {
        let score = 0;
        const maxScore = 100;
        
        // Field of study match (25 points)
        if (university.fields.includes(userAnswers.step1)) {
            score += 25;
        }
        
        // Academic level compatibility (15 points)
        const academicLevel = userAnswers.step2;
        const hasPrograms = university.programs[academicLevel] && 
                          university.programs[academicLevel][userAnswers.step1];
        if (hasPrograms) {
            score += 15;
        }
        
        // Budget compatibility (20 points)
        const budget = userAnswers.step3;
        const tuition = hasPrograms ? university.programs[academicLevel][userAnswers.step1].tuition : 0;
        
        if (budget === 'low' && tuition <= 5000) score += 20;
        else if (budget === 'medium' && tuition <= 10000) score += 20;
        else if (budget === 'high' && tuition > 10000) score += 20;
        else if (budget === 'low' && tuition <= 7000) score += 15;
        else if (budget === 'medium' && tuition <= 15000) score += 15;
        else score += 5;
        
        // City size preference (15 points)
        if (university.citySize === userAnswers.step4) {
            score += 15;
        } else if ((userAnswers.step4 === 'mega' && university.citySize === 'large') ||
                   (userAnswers.step4 === 'large' && university.citySize === 'medium')) {
            score += 10;
        }
        
        // Ranking importance (15 points)
        const rankingPref = userAnswers.step5;
        if (rankingPref === 'very' && university.globalRanking <= 100) score += 15;
        else if (rankingPref === 'important' && university.globalRanking <= 500) score += 15;
        else if (rankingPref === 'moderate') score += 10;
        else if (rankingPref === 'very' && university.globalRanking <= 200) score += 10;
        else if (rankingPref === 'important' && university.globalRanking <= 1000) score += 10;
        
        // English programs (10 points)
        const englishPref = userAnswers.step6;
        const chineseLevel = userAnswers.step7;
        
        if (hasPrograms) {
            const program = university.programs[academicLevel][userAnswers.step1];
            
            if (englishPref === 'yes' && program.englishPrograms) score += 10;
            else if (englishPref === 'both') score += 10;
            else if (englishPref === 'chinese' && !program.englishPrograms) score += 10;
            else if (englishPref === 'yes' && !program.englishPrograms) score -= 5;
        }
        
        // Chinese language requirement (10 points)
        if (hasPrograms) {
            const program = university.programs[academicLevel][userAnswers.step1];
            
            if (program.chineseRequired && chineseLevel !== 'none') {
                if (chineseLevel === 'advanced') score += 10;
                else if (chineseLevel === 'intermediate') score += 8;
                else if (chineseLevel === 'basic') score += 5;
            } else if (!program.chineseRequired) {
                score += 10;
            }
        }
        
        // Normalize score to 0-100
        score = Math.max(0, Math.min(100, score));
        
        if (score > 30) { // Only include universities with decent match
            matches.push({
                ...university,
                matchScore: score
            });
        }
    });
    
    // Sort by match score (descending) and return top 10
    const finalMatches = matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
    console.log('Found matches:', finalMatches.length);
    console.log('Top matches:', finalMatches.slice(0, 3));
    return finalMatches;
}

// Display results
function displayResults() {
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '';
    
    // Show all results for free
    matchedUniversities.forEach((university, index) => {
        const card = createUniversityCard(university, index + 1);
        resultsGrid.appendChild(card);
    });
    
    // Add donation section
    const donationCard = document.createElement('div');
    donationCard.className = 'university-card donation-section';
    donationCard.innerHTML = `
        <div class="donation-content">
            <i class="fas fa-heart"></i>
            <h3>Support This Project</h3>
            <p>If you found this tool helpful, consider making a donation to help us maintain and improve it.</p>
            <div id="donation-button-container"></div>
        </div>
    `;
    resultsGrid.appendChild(donationCard);
}

// Create university card
function createUniversityCard(university, rank) {
    const card = document.createElement('div');
    card.className = 'university-card';
    
    const academicLevel = userAnswers.step2;
    const field = userAnswers.step1;
    const program = university.programs[academicLevel] && university.programs[academicLevel][field];
    
    // Get accurate tuition information
    let tuition = 'N/A';
    if (program && program.tuition) {
        tuition = program.tuition.toLocaleString();
    } else if (university.costsData) {
        // Fallback to general tuition data
        if (academicLevel === 'undergraduate') {
            if (field === 'engineering' || field === 'science') {
                tuition = university.costsData.ug_tuition_stem?.toLocaleString() || 'N/A';
            } else if (field === 'medicine') {
                tuition = university.costsData.ug_tuition_medicine?.toLocaleString() || 'N/A';
            } else {
                tuition = university.costsData.ug_tuition_liberal_arts?.toLocaleString() || 'N/A';
            }
        } else if (academicLevel === 'graduate') {
            if (field === 'business') {
                tuition = university.costsData.pg_tuition_mba?.toLocaleString() || 'N/A';
            } else if (field === 'engineering' || field === 'science') {
                tuition = university.costsData.pg_tuition_stem?.toLocaleString() || 'N/A';
            } else {
                tuition = university.costsData.pg_tuition_liberal_arts?.toLocaleString() || 'N/A';
            }
        }
    }
    
    const englishPrograms = program ? program.englishPrograms : true; // Most programs have English options
    const chineseRequired = program ? program.chineseRequired : false;
    
    // Get additional details from admission data
    const gpaRequirement = academicLevel === 'undergraduate' ? 
        university.admissionData?.ug_min_gpa : university.admissionData?.pg_min_gpa;
    const hskLevel = university.admissionData?.hsk_min_level;
    const livingCost = university.costsData?.living_cost_avg?.toLocaleString();
    
    // Get scholarship information
    const scholarshipData = university.scholarshipData;
    const additionalData = university.additionalData;
    
    card.innerHTML = `
        <div class="university-header">
            <div class="university-logo">${university.abbreviation}</div>
            <div class="university-info">
                <h3>${rank}. ${university.name}</h3>
                <p>${university.city} • Global Rank #${university.globalRanking}</p>
            </div>
        </div>
        <div class="university-details">
            <div class="detail-item">
                <i class="fas fa-dollar-sign"></i>
                <span>Tuition: $${tuition}/year</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-language"></i>
                <span>${englishPrograms ? 'English Programs' : 'Chinese Only'}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${university.city}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-graduation-cap"></i>
                <span>Acceptance: ${(university.acceptanceRate * 100).toFixed(1)}%</span>
            </div>
            ${gpaRequirement ? `
            <div class="detail-item">
                <i class="fas fa-chart-line"></i>
                <span>Min GPA: ${gpaRequirement}</span>
            </div>
            ` : ''}
            ${hskLevel ? `
            <div class="detail-item">
                <i class="fas fa-language"></i>
                <span>HSK Level: ${hskLevel}</span>
            </div>
            ` : ''}
            ${livingCost ? `
            <div class="detail-item">
                <i class="fas fa-home"></i>
                <span>Living Cost: $${livingCost}/year</span>
            </div>
            ` : ''}
        </div>
        <p class="university-description">${university.description}</p>
        
        <!-- Scholarship Information -->
        ${scholarshipData ? `
        <div class="scholarship-section">
            <h4><i class="fas fa-gift"></i> Scholarship Opportunities</h4>
            <div class="scholarship-details">
                ${scholarshipData.csc_scholarship_quota ? `
                <div class="scholarship-item">
                    <span class="scholarship-label">CSC Quota:</span>
                    <span class="scholarship-value">${scholarshipData.csc_scholarship_quota} students</span>
                </div>
                ` : ''}
                ${scholarshipData.csc_coverage ? `
                <div class="scholarship-item">
                    <span class="scholarship-label">CSC Coverage:</span>
                    <span class="scholarship-value">${scholarshipData.csc_coverage}</span>
                </div>
                ` : ''}
                ${scholarshipData.university_amount ? `
                <div class="scholarship-item">
                    <span class="scholarship-label">University Scholarships:</span>
                    <span class="scholarship-value">${scholarshipData.university_amount}</span>
                </div>
                ` : ''}
                ${scholarshipData.confucius_institute_scholarship ? `
                <div class="scholarship-item">
                    <span class="scholarship-label">Confucius Institute:</span>
                    <span class="scholarship-value">Available</span>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <!-- Additional Information -->
        ${additionalData ? `
        <div class="additional-section">
            <h4><i class="fas fa-info-circle"></i> Additional Information</h4>
            <div class="additional-details">
                ${additionalData.total_international_students ? `
                <div class="additional-item">
                    <span class="additional-label">International Students:</span>
                    <span class="additional-value">${additionalData.total_international_students.toLocaleString()}</span>
                </div>
                ` : ''}
                ${additionalData.campus_rating_1to5 ? `
                <div class="additional-item">
                    <span class="additional-label">Campus Rating:</span>
                    <span class="additional-value">${'⭐'.repeat(additionalData.campus_rating_1to5)}</span>
                </div>
                ` : ''}

                ${additionalData.career_support ? `
                <div class="additional-item">
                    <span class="additional-label">Career Support:</span>
                    <span class="additional-value">${additionalData.career_support}</span>
                </div>
                ` : ''}
                ${additionalData.internship_opportunities ? `
                <div class="additional-item">
                    <span class="additional-label">Internships:</span>
                    <span class="additional-value">${additionalData.internship_opportunities}</span>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <div class="match-score">
            ${university.matchScore}% Match
        </div>
    `;
    
    return card;
}

// Setup PayPal donation integration
function setupPayPal() {
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: '5.00'
                        },
                        description: 'Donation to China University Selection Calculator'
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // Donation successful
                    showThankYouMessage();
                });
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                alert('Donation failed. Please try again.');
            }
        }).render('#donation-button-container');
    } else {
        // Fallback if PayPal SDK fails to load
        const container = document.getElementById('donation-button-container');
        container.innerHTML = `
            <button class="btn btn-primary" onclick="showThankYouMessage()">
                <i class="fas fa-heart"></i>
                Support This Project ($5)
            </button>
        `;
    }
}

// Show thank you message (after donation)
function showThankYouMessage() {
    const donationContainer = document.getElementById('donation-button-container');
    if (donationContainer) {
        donationContainer.innerHTML = `
            <div class="thank-you-message">
                <i class="fas fa-check-circle"></i>
                <h4>Thank You for Your Support!</h4>
                <p>Your donation helps us maintain and improve this tool for students worldwide.</p>
            </div>
        `;
    }
}

// Setup main donation button
function setupMainDonationButton() {
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: '5.00'
                        },
                        description: 'Donation to China University Selection Calculator'
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // Donation successful
                    showMainThankYouMessage();
                });
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                alert('Donation failed. Please try again.');
            }
        }).render('#donation-button-container-main');
    } else {
        // Fallback if PayPal SDK fails to load
        const container = document.getElementById('donation-button-container-main');
        container.innerHTML = `
            <button class="btn btn-primary" onclick="showMainThankYouMessage()">
                <i class="fas fa-heart"></i>
                Support This Project ($5)
            </button>
        `;
    }
}

// Show thank you message for main donation
function showMainThankYouMessage() {
    const donationContainer = document.getElementById('donation-button-container-main');
    if (donationContainer) {
        donationContainer.innerHTML = `
            <div class="thank-you-message">
                <i class="fas fa-check-circle"></i>
                <h4>Thank You for Your Support!</h4>
                <p>Your donation helps us maintain and improve this tool for students worldwide.</p>
            </div>
        `;
    }
}

// Restart quiz
function restartQuiz() {
    currentStep = 0;
    userAnswers = {};
    matchedUniversities = [];
    
    // Reset all selections
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Show welcome screen
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    showStep('welcome');
    updateNavigation();
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function getFieldIcon(field) {
    const icons = {
        'engineering': 'fas fa-cogs',
        'business': 'fas fa-chart-line',
        'medicine': 'fas fa-heartbeat',
        'arts': 'fas fa-palette',
        'science': 'fas fa-atom',
        'social': 'fas fa-users'
    };
    return icons[field] || 'fas fa-graduation-cap';
}

// Export functions for global access
window.startQuiz = startQuiz;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.restartQuiz = restartQuiz;
window.showThankYouMessage = showThankYouMessage;
window.showMainThankYouMessage = showMainThankYouMessage;

