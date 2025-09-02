// Global variables
let currentStep = 0;
let userAnswers = {};
let universities = [];
let matchedUniversities = [];

// User counter functionality




// Quiz steps configuration
const quizSteps = [
    'welcome',
    'step1', // Degree level (undergraduate/postgraduate)
    'step2', // University type and classification
    'step3', // Language preference
    'step3a', // Chinese HSK level (conditional)
    'step3b', // English level (conditional)
    'step4', // Budget and costs
    'step5', // Scholarship opportunities
    'step6'  // Academic programs
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {

    loadUniversities();
    setupEventListeners();
    optimizeFontLoading();
    optimizeImageLoading();
    
    // Initialize donation button immediately
    setupMainDonationButton();
});

// Font loading optimization
function optimizeFontLoading() {
    // Check if fonts are loaded
    if ('fonts' in document) {
        Promise.all([
            document.fonts.load('400 1em Inter'),
            document.fonts.load('600 1em Inter'),
            document.fonts.load('700 1em Inter')
        ]).then(() => {
            // Fonts loaded, add class to body
            document.body.classList.add('fonts-loaded');
        }).catch(() => {
            // Fallback to system fonts
            document.body.classList.add('fonts-fallback');
        });
    }
}

// Image loading optimization
function optimizeImageLoading() {
    const logoImage = document.querySelector('.logo-image');
    if (logoImage) {
        // Add loading animation
        logoImage.style.opacity = '0';
        logoImage.style.transition = 'opacity 0.3s ease';
        
        logoImage.onload = function() {
            this.style.opacity = '1';
        };
        
        logoImage.onerror = function() {
            console.warn('Logo failed to load, using fallback');
            this.style.display = 'none';
            // Add a fallback icon
            const fallbackIcon = document.createElement('div');
            fallbackIcon.className = 'logo-fallback';
            fallbackIcon.innerHTML = '<i class="fas fa-graduation-cap"></i>';
            this.parentNode.insertBefore(fallbackIcon, this);
        };
    }
}

// Load universities data
async function loadUniversities() {
    try {
        const response = await fetch('universities.json');
        const data = await response.json();
        console.log('Raw data loaded:', data);
        console.log('Universities array length:', data.universities?.length);
        
        // Transform the new data structure to match the expected format
        universities = transformUniversityData(data.universities);
        console.log('=== UNIVERSITIES LOADED ===');
        console.log('Loaded universities:', universities.length);
        console.log('Sample university:', universities[0]);
        console.log('First 3 universities:', universities.slice(0, 3).map(u => ({ name: u.name, fields: u.fields, city: u.city })));
        
        // Check if any universities have medicine programs
        const medicineUnis = universities.filter(uni => uni.fields.includes('medicine'));
        console.log('Universities with medicine programs:', medicineUnis.length);
        console.log('Medicine universities:', medicineUnis.map(uni => uni.name));
        
    } catch (error) {
        console.error('Error loading universities:', error);
        // Fallback data if JSON fails to load
        universities = [];
    }
}

// Transform new university data structure to match expected format
function transformUniversityData(universitiesData) {
    const transformed = universitiesData.map(uni => {
        // Map programs to fields based on new data structure
        let fields = [];
        
        if (uni.programs) {
            if (uni.programs.engineering) fields.push('engineering');
            if (uni.programs.business_economics) fields.push('business');
            if (uni.programs.medicine_health) fields.push('medicine');
            if (uni.programs.arts_humanities) fields.push('arts');
            if (uni.programs.natural_sciences) fields.push('science');
            if (uni.programs.social_sciences) fields.push('social');
        }
        
        // Early return if no fields found
        if (fields.length === 0) {
            console.warn(`No fields found for ${uni.name_en}, skipping`);
            return null;
        }
        
        // Get global ranking from new data structure
        let globalRanking = 1000; // Default fallback
        if (uni.rankings?.qs_rank_2026) {
            globalRanking = uni.rankings.qs_rank_2026;
        } else if (uni.rankings?.the_rank_2025) {
            globalRanking = uni.rankings.the_rank_2025;
        }
        
        // Determine city size based on city tier
        let citySize = 'medium';
        if (uni.city_tier === 'Tier_1') {
            citySize = 'mega';
        } else if (uni.city_tier === 'Tier_2') {
            citySize = 'large';
        } else if (uni.city_tier === 'Tier_3') {
            citySize = 'small';
        }
        
        // Calculate total cost
        let totalCost = 0;
        if (uni.tuition_fees) {
            const tuition = uni.tuition_fees.ug_tuition_low || uni.tuition_fees.pg_tuition_low || 30000;
            const livingCost = uni.city_tier === 'Tier_1' ? 30000 : uni.city_tier === 'Tier_2' ? 20000 : 15000;
            totalCost = tuition + livingCost;
        } else {
            totalCost = 50000; // Default cost
        }
        
        // Create costs structure
        const costsData = {
            ug_tuition_liberal_arts: uni.tuition_fees?.ug_tuition_low || 30000,
            ug_tuition_stem: uni.tuition_fees?.ug_tuition_low || 30000,
            ug_tuition_medicine: uni.tuition_fees?.ug_tuition_low || 35000,
            pg_tuition_liberal_arts: uni.tuition_fees?.pg_tuition_low || 35000,
            pg_tuition_stem: uni.tuition_fees?.pg_tuition_low || 35000,
            pg_tuition_mba: uni.tuition_fees?.pg_tuition_low || 40000,
            accommodation_on_campus: uni.city_tier === 'Tier_1' ? 12000 : uni.city_tier === 'Tier_2' ? 8000 : 6000,
            accommodation_off_campus: uni.city_tier === 'Tier_1' ? 15000 : uni.city_tier === 'Tier_2' ? 10000 : 8000,
            living_cost_avg: uni.city_tier === 'Tier_1' ? 30000 : uni.city_tier === 'Tier_2' ? 20000 : 15000
        };
        
        // Create admission data structure
        const admissionData = {
            ug_min_gpa: uni.admission_requirements?.admission_difficulty === 5 ? 3.5 : 
                       uni.admission_requirements?.admission_difficulty === 4 ? 3.3 : 3.0,
            pg_min_gpa: uni.admission_requirements?.admission_difficulty === 5 ? 3.7 : 
                       uni.admission_requirements?.admission_difficulty === 4 ? 3.5 : 3.3,
            hsk_requirement: uni.admission_requirements?.hsk_min_level || 4,
            toefl_requirement: uni.admission_requirements?.english_toefl_min || 80,
            ielts_requirement: uni.admission_requirements?.english_ielts_min || 6.0,
            accept_foundation: uni.admission_requirements?.accept_foundation || false
        };
        
        // Create programs structure
        const programs = {
            undergraduate: {},
            graduate: {}
        };
        
        // Map programs based on available fields
        fields.forEach(field => {
            const hasEnglishPrograms = true; // Most universities have English programs
            const tuition = uni.tuition_fees?.ug_tuition_low || 30000;
            
            programs.undergraduate[field] = {
                tuition: tuition,
                englishPrograms: hasEnglishPrograms,
                chineseRequired: false
            };
            
            if (uni.tuition_fees?.pg_tuition_low) {
                const pgTuition = uni.tuition_fees.pg_tuition_low;
                programs.graduate[field] = {
                    tuition: pgTuition,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
            }
        });
        
        return {
            id: uni.id,
            name: uni.name_en,
            name_cn: uni.name_cn,
            city: uni.city,
            province: uni.province,
            city_tier: uni.city_tier,
            university_type: uni.university_type,
            rankings: uni.rankings,
            classifications: uni.classifications,
            admission_requirements: uni.admission_requirements,
            tuition_fees: uni.tuition_fees,
            scholarships: uni.scholarships,
            programs: uni.programs,
            fields: fields,
            programs: programs,
            citySize: citySize,
            globalRanking: globalRanking,
            costsData: costsData,
            admissionData: admissionData,
            totalCost: totalCost,
            hasEnglishPrograms: true, // Most universities have English programs
            acceptFoundation: uni.admission_requirements?.accept_foundation || false,
            additional_info: uni.additional_info // 添加这个字段！
        };
    }).filter(uni => uni !== null);
    
    console.log('Transformed universities:', transformed.length);
    return transformed;
}

// Setup event listeners
function setupEventListeners() {
    // Option card selection with touch optimization
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            selectOption(this);
        });
        
        // Add touch feedback for mobile
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = '';
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
    
    // Prevent zoom on double tap for mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Optimize scroll performance on mobile
    document.addEventListener('touchmove', function(e) {
        if (e.target.closest('.option-card')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Start the quiz
function startQuiz() {
    currentStep = 1;
    showStep('step1');
    updateNavigation();
    
    // Initialize progress bar
    updateProgressBar();
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
    
    // Update progress bar
    updateProgressBar();
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
    
    console.log('Selected option:', stepId, value);
    console.log('Current user answers:', userAnswers);
    console.log('Current step:', currentStep);
    
    // Enable next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.disabled = false;
        console.log('Next button enabled');
    }
}

// Next step
function nextStep() {
    console.log('Next step called. Current step:', currentStep, 'Total steps:', quizSteps.length);
    console.log('Current user answers:', userAnswers);
    
    // Handle conditional step navigation
    if (currentStep === 3 && userAnswers['step3'] === 'chinese') {
        // If user chose Chinese instruction, go to HSK level step
        currentStep = 4; // step3a
        console.log('Moving to HSK level step (step3a)');
        showStep('step3a');
        updateNavigation();
    } else if (currentStep === 3 && (userAnswers['step3'] === 'english' || userAnswers['step3'] === 'both')) {
        // If user chose English or both, go to English level step
        currentStep = 5; // step3b
        console.log('Moving to English level step (step3b)');
        showStep('step3b');
        updateNavigation();
    } else if (currentStep === 4 && userAnswers['step3a']) {
        // After HSK level, go to budget step
        currentStep = 6; // step4
        console.log('Moving to budget step (step4)');
        showStep('step4');
        updateNavigation();
    } else if (currentStep === 5 && userAnswers['step3b']) {
        // After English level, go to budget step
        currentStep = 6; // step4
        console.log('Moving to budget step (step4)');
        showStep('step4');
        updateNavigation();
    } else if (currentStep === 6 && userAnswers['step4']) {
        // After budget step, go to scholarship step
        currentStep = 7; // step5
        console.log('Moving to scholarship step (step5)');
        showStep('step5');
        updateNavigation();
    } else if (currentStep === 7 && userAnswers['step5']) {
        // After scholarship step, go to academic programs step
        currentStep = 8; // step6
        console.log('Moving to academic programs step (step6)');
        showStep('step6');
        updateNavigation();
    } else if (currentStep === 8 && userAnswers['step6']) {
        // Quiz completed, show results
        console.log('Quiz completed, showing results');
        showResults();
    } else if (currentStep < quizSteps.length - 1) {
        // Normal step progression
        currentStep++;
        console.log('Moving to step:', currentStep, 'Step ID:', quizSteps[currentStep]);
        showStep(quizSteps[currentStep]);
        updateNavigation();
    } else {
        // Quiz completed, show results
        console.log('Quiz completed, showing results');
        showResults();
    }
}

// Previous step
function previousStep() {
    if (currentStep > 1) {
        if (currentStep === 7 && (userAnswers['step3'] === 'english' || userAnswers['step3'] === 'both')) {
            // If we're at scholarship step and user chose English/both, go back to budget step
            currentStep = 6; // step4
            showStep('step4');
        } else if (currentStep === 7 && userAnswers['step3'] === 'chinese') {
            // If we're at scholarship step and user chose Chinese, go back to budget step
            currentStep = 6; // step4
            showStep('step4');
        } else if (currentStep === 6 && (userAnswers['step3'] === 'english' || userAnswers['step3'] === 'both')) {
            // If we're at budget step and user chose English/both, go back to English level
            currentStep = 5; // step3b
            showStep('step3b');
        } else if (currentStep === 6 && userAnswers['step3'] === 'chinese') {
            // If we're at budget step and user chose Chinese, go back to HSK level
            currentStep = 4; // step3a
            showStep('step3a');
        } else if (currentStep === 5 || currentStep === 4) {
            // If we're at language level steps, go back to language preference
            currentStep = 3; // step3
            showStep('step3');
        } else if (currentStep === 8) {
            // If we're at academic programs step, go back to scholarship step
            currentStep = 7; // step5
            showStep('step5');
        } else {
            // Normal step regression
            currentStep--;
            showStep(quizSteps[currentStep]);
        }
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
        
        // Check if current step has an answer
        let hasAnswer = false;
        const currentStepElement = document.querySelector('.quiz-step.active');
        if (currentStepElement) {
            const stepId = currentStepElement.id;
            hasAnswer = !!userAnswers[stepId];
        }
        
        console.log('Current step element:', currentStepElement?.id, 'Has answer:', hasAnswer);
        nextBtn.disabled = !hasAnswer;
    }
    
    // Update progress bar
    updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
        // Calculate progress percentage (excluding welcome screen and conditional steps)
        const totalSteps = 6; // Fixed total steps: step1, step2, step3, step4, step5, step6
        let currentProgress = 0;
        let currentStepDisplay = 1;
        
        if (currentStep >= 1) {
            currentProgress = 1; // step1 (degree level) completed
            currentStepDisplay = 1;
        }
        if (currentStep >= 2) {
            currentProgress = 2; // step2 (university type) completed
            currentStepDisplay = 2;
        }
        if (currentStep >= 3) {
            currentProgress = 3; // step3 (language preference) completed
            currentStepDisplay = 3;
        }
        if (currentStep >= 5) {
            currentProgress = 4; // step4 (budget) completed
            currentStepDisplay = 4;
        }
        if (currentStep >= 6) {
            currentProgress = 5; // step5 (scholarship) completed
            currentStepDisplay = 5;
        }
        if (currentStep >= 7) {
            currentProgress = 6; // step6 (academic programs) completed
            currentStepDisplay = 6;
        }
        
        const percentage = (currentProgress / totalSteps) * 100;
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `Step ${currentStepDisplay} of ${totalSteps}`;
    }
}

// Show results
function showResults() {
    console.log('showResults called');
    // Show loading screen
    document.getElementById('loadingScreen').style.display = 'flex';
    
    // Simulate processing time
    setTimeout(() => {
        console.log('Processing results...');
        document.getElementById('loadingScreen').style.display = 'none';
        
        // Hide quiz container
        document.getElementById('quizContainer').style.display = 'none';
        
        // Show results container
        document.getElementById('resultsContainer').style.display = 'block';
        
        // Generate matches
        matchedUniversities = generateMatches();
        console.log('Generated matches:', matchedUniversities.length);
        console.log('Generated matches array:', matchedUniversities);
        
        // Display results
        displayResults();
        
        // Buy Me a Coffee button is now static HTML
    }, 2000);
}

// Generate university matches
function generateMatches() {
    const matches = [];
    console.log('=== GENERATE MATCHES START ===');
    console.log('Generating matches for answers:', userAnswers);
    console.log('Available universities:', universities.length);
    console.log('User answers object:', JSON.stringify(userAnswers, null, 2));
    
    // Check if all required answers are present
            const requiredSteps = ['step1', 'step2', 'step3', 'step4', 'step5'];
    const missingSteps = requiredSteps.filter(step => !userAnswers[step]);
    if (missingSteps.length > 0) {
        console.error('Missing answers for steps:', missingSteps);
        return [];
    }
    
    // Debug: Check if universities have the expected structure
    if (universities.length > 0) {
        console.log('Sample university structure:', {
            name: universities[0].name,
            fields: universities[0].fields,
            programs: universities[0].programs,
            citySize: universities[0].citySize,
            globalRanking: universities[0].globalRanking
        });
    }
    
    for (let i = 0; i < universities.length; i++) {
        const university = universities[i];
        let score = 0;
        const maxScore = 100;
        

        
        // Debug: Log university being processed
        console.log(`Processing university ${i + 1}/${universities.length}: ${university.name}`);
        
        // 1. University type match (25 points) - 大学类型匹配，最重要的因素
        console.log(`Checking university type match for ${university.name}: looking for "${userAnswers.step2}" in classifications`);
        
        // 检查大学类型匹配 - 严格过滤
        let universityTypeScore = 0;
        const universityType = userAnswers.step2; // c9, 985, 211, any
        
        if (universityType === 'any') {
            // 如果选择任何类型，给基础分
            universityTypeScore = 20;
        } else if (universityType === 'c9') {
            // 严格只匹配C9联盟大学
            if (university.classifications?.c9_league) {
                universityTypeScore = 25;
            } else {
                // 不是C9，跳过这所大学
                console.log(`Skipping ${university.name}: not a C9 university`);
                continue;
            }
        } else if (universityType === '985') {
            // 严格只匹配985大学（排除C9）
            if (university.classifications?.project_985 && !university.classifications?.c9_league) {
                universityTypeScore = 25;
            } else {
                // 不是985或已经是C9，跳过
                console.log(`Skipping ${university.name}: not a 985 university or is C9`);
                continue;
            }
        } else if (universityType === '211') {
            // 严格只匹配211大学（排除985和C9）
            if (university.classifications?.project_211 && !university.classifications?.project_985) {
                universityTypeScore = 25;
            } else {
                // 不是211或已经是985/C9，跳过
                console.log(`Skipping ${university.name}: not a 211 university or is 985/C9`);
                continue;
            }
        } else {
            // 不匹配，给基础分
            universityTypeScore = 10;
        }
        
        // 大学排名加分 (0-8分)
        let typeRankingBonus = 0;
        if (university.globalRanking <= 50) {
            typeRankingBonus = 8; // 世界前50
        } else if (university.globalRanking <= 100) {
            typeRankingBonus = 6; // 世界前100
        } else if (university.globalRanking <= 200) {
            typeRankingBonus = 4; // 世界前200
        } else if (university.globalRanking <= 500) {
            typeRankingBonus = 2; // 世界前500
        } else {
            typeRankingBonus = 1; // 其他大学
        }
        
        universityTypeScore += typeRankingBonus;
        score += universityTypeScore;
        console.log(`✓ University type match for ${university.name}: ${userAnswers.step2} matched, score: ${universityTypeScore} (base: ${universityTypeScore - typeRankingBonus}, ranking bonus: ${typeRankingBonus})`);
        
        // 2. Budget compatibility (20 points) - 预算匹配，重要因素
        const budget = userAnswers.step4;
        const degreeLevel = userAnswers.step1; // undergraduate or postgraduate
        
        // Get tuition based on degree level with N/A handling
        let tuition = 0;
        if (degreeLevel === 'undergraduate') {
            tuition = university.tuition_fees?.ug_tuition_low || 30000;
            // If N/A or null, use average values based on university ranking
            if (!university.tuition_fees?.ug_tuition_low || university.tuition_fees.ug_tuition_low === null) {
                if (university.globalRanking <= 100) tuition = 35000;
                else if (university.globalRanking <= 500) tuition = 30000;
                else tuition = 25000;
            }
        } else if (degreeLevel === 'postgraduate') {
            tuition = university.tuition_fees?.pg_tuition_low || 40000;
            // If N/A or null, use average values based on university ranking
            if (!university.tuition_fees?.pg_tuition_low || university.tuition_fees.pg_tuition_low === null) {
                if (university.globalRanking <= 100) tuition = 45000;
                else if (university.globalRanking <= 500) tuition = 40000;
                else tuition = 35000;
            }
        }
        
        // Calculate total cost (tuition + living costs)
        const livingCosts = 12000; // Average living costs per year
        const totalCost = tuition + livingCosts;
        
        // 更严格的预算匹配计算
        if (budget === 'low') {
            if (totalCost <= 35000) score += 20; // 完美匹配
            else if (totalCost <= 45000) score += 12; // 可接受
            else {
                // 超出预算太多，跳过这所大学
                console.log(`Skipping ${university.name}: budget too high (${totalCost}) for low budget`);
                continue;
            }
        } else if (budget === 'medium') {
            if (totalCost <= 70000) score += 20; // 完美匹配
            else if (totalCost <= 90000) score += 15; // 可接受
            else {
                // 超出预算太多，跳过这所大学
                console.log(`Skipping ${university.name}: budget too high (${totalCost}) for medium budget`);
                continue;
            }
        } else if (budget === 'high') {
            if (totalCost >= 60000) score += 20; // 高预算完美匹配
            else if (totalCost >= 40000) score += 15; // 可接受
            else score += 10; // 成本较低但仍可接受
        }
        
        // 3. Language requirements (18 points) - 语言匹配很重要
        const languagePreference = userAnswers.step3;
        const languageLevel = userAnswers.step3a || userAnswers.step3b;
        
        if (languagePreference === 'chinese') {
            // Chinese instruction - check HSK level
            const userHSKLevel = parseInt(languageLevel.replace('hsk', ''));
            const requiredHSKLevel = university.admission_requirements?.hsk_min_level || 3;
            
            // Handle N/A values with default requirements based on university ranking
            let effectiveRequiredHSK = requiredHSKLevel;
            if (!requiredHSKLevel || requiredHSKLevel === null) {
                if (university.globalRanking <= 100) effectiveRequiredHSK = 4;
                else if (university.globalRanking <= 500) effectiveRequiredHSK = 3;
                else effectiveRequiredHSK = 3;
            }
            
            if (userHSKLevel >= effectiveRequiredHSK) {
                score += 18; // Perfect match
            } else if (userHSKLevel >= effectiveRequiredHSK - 1) {
                score += 15; // Close match (more generous)
            } else if (userHSKLevel >= effectiveRequiredHSK - 2) {
                score += 10; // Acceptable match (more generous)
            } else {
                score += 5; // Poor match but still some points
            }
        } else if (languagePreference === 'english' || languagePreference === 'both') {
            // English instruction - check TOEFL/IELTS level
            const userEnglishLevel = languageLevel;
            const requiredTOEFL = university.admission_requirements?.english_toefl_min || 70;
            const requiredIELTS = university.admission_requirements?.english_ielts_min || 5.0;
            
            // Handle N/A values with default requirements based on university ranking
            let effectiveRequiredTOEFL = requiredTOEFL;
            let effectiveRequiredIELTS = requiredIELTS;
            if (!requiredTOEFL || requiredTOEFL === null) {
                if (university.globalRanking <= 100) effectiveRequiredTOEFL = 80;
                else if (university.globalRanking <= 500) effectiveRequiredTOEFL = 70;
                else effectiveRequiredTOEFL = 65;
            }
            if (!requiredIELTS || requiredIELTS === null) {
                if (university.globalRanking <= 100) effectiveRequiredIELTS = 6.0;
                else if (university.globalRanking <= 500) effectiveRequiredIELTS = 5.5;
                else effectiveRequiredIELTS = 5.0;
            }
            
            let userTOEFL = 70;
            let userIELTS = 5.0;
            
            if (userEnglishLevel === 'english_high') {
                userTOEFL = 85;
                userIELTS = 6.5;
            } else if (userEnglishLevel === 'english_medium') {
                userTOEFL = 77; // Average of 70-85
                userIELTS = 5.75; // Average of 5.0-6.5
            } else if (userEnglishLevel === 'english_low') {
                userTOEFL = 65;
                userIELTS = 4.5;
            }
            
            // Check if user meets requirements (more generous)
            if (userTOEFL >= effectiveRequiredTOEFL && userIELTS >= effectiveRequiredIELTS) {
                score += 18; // Perfect match
            } else if (userTOEFL >= effectiveRequiredTOEFL - 15 && userIELTS >= effectiveRequiredIELTS - 1.0) {
                score += 15; // Close match (more generous)
            } else if (userTOEFL >= effectiveRequiredTOEFL - 25 && userIELTS >= effectiveRequiredIELTS - 1.5) {
                score += 10; // Acceptable match (more generous)
            } else {
                score += 5; // Poor match but still some points
            }
        }
        
        // 4. Scholarship opportunities (12 points) - 奖学金匹配，重要因素
        const scholarshipPref = userAnswers.step5;
        const hasCSCFull = university.scholarships?.csc_coverage === 'Full';
        const hasCSCPartial = university.scholarships?.csc_type_b;
        const hasConfucius = university.scholarships?.confucius_institute_scholarship;
        
        if (scholarshipPref === 'full_scholarship' && hasCSCFull) {
            score += 12;
        } else if (scholarshipPref === 'others' && (hasCSCPartial || hasConfucius)) {
            score += 12;
        } else if (scholarshipPref === 'no_scholarship') {
            score += 8; // 不需要奖学金，但给一些基础分
        } else if (scholarshipPref === 'full_scholarship' && !hasCSCFull) {
            score += 0; // 需要全额奖学金但没有
        } else if (scholarshipPref === 'others' && !hasCSCPartial && !hasConfucius) {
            score += 4; // 需要其他奖学金但没有
        }
        
        // 5. Academic programs (8 points) - 学术项目匹配
        const academicProgram = userAnswers.step6;
        let academicProgramScore = 0;
        
        // 检查学术项目匹配
        if (academicProgram === 'any_program') {
            // 如果选择任何项目，给基础分
            academicProgramScore = 6;
        } else if (academicProgram === 'engineering' && university.programs?.engineering) {
            academicProgramScore = 8;
        } else if (academicProgram === 'business' && university.programs?.business_economics) {
            academicProgramScore = 8;
        } else if (academicProgram === 'medicine' && university.programs?.medicine_health) {
            academicProgramScore = 8;
        } else if (academicProgram === 'sciences' && university.programs?.natural_sciences) {
            academicProgramScore = 8;
        } else if (academicProgram === 'social_sciences' && university.programs?.social_sciences) {
            academicProgramScore = 8;
        } else if (academicProgram === 'arts_humanities' && university.programs?.arts_humanities) {
            academicProgramScore = 8;
        } else if (academicProgram === 'chinese_language' && university.programs?.chinese_programs) {
            academicProgramScore = 8;
        } else if (academicProgram === 'foundation_programs' && university.programs?.foundation_program) {
            academicProgramScore = 8;
        } else if (academicProgram === 'exchange_programs' && university.programs?.exchange_programs) {
            academicProgramScore = 8;
        } else {
            // 不匹配，给基础分
            academicProgramScore = 3;
        }
        
        score += academicProgramScore;
        
        // 6. Academic level compatibility (10 points) - 学术水平兼容性
        const academicLevel = userAnswers.step1; // degree level
        const hasPrograms = university.programs[academicLevel] && 
                          university.programs[academicLevel][userAnswers.step2];
        const hasFieldPrograms = university.fields.includes(userAnswers.step2);
        if (hasPrograms || hasFieldPrograms) {
            score += 10;
        }
        

        

        
        // 9. 城市规模匹配 (3-7 points) - 城市偏好
        let cityBonus = 0;
        // 由于没有城市偏好问题，给所有大学基础分，大城市稍微加分
        if (university.citySize === 'megacity') {
            cityBonus = 7; // 超大城市
        } else if (university.citySize === 'large_city') {
            cityBonus = 6; // 大城市
        } else if (university.citySize === 'medium_city') {
            cityBonus = 5; // 中等城市
        } else if (university.citySize === 'small_city') {
            cityBonus = 4; // 小城市
        } else {
            cityBonus = 3; // 基础分
        }
        score += cityBonus;
        

        
        // 11. 特殊加分 - 基于大学特色
        let specialBonus = 0;
        
        // 如果大学在用户选择的大学类型中排名靠前
        if (university.globalRanking <= 200) {
            specialBonus += 3; // 排名靠前的奖励
        }
        
        // 如果大学有独特的项目或特色
        if (university.programs && Object.keys(university.programs).length > 0) {
            specialBonus += 2; // 项目丰富的奖励
        }
        
        score += specialBonus;
        

        
        // 13. 新增：预算严重超支惩罚 (-6到-2分)，更宽松
        let budgetPenalty = 0;
        if (budget === 'low' && totalCost > 100000) {
            budgetPenalty = 6; // 严重超支 (更宽松)
        } else if (budget === 'low' && totalCost > 80000) {
            budgetPenalty = 3; // 中度超支 (更宽松)
        } else if (budget === 'medium' && totalCost > 180000) {
            budgetPenalty = 4; // 严重超支 (更宽松)
        } else if (budget === 'medium' && totalCost > 150000) {
            budgetPenalty = 2; // 中度超支 (更宽松)
        }
        
        // 14. 新增：申请难度匹配 (0-5分)
        let difficultyBonus = 0;
        const admissionDifficulty = university.admission_requirements?.admission_difficulty || 3;
        if (admissionDifficulty >= 4) {
            difficultyBonus = 5; // 高难度大学
        } else if (admissionDifficulty >= 3) {
            difficultyBonus = 3; // 中等难度大学
        } else {
            difficultyBonus = 2; // 低难度大学
        }
        
        // 应用所有惩罚和奖励
        score += specialBonus - budgetPenalty + difficultyBonus;
        
        // 标准化分数到0-100
        score = Math.max(0, Math.min(100, score));
        
        console.log(`${university.name} score: ${score}`);
        console.log(`Score breakdown for ${university.name}:`, {
            universityType: universityTypeScore,
            budget: 'calculated above',
            language: 'calculated above',
            scholarship: 'calculated above',
            academicProgram: academicProgramScore,
            academicLevel: 10,
            cityBonus,
            specialBonus,
            budgetPenalty,
            difficultyBonus,
            totalScore: score
        });
        
        // Special debugging for Shanghai Jiao Tong University
        if (university.name === 'Shanghai Jiao Tong University') {
            console.log('=== SHANGHAI JIAO TONG UNIVERSITY DEBUG ===');
            console.log('User answers:', userAnswers);
            console.log('University data:', {
                name: university.name,
                fields: university.fields,
                globalRanking: university.globalRanking,
                citySize: university.citySize,
                programs: university.programs
            });
            console.log('Score breakdown:', {
                fieldMatch: university.fields.includes(userAnswers.step1) ? 25 : 0,
                budget: 'calculated above',
                language: 'calculated above',
                scholarship: 'calculated above',
                academicProgram: university.fields.includes(userAnswers.step5) ? 10 : 0,
                academicLevel: 8,
                gpa: 'calculated above',
                rankingBonus,
                cityBonus,
                realisticBonus,
                unrealisticPenalty,
                specialBonus
            });
            console.log('Final score:', score);
            console.log('=== END DEBUG ===');
        }
        
        // 如果分数太低，跳过这所大学
        if (score < 40) {
            console.log(`Skipping ${university.name}: score too low (${score})`);
            continue;
        }
        
        matches.push({
            ...university,
            matchScore: score
        });
    }
    
    // Sort by match score (descending) and return top 10
    const finalMatches = matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
    console.log('Found matches:', finalMatches.length);
    console.log('All matches with scores:', matches.map(m => `${m.name}: ${m.matchScore}%`));
    console.log('Top matches:', finalMatches.slice(0, 3));
    return finalMatches;
}

// Display results
function displayResults() {
    console.log('displayResults called');
    console.log('matchedUniversities length:', matchedUniversities.length);
    console.log('matchedUniversities:', matchedUniversities);
    
    const resultsGrid = document.getElementById('resultsGrid');
    console.log('Results grid element:', resultsGrid);
    
    if (!resultsGrid) {
        console.error('Results grid element not found!');
        return;
    }
    
    resultsGrid.innerHTML = '';
    
    // Check if we have any matches
    if (matchedUniversities.length === 0) {
        // Show no results message
        const noResultsCard = document.createElement('div');
        noResultsCard.className = 'university-card no-results';
        noResultsCard.innerHTML = `
            <div class="no-results-content">
                <i class="fas fa-search"></i>
                <h3>No Suitable Universities Found</h3>
                <p>Currently there is no suitable target school for you based on your current qualifications and preferences.</p>
                <div class="suggestions">
                    <h4>Suggestions to improve your chances:</h4>
                    <ul>
                        <li>Consider improving your GPA</li>
                        <li>Expand your budget range</li>
                        <li>Be more flexible with city preferences</li>
                        <li>Consider different fields of study</li>
                        <li>Improve your language proficiency</li>
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="restartQuiz()">
                    <i class="fas fa-redo"></i>
                    Try Different Preferences
                </button>
            </div>
        `;
        resultsGrid.appendChild(noResultsCard);
    } else {
        // Show all results for free
        console.log('Creating cards for', matchedUniversities.length, 'universities');
        matchedUniversities.forEach((university, index) => {
            const card = createUniversityCard(university, index + 1);
            resultsGrid.appendChild(card);
        });
        

    }
    console.log('Results display completed');
}

// Create university card
function createUniversityCard(university, rank) {
    const card = document.createElement('div');
    card.className = 'university-card';
    
    const degreeLevel = userAnswers.step1; // undergraduate or postgraduate
    const field = userAnswers.step2;
    
    // Get tuition information based on degree level
    let tuitionInfo = 'N/A';
    if (university.tuition_fees) {
        if (degreeLevel === 'undergraduate') {
            const ugLow = university.tuition_fees.ug_tuition_low || 30000;
            const ugHigh = university.tuition_fees.ug_tuition_high || ugLow;
            tuitionInfo = `${ugLow.toLocaleString()} - ${ugHigh.toLocaleString()} RMB/year`;
        } else if (degreeLevel === 'postgraduate') {
            const pgLow = university.tuition_fees.pg_tuition_low || 40000;
            const pgHigh = university.tuition_fees.pg_tuition_high || pgLow;
            tuitionInfo = `${pgLow.toLocaleString()} - ${pgHigh.toLocaleString()} RMB/year`;
        }
    }
    
    // Get GPA requirement
    const gpaRequirement = degreeLevel === 'undergraduate' ? 
        university.admission_requirements?.ug_min_gpa : university.admission_requirements?.pg_min_gpa;
    
    // Get HSK requirement
    const hskLevel = university.admission_requirements?.hsk_min_level;
    
    // Get living cost
    const livingCost = university.costsData?.living_cost_avg?.toLocaleString();
    
    // Get English requirements
    let englishReq = '';
    if (university.admission_requirements?.english_toefl_min && university.admission_requirements?.english_ielts_min) {
        englishReq = `TOEFL ${university.admission_requirements.english_toefl_min}+ / IELTS ${university.admission_requirements.english_ielts_min}+`;
    } else if (university.admission_requirements?.english_toefl_min) {
        englishReq = `TOEFL ${university.admission_requirements.english_toefl_min}+`;
    } else if (university.admission_requirements?.english_ielts_min) {
        englishReq = `IELTS ${university.admission_requirements.english_ielts_min}+`;
    } else {
        // Default based on ranking
        if (university.globalRanking <= 100) {
            englishReq = 'IELTS 6.5+ / TOEFL 90+';
        } else if (university.globalRanking <= 500) {
            englishReq = 'IELTS 6.0+ / TOEFL 80+';
        } else {
            englishReq = 'IELTS 5.5+ / TOEFL 70+';
        }
    }
    
    // Get scholarship information
    const hasCSCFull = university.scholarships?.csc_coverage === 'Full';
    const hasCSCPartial = university.scholarships?.csc_type_b;
    const hasConfucius = university.scholarships?.confucius_institute_scholarship;
    
    // Calculate acceptance rate based on ranking
    let acceptanceRate = 0.3; // Default 30%
    if (university.globalRanking <= 50) acceptanceRate = 0.1;
    else if (university.globalRanking <= 100) acceptanceRate = 0.15;
    else if (university.globalRanking <= 200) acceptanceRate = 0.25;
    else if (university.globalRanking <= 500) acceptanceRate = 0.4;
    else acceptanceRate = 0.6;
    
            card.innerHTML = `
        <div class="university-header">
            <div class="university-logo" id="logo-${university.id}">
                <img src="logos/${university.id}.png" alt="${university.name} logo" 
                     style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">
            </div>
            <div class="university-info">
                <h3 class="university-name" title="${university.name}">${rank}. ${university.name}</h3>
                <p class="university-meta">${university.city} • Global Rank #${university.globalRanking}</p>
            </div>
        </div>
        
        <!-- Match indicators -->
        <div class="match-indicators">
            ${getMatchIndicators(university, userAnswers)}
        </div>
        
        <!-- Key metrics -->
        <div class="key-metrics">
            <div class="metric">
                <span class="label">Tuition</span>
                <span class="value">${tuitionInfo}</span>
            </div>
            <div class="metric">
                <span class="label">Language Requirements</span>
                <span class="value">${getLanguageRequirement(university, userAnswers)}</span>
            </div>
            <div class="metric">
                <span class="label">Application Difficulty</span>
                <span class="value">${getDifficultyLevel(university)}</span>
            </div>
            <div class="metric">
                <span class="label">Additional Info</span>
                <span class="value">${getAdditionalInfo(university)}</span>
            </div>
        </div>
        
        <!-- Additional Information Section -->
        ${university.additional_info ? `
        <div class="additional-info-section">
            <h4><i class="fas fa-info-circle"></i> Additional Information</h4>
            <div class="additional-info-grid">
                ${university.additional_info.total_international_students ? `
                <div class="info-item">
                    <span class="info-label">International Students:</span>
                    <span class="info-value">${university.additional_info.total_international_students.toLocaleString()}</span>
                </div>
                ` : ''}
                
                ${university.additional_info.official_website ? `
                <div class="info-item">
                    <span class="info-label">Official Website:</span>
                    <span class="info-value">
                        <a href="https://${university.additional_info.official_website}" target="_blank" rel="noopener noreferrer">
                            ${university.additional_info.official_website}
                        </a>
                    </span>
                </div>
                ` : ''}
                
                ${university.additional_info.english_ug_programs && university.additional_info.english_ug_programs.length > 0 ? `
                <div class="info-item">
                    <span class="info-label">English UG Programs:</span>
                    <span class="info-value">${university.additional_info.english_ug_programs.slice(0, 3).join(', ')}${university.additional_info.english_ug_programs.length > 3 ? '...' : ''}</span>
                </div>
                ` : ''}
                
                ${university.additional_info.english_pg_programs && university.additional_info.english_pg_programs.length > 0 ? `
                <div class="info-item">
                    <span class="info-label">English PG Programs:</span>
                    <span class="info-value">${university.additional_info.english_pg_programs.slice(0, 3).join(', ')}${university.additional_info.english_pg_programs.length > 3 ? '...' : ''}</span>
                </div>
                ` : ''}
                
                ${university.additional_info.provincial_scholarship ? `
                <div class="info-item">
                    <span class="info-label">Provincial Scholarship:</span>
                    <span class="info-value available">✓ Available</span>
                </div>
                ` : ''}
                
                ${university.additional_info.provincial_amount ? `
                <div class="info-item">
                    <span class="info-label">Provincial Amount:</span>
                    <span class="info-value">${formatWithLineBreaks(university.additional_info.provincial_amount)}</span>
                </div>
                ` : ''}
                
                ${university.additional_info.university_scholarship_types && university.additional_info.university_scholarship_types.length > 0 ? `
                <div class="info-item">
                    <span class="info-label">University Scholarships:</span>
                    <span class="info-value">${university.additional_info.university_scholarship_types.slice(0, 2).map(formatWithLineBreaks).join(', ')}${university.additional_info.university_scholarship_types.length > 2 ? '...' : ''}</span>
                </div>
                ` : ''}
                
                ${university.additional_info.university_amount ? `
                <div class="info-item">
                    <span class="info-label">University Amount:</span>
                    <span class="info-value">${formatWithLineBreaks(university.additional_info.university_amount)}</span>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <!-- Scholarship Information -->
        ${(hasCSCFull || hasCSCPartial || hasConfucius) ? `
        <div class="scholarship-section">
            <h4><i class="fas fa-gift"></i> Scholarship Opportunities</h4>
            <div class="scholarship-details">
                ${hasCSCFull ? `
                <div class="scholarship-item">
                    <span class="scholarship-label">CSC Full:</span>
                    <span class="scholarship-value available">✓ Available</span>
                </div>
                ` : ''}
                ${hasCSCPartial ? `
                <div class="scholarship-item">
                    <span class="scholarship-label">CSC Partial:</span>
                    <span class="scholarship-value available">✓ Available</span>
                </div>
                ` : ''}
                ${hasConfucius ? `
                <div class="scholarship-item">
                    <span class="scholarship-label">Confucius Institute:</span>
                    <span class="scholarship-value available">✓ Available</span>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <div class="university-footer">
            <div class="match-score">
                ${university.matchScore}% Match
            </div>
        </div>
     `;
     
     return card;
}

// 辅助函数：生成匹配状态指示器
function getMatchIndicators(university, userAnswers) {
    const indicators = [];
    
    // 大学类型匹配
    const universityType = userAnswers.step2;
    if (universityType === 'c9' && university.classifications?.c9_league) {
        indicators.push('<span class="match-good">✓ C9 League Match</span>');
    } else if (universityType === '985' && university.classifications?.project_985) {
        indicators.push('<span class="match-good">✓ 985 University Match</span>');
    } else if (universityType === '211' && university.classifications?.project_211) {
        indicators.push('<span class="match-good">✓ 211 University Match</span>');
    } else if (universityType === 'any') {
        indicators.push('<span class="match-good">✓ University Type Match</span>');
    } else {
        indicators.push('<span class="match-warning">⚠ University Type Mismatch</span>');
    }
    
    // 预算匹配
    const budget = userAnswers.step4;
    const degreeLevel = userAnswers.step1;
    let tuition = 0;
    if (degreeLevel === 'undergraduate') {
        tuition = university.tuition_fees?.ug_tuition_low || 30000;
    } else {
        tuition = university.tuition_fees?.pg_tuition_low || 40000;
    }
    const totalCost = tuition + 12000; // 学费 + 生活费
    
    if (budget === 'low' && totalCost <= 45000) {
        indicators.push('<span class="match-good">✓ Budget Suitable</span>');
    } else if (budget === 'medium' && totalCost <= 90000) {
        indicators.push('<span class="match-good">✓ Budget Suitable</span>');
    } else if (budget === 'high') {
        indicators.push('<span class="match-good">✓ Budget Suitable</span>');
    } else {
        indicators.push('<span class="match-warning">⚠ Budget High</span>');
    }
    
    // 语言匹配
    const languagePreference = userAnswers.step3;
    if (languagePreference === 'chinese') {
        const languageLevel = userAnswers.step3a;
        const userHSKLevel = parseInt(languageLevel.replace('hsk', ''));
        const requiredHSKLevel = university.admission_requirements?.hsk_min_level || 3;
        if (userHSKLevel >= requiredHSKLevel) {
            indicators.push('<span class="match-good">✓ Language Requirements Met</span>');
        } else {
            indicators.push('<span class="match-warning">⚠ Language Requirements High</span>');
        }
    } else {
        indicators.push('<span class="match-good">✓ Language Requirements Met</span>');
    }
    
    return indicators.join('');
}

// 辅助函数：获取语言要求
function getLanguageRequirement(university, userAnswers) {
    const languagePreference = userAnswers.step3;
    if (languagePreference === 'chinese') {
        const hskLevel = university.admission_requirements?.hsk_min_level || 3;
        return `HSK ${hskLevel}`;
    } else {
        const toefl = university.admission_requirements?.english_toefl_min || 70;
        const ielts = university.admission_requirements?.english_ielts_min || 5.0;
        return `TOEFL ${toefl}+ / IELTS ${ielts}+`;
    }
}

// 辅助函数：获取申请难度
function getDifficultyLevel(university) {
    const ranking = university.globalRanking;
    if (ranking <= 50) return 'Very High';
    else if (ranking <= 100) return 'High';
    else if (ranking <= 200) return 'Moderate';
    else if (ranking <= 500) return 'Medium';
    else return 'Low';
}



// 辅助函数：获取Additional Information
function getAdditionalInfo(university) {
    const info = [];
    
    // 1. 特殊项目
    if (university.programs?.mbbs_program) {
        info.push('MBBS Program');
    }
    if (university.programs?.foundation_program) {
        info.push('Foundation Program');
    }
    if (university.programs?.exchange_programs) {
        info.push('Exchange Programs');
    }
    if (university.programs?.chinese_programs) {
        info.push('Chinese Programs');
    }
    
    // 2. 大学分类
    if (university.classifications?.double_first_class) {
        info.push('Double First-Class');
    }
    
    // 3. 城市等级
    if (university.city_tier) {
        const cityTier = university.city_tier.replace('Tier_', 'T');
        info.push(`${cityTier} City`);
    }
    
    // 4. 大学类型
    if (university.university_type) {
        info.push(university.university_type);
    }
    
    // 5. 录取难度
    if (university.admission_requirements?.admission_difficulty) {
        const difficulty = university.admission_requirements.admission_difficulty;
        if (difficulty >= 4) {
            info.push('Highly Competitive');
        } else if (difficulty >= 3) {
            info.push('Competitive');
        } else {
            info.push('Moderate');
        }
    }
    
    // 6. 是否接受预科
    if (university.admission_requirements?.accept_foundation) {
        info.push('Foundation Accepted');
    }
    
    // 7. 排名信息
    if (university.rankings?.qs_rank_2026) {
        const qsRank = university.rankings.qs_rank_2026;
        if (qsRank <= 50) {
            info.push('Top 50 Global');
        } else if (qsRank <= 100) {
            info.push('Top 100 Global');
        } else if (qsRank <= 200) {
            info.push('Top 200 Global');
        }
    }
    
    // 如果有信息则返回，否则返回默认值
    if (info.length > 0) {
        return info.slice(0, 3).join(', '); // 最多显示3个信息
    } else {
        return 'Standard Programs';
    }
}

// Buy Me a Coffee integration - static HTML button used instead

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

// 美化课程名称的函数
function formatProgramName(programName) {
    if (!programName) return '';
    
    // 将下划线替换为空格，并首字母大写
    return programName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// 新的格式化函数：处理斜杠分隔符，换行并首字母大写
function formatWithLineBreaks(text) {
    if (!text) return '';
    
    // 将斜杠替换为换行符，并处理每个部分的首字母大写
    return text
        .split('/')
        .map(part => {
            // 去除首尾空格
            const trimmed = part.trim();
            // 首字母大写
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        })
        .join('<br>'); // 使用HTML换行标签
}

// Thank you message functions
function showThankYouMessage() {
    alert('Thank you for your support!');
}

function showMainThankYouMessage() {
    alert('Thank you for using our service!');
}

// Setup donation button function
function setupMainDonationButton() {
    // This function is now handled by static HTML
    console.log('Donation button setup completed');
}

// Export functions for global access
window.startQuiz = startQuiz;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.restartQuiz = restartQuiz;
window.showThankYouMessage = showThankYouMessage;
window.showMainThankYouMessage = showMainThankYouMessage;

