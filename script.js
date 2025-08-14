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
    'step7', // English proficiency
    'step8', // GPA range
    'step9'  // Chinese language level
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadUniversities();
    setupEventListeners();
    optimizeFontLoading();
    optimizeImageLoading();
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
        console.log('Loaded universities:', universities.length);
        console.log('Sample university:', universities[0]);
        
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
        // Use the new standardized major structure
        let fields = [];
        
        // Map from the new majors object to fields array
        if (uni.majors) {
            if (uni.majors.engineering) fields.push('engineering');
            if (uni.majors.business) fields.push('business');
            if (uni.majors.medicine) fields.push('medicine');
            if (uni.majors.arts) fields.push('arts');
            if (uni.majors.science) fields.push('science');
            if (uni.majors.social) fields.push('social');
        }
        
        // Override with university-specific mappings for accuracy
        const universityFieldMappings = {
            'University of Science and Technology of China': ['engineering', 'science'], // USTC is primarily STEM
            'Harbin Institute of Technology': ['engineering', 'science'], // HIT is engineering-focused
            'Beijing Institute of Technology': ['engineering', 'science'], // BIT is engineering-focused
            'Huazhong University of Science and Technology': ['engineering', 'science'], // HUST is STEM-focused
            'Tongji University': ['engineering', 'science'], // Tongji is engineering-focused
            'Dalian University of Technology': ['engineering', 'science'], // DUT is engineering-focused
            'South China University of Technology': ['engineering', 'science'], // SCUT is engineering-focused
            'Beijing University of Chemical Technology': ['engineering', 'science'], // BUCT is chemical engineering focused
            'China University of Petroleum': ['engineering', 'science'], // CUP is petroleum engineering focused
            'Beijing University of Posts and Telecommunications': ['engineering', 'science'], // BUPT is telecommunications focused
            'Southeast University': ['engineering', 'science'], // SEU is engineering-focused
            'Tianjin University': ['engineering', 'science'], // Tianjin is engineering-focused
            'Xi\'an Jiaotong University': ['engineering', 'science'], // XJTU is engineering-focused
            'Tsinghua University': ['engineering', 'science', 'business'], // Tsinghua is comprehensive but strong in STEM
            'Peking University': ['arts', 'social', 'science', 'business'], // PKU is strong in liberal arts
            'Fudan University': ['arts', 'social', 'medicine', 'business'], // Fudan is comprehensive
            'Shanghai Jiao Tong University': ['engineering', 'science', 'medicine', 'business'], // SJTU is comprehensive
            'Zhejiang University': ['engineering', 'science', 'medicine', 'business'], // ZJU is comprehensive
            'Nanjing University': ['arts', 'social', 'science'], // Nanjing is strong in humanities
            'Wuhan University': ['arts', 'social', 'medicine', 'engineering'], // Wuhan is comprehensive
            'Sun Yat-sen University': ['arts', 'social', 'medicine', 'business'], // SYSU is comprehensive
            'Beijing Normal University': ['arts', 'social'], // BNU is education/humanities focused
            'Nankai University': ['arts', 'social', 'business'], // Nankai is strong in humanities
            'East China Normal University': ['arts', 'social'], // ECNU is education/humanities focused
            'Jilin University': ['arts', 'social', 'medicine'], // Jilin is comprehensive
            'Lanzhou University': ['science', 'arts'], // Lanzhou is comprehensive
            'Northeast Normal University': ['arts', 'social'], // NENU is education focused
            'Central China Normal University': ['arts', 'social'], // CCNU is education focused
            'Hunan University': ['engineering', 'arts'], // Hunan is comprehensive
            'Beijing Language and Culture University': ['arts', 'social'], // BLCU is language/humanities focused
            'University of International Business and Economics': ['business', 'social'], // UIBE is business focused
            'Beijing University of Aeronautics and Astronautics': ['engineering', 'science'], // BUAA is aerospace focused
            'Northwestern Polytechnical University': ['engineering', 'science'], // NPU is engineering focused
            'Harbin Institute of Technology (Shenzhen)': ['engineering', 'science'], // HIT Shenzhen is engineering focused
            'Beijing Institute of Technology (Zhuhai)': ['engineering', 'science'] // BIT Zhuhai is engineering focused
        };
        
        // Override with university-specific mappings if available
        if (universityFieldMappings[uni.name_en]) {
            fields = universityFieldMappings[uni.name_en];
        }
        
        // Debug logging for field mapping
        console.log(`Processing ${uni.name_en}:`, {
            majors: uni.majors,
            fields: fields
        });
        
        // Early return if no fields found
        if (fields.length === 0) {
            console.warn(`No fields found for ${uni.name_en}, skipping`);
            return null;
        }
        
        // Create programs structure with accurate tuition data
        const programs = {
            undergraduate: {},
            graduate: {}
        };
        
        // Debug logging for all universities
        console.log(`Processing ${uni.name_en}:`, {
            fields: fields,
            key_features: uni.admission?.key_features
        });
        
        // Map tuition costs to programs using actual data
        if (uni.costs) {
            // Assume most universities have English programs (default to true)
            const hasEnglishPrograms = true;
            
            // Undergraduate programs
            if (uni.costs.ug_tuition_liberal_arts) {
                programs.undergraduate.arts = {
                    tuition: uni.costs.ug_tuition_liberal_arts,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
                programs.undergraduate.social = {
                    tuition: uni.costs.ug_tuition_liberal_arts,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
            }
            if (uni.costs.ug_tuition_stem) {
                programs.undergraduate.engineering = {
                    tuition: uni.costs.ug_tuition_stem,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
                programs.undergraduate.science = {
                    tuition: uni.costs.ug_tuition_stem,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
            }
            if (uni.costs.ug_tuition_medicine) {
                programs.undergraduate.medicine = {
                    tuition: uni.costs.ug_tuition_medicine,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
            }
            
            // Graduate programs
            if (uni.costs.pg_tuition_liberal_arts) {
                programs.graduate.arts = {
                    tuition: uni.costs.pg_tuition_liberal_arts,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
                programs.graduate.social = {
                    tuition: uni.costs.pg_tuition_liberal_arts,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
            }
            if (uni.costs.pg_tuition_stem) {
                programs.graduate.engineering = {
                    tuition: uni.costs.pg_tuition_stem,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
                programs.graduate.science = {
                    tuition: uni.costs.pg_tuition_stem,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
            }
            if (uni.costs.pg_tuition_mba) {
                programs.graduate.business = {
                    tuition: uni.costs.pg_tuition_mba,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
            }
            // Add graduate medicine programs if available
            if (uni.costs.pg_tuition_medicine) {
                programs.graduate.medicine = {
                    tuition: uni.costs.pg_tuition_medicine,
                    englishPrograms: hasEnglishPrograms,
                    chineseRequired: false
                };
            }
        }
        
        // Determine city size based on city name and New_Tier_1 status
        let citySize = 'medium';
        
        // New Tier 1 cities (mega cities)
        const newTier1Cities = ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Tianjin', 'Chongqing', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xi\'an', 'Nanjing', 'Zhengzhou', 'Changsha', 'Suzhou', 'Dongguan', 'Qingdao', 'Shenyang', 'Ningbo', 'Kunming'];
        
        if (newTier1Cities.includes(uni.city)) {
            // Further categorize New Tier 1 cities
            if (uni.city === 'Beijing' || uni.city === 'Shanghai' || uni.city === 'Guangzhou' || uni.city === 'Shenzhen') {
                citySize = 'mega'; // Super mega cities
            } else {
                citySize = 'large'; // Other New Tier 1 cities
            }
        } else if (uni.city === 'Harbin' || uni.city === 'Dalian' || uni.city === 'Jinan' || uni.city === 'Xiamen' || uni.city === 'Fuzhou' || uni.city === 'Hefei' || uni.city === 'Nanchang' || uni.city === 'Shijiazhuang' || uni.city === 'Taiyuan' || uni.city === 'Guiyang' || uni.city === 'Lanzhou' || uni.city === 'Xining' || uni.city === 'Yinchuan' || uni.city === 'Urumqi' || uni.city === 'Hohhot' || uni.city === 'Nanning' || uni.city === 'Haikou' || uni.city === 'Lhasa') {
            citySize = 'medium'; // Tier 2 cities
        } else {
            citySize = 'small'; // Smaller cities
        }
        
        // Get global ranking - use hardcoded rankings since admission data is missing
        let globalRanking = 1000; // Default fallback
        
        // Use actual ranking data from admission section if available
        if (uni.admission?.qs_rank_2025) {
            globalRanking = uni.admission.qs_rank_2025;
        } else if (uni.admission?.the_rank_2025) {
            globalRanking = uni.admission.the_rank_2025;
        } else {
            // Use hardcoded rankings since admission data is missing
            const universityRankings = {
                'Tsinghua University': 15,
                'Peking University': 18,
                'Fudan University': 34,
                'Shanghai Jiao Tong University': 47,
                'Zhejiang University': 42,
                'Nanjing University': 123,
                'University of Science and Technology of China': 138,
                'Wuhan University': 194,
                'Sun Yat-sen University': 267,
                'Tongji University': 211,
                'Harbin Institute of Technology': 256,
                'Xi\'an Jiaotong University': 290,
                'Beijing Normal University': 270,
                'Nankai University': 358,
                'Tianjin University': 334,
                'Southeast University': 465,
                'Dalian University of Technology': 521,
                'Beijing Institute of Technology': 436,
                'Huazhong University of Science and Technology': 396,
                'East China Normal University': 531,
                'Jilin University': 601,
                'Lanzhou University': 751,
                'Northeast Normal University': 801,
                'Central China Normal University': 851,
                'Hunan University': 801,
                'South China University of Technology': 801,
                'Beijing University of Chemical Technology': 901,
                'China University of Petroleum': 901,
                'Beijing University of Posts and Telecommunications': 901,
                'Beijing Language and Culture University': 801,
                'University of International Business and Economics': 801,
                'Beijing University of Aeronautics and Astronautics': 801,
                'Northwestern Polytechnical University': 801,
                'Harbin Institute of Technology (Shenzhen)': 256, // Same as main HIT
                'Beijing Institute of Technology (Zhuhai)': 436 // Same as main BIT
            };
            
            if (universityRankings[uni.name_en]) {
                globalRanking = universityRankings[uni.name_en];
            }
        }
        
        // Calculate acceptance rate based on admission difficulty or ranking
        let acceptanceRate = 0.3; // Default 30%
        
        if (uni.admission?.admission_difficulty_1to5) {
            const difficulty = uni.admission.admission_difficulty_1to5;
            if (difficulty === 5) acceptanceRate = 0.05; // 5%
            else if (difficulty === 4) acceptanceRate = 0.10; // 10%
            else if (difficulty === 3) acceptanceRate = 0.20; // 20%
            else if (difficulty === 2) acceptanceRate = 0.35; // 35%
            else if (difficulty === 1) acceptanceRate = 0.50; // 50%
        } else {
            // Fallback to ranking-based calculation
            if (globalRanking <= 50) acceptanceRate = 0.05; // Top 50: 5%
            else if (globalRanking <= 100) acceptanceRate = 0.08; // Top 100: 8%
            else if (globalRanking <= 200) acceptanceRate = 0.12; // Top 200: 12%
            else if (globalRanking <= 500) acceptanceRate = 0.20; // Top 500: 20%
            else if (globalRanking <= 1000) acceptanceRate = 0.35; // Top 1000: 35%
            else acceptanceRate = 0.50; // Others: 50%
        }
        
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
            originalPrograms: [], // Empty array since programs field is missing
            // Add enhanced data
            scholarshipData: uni.scholarships,
            additionalData: uni.additional_info
        };
    });
    
    // Filter out null values and return
    const filtered = transformed.filter(uni => uni !== null);
    console.log('Transformed universities:', filtered.length);
    return filtered;
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
    
    // Enable next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

// Next step
function nextStep() {
    console.log('Next step called. Current step:', currentStep, 'Total steps:', quizSteps.length);
    if (currentStep < quizSteps.length - 1) {
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
    
    // Update progress bar
    updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
        // Calculate progress percentage (excluding welcome screen)
        const totalSteps = quizSteps.length - 1; // Exclude welcome
        const currentProgress = Math.max(0, currentStep - 1); // Start from step 1
        const percentage = (currentProgress / totalSteps) * 100;
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `Step ${currentStep} of ${quizSteps.length - 1}`;
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
        matchedUniversities = generateMatches(userAnswers);
        console.log('Generated matches:', matchedUniversities.length);
        
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
    
    // Check if all required answers are present
    const requiredSteps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8', 'step9'];
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
        
        // Calculate user GPA value once for reuse
        const userGPA = userAnswers.step8;
        console.log('User GPA from step8:', userGPA);
        if (!userGPA) {
            console.error('GPA not found in userAnswers.step8');
            continue; // Skip this university if GPA is missing
        }
        const gpaRange = userGPA.split('-').map(Number);
        const userGPAValue = (gpaRange[0] + gpaRange[1]) / 2;
        console.log('Calculated GPA value:', userGPAValue);
        
        // Debug: Log university being processed
        console.log(`Processing university ${i + 1}/${universities.length}: ${university.name}`);
        
        // Field of study match (20 points)
        console.log(`Checking field match for ${university.name}: looking for "${userAnswers.step1}" in fields:`, university.fields);
        if (university.fields.includes(userAnswers.step1)) {
            let fieldScore = 20;
            
            // Penalty for overly comprehensive universities (having too many fields)
            if (university.fields.length >= 5) {
                fieldScore = Math.round(fieldScore * 0.8); // 20% penalty for having 5+ fields
            } else if (university.fields.length >= 4) {
                fieldScore = Math.round(fieldScore * 0.9); // 10% penalty for having 4 fields
            }
            
            score += fieldScore;
            console.log(`✓ Field match for ${university.name}: ${userAnswers.step1} found in ${university.fields}, score: ${fieldScore}`);
        } else {
            console.log(`✗ No field match for ${university.name}: ${userAnswers.step1} not found in ${university.fields}`);
        }
        
        // Academic level compatibility (12 points)
        const academicLevel = userAnswers.step2;
        const hasPrograms = university.programs[academicLevel] && 
                          university.programs[academicLevel][userAnswers.step1];
        
        // Check if university has programs for the selected field
        const hasFieldPrograms = university.fields.includes(userAnswers.step1);
        if (hasPrograms || hasFieldPrograms) {
            score += 12;
        }
        
        // Budget compatibility (18 points)
        const budget = userAnswers.step3;
        let tuition = 0;
        
        // Try to get tuition from specific program first
        if (hasPrograms && university.programs[academicLevel][userAnswers.step1]) {
            tuition = university.programs[academicLevel][userAnswers.step1].tuition || 0;
        } else {
            // Fallback to general tuition data based on field
            if (university.costsData) {
                if (academicLevel === 'undergraduate') {
                    if (userAnswers.step1 === 'engineering' || userAnswers.step1 === 'science') {
                        tuition = university.costsData.ug_tuition_stem || 0;
                    } else if (userAnswers.step1 === 'medicine') {
                        tuition = university.costsData.ug_tuition_medicine || 0;
                    } else {
                        tuition = university.costsData.ug_tuition_liberal_arts || 0;
                    }
                } else if (academicLevel === 'graduate') {
                    if (userAnswers.step1 === 'business') {
                        tuition = university.costsData.pg_tuition_mba || 0;
                    } else if (userAnswers.step1 === 'engineering' || userAnswers.step1 === 'science') {
                        tuition = university.costsData.pg_tuition_stem || 0;
                    } else {
                        tuition = university.costsData.pg_tuition_liberal_arts || 0;
                    }
                }
            }
        }
        
        // More realistic budget scoring with penalties for mismatches
        // Add ranking-based adjustment for top universities
        let budgetMultiplier = 1.0;
        if (university.globalRanking <= 50) {
            budgetMultiplier = 0.7; // Top 50 universities get reduced budget points
        } else if (university.globalRanking <= 100) {
            budgetMultiplier = 0.8; // Top 100 universities get reduced budget points
        }
        
        if (budget === 'low') {
            if (tuition <= 5000) score += Math.round(18 * budgetMultiplier); // Perfect match
            else if (tuition <= 7000) score += Math.round(9 * budgetMultiplier); // Acceptable
            else if (tuition <= 10000) score += Math.round(2 * budgetMultiplier); // Poor match
            else score += 0; // No points for expensive universities
        } else if (budget === 'medium') {
            if (tuition <= 10000) score += Math.round(18 * budgetMultiplier); // Perfect match
            else if (tuition <= 15000) score += Math.round(11 * budgetMultiplier); // Good match
            else if (tuition <= 20000) score += Math.round(4 * budgetMultiplier); // Acceptable
            else score += 0; // Too expensive
        } else if (budget === 'high') {
            if (tuition > 10000) score += Math.round(18 * budgetMultiplier); // Perfect for high budget
            else if (tuition > 7000) score += Math.round(13 * budgetMultiplier); // Good value
            else score += Math.round(8 * budgetMultiplier); // Lower cost but still good
        }
        
        // City size preference (12 points)
        if (university.citySize === userAnswers.step4) {
            score += 12;
        } else if ((userAnswers.step4 === 'mega' && university.citySize === 'large') ||
                   (userAnswers.step4 === 'large' && university.citySize === 'medium')) {
            score += 8;
        }
        
        // Ranking importance (12 points) - More realistic scoring
        const rankingPref = userAnswers.step5;
        
        // Only give high ranking points if applicant has realistic qualifications
        if (rankingPref === 'very') {
            if (university.globalRanking <= 100) {
                // For top 100 universities, require high GPA
                if (userGPAValue >= 3.5) score += 12;
                else if (userGPAValue >= 3.3) score += 8;
                else if (userGPAValue >= 3.0) score += 4;
                else score += 0; // No points for unrealistic matches
            } else if (university.globalRanking <= 200) {
                if (userGPAValue >= 3.3) score += 10;
                else if (userGPAValue >= 3.0) score += 6;
                else score += 2;
            } else if (university.globalRanking <= 500) {
                if (userGPAValue >= 3.0) score += 8;
                else score += 4;
            }
        } else if (rankingPref === 'important') {
            if (university.globalRanking <= 500) {
                if (userGPAValue >= 3.0) score += 10;
                else score += 5;
            } else if (university.globalRanking <= 1000) {
                score += 6;
            }
        } else if (rankingPref === 'moderate') {
            // For moderate ranking preference, give balanced scores
            if (university.globalRanking <= 1000) score += 6;
            else score += 8; // Higher score for lower-ranked universities
        }
        
        // English programs and proficiency (12 points)
        const englishPref = userAnswers.step6;
        const englishLevel = userAnswers.step7;
        
        // Check if university has English programs
        const hasEnglishPrograms = university.originalPrograms ? 
            university.originalPrograms.some(p => p.toLowerCase().includes('english')) : true; // Default to true if no data
        
        // English program availability scoring (8 points)
        if (hasPrograms) {
            const program = university.programs[academicLevel][userAnswers.step1];
            
            if (englishPref === 'yes' && program.englishPrograms) score += 8;
            else if (englishPref === 'both') score += 8;
            else if (englishPref === 'chinese' && !program.englishPrograms) score += 8;
            else if (englishPref === 'yes' && !program.englishPrograms) score -= 4;
        } else if (hasFieldPrograms) {
            // If we have field match but no specific program, use general English program availability
            if (englishPref === 'yes' && hasEnglishPrograms) score += 8;
            else if (englishPref === 'both') score += 8;
            else if (englishPref === 'chinese' && !hasEnglishPrograms) score += 8;
            else if (englishPref === 'yes' && !hasEnglishPrograms) score -= 4;
        }
        
        // English proficiency scoring (5 points)
        if (englishPref === 'yes' || englishPref === 'both') {
            if (englishLevel === 'native') score += 5;
            else if (englishLevel === 'advanced') score += 4;
            else if (englishLevel === 'intermediate') score += 3;
            else if (englishLevel === 'basic') score += 1;
        }
        
        // GPA compatibility (10 points)
        const requiredGPA = academicLevel === 'undergraduate' ? 
            university.admissionData?.ug_min_gpa : university.admissionData?.pg_min_gpa;
        
        if (requiredGPA) {
            if (userGPAValue >= requiredGPA) {
                score += 10; // Perfect match
            } else if (userGPAValue >= requiredGPA - 0.3) {
                score += 7; // Close match
            } else if (userGPAValue >= requiredGPA - 0.5) {
                score += 4; // Acceptable match
            } else {
                score += 1; // Poor match
            }
        } else {
            // Default GPA requirements based on university ranking
            let defaultGPA = 3.0;
            if (university.globalRanking <= 100) defaultGPA = 3.5;
            else if (university.globalRanking <= 500) defaultGPA = 3.3;
            
            if (userGPAValue >= defaultGPA) {
                score += 8; // Good match with default
            } else if (userGPAValue >= defaultGPA - 0.3) {
                score += 5; // Acceptable match
            } else {
                score += 2; // Poor match
            }
        }
        
        // Chinese language requirement (10 points) - More realistic for international students
        const chineseLevel = userAnswers.step9;
        
        // Check if university has Chinese programs
        const hasChinesePrograms = university.originalPrograms ? 
            university.originalPrograms.some(p => p.toLowerCase().includes('chinese')) : false; // Default to false if no data
        
        // For English-taught programs, Chinese is usually not required
        if (englishPref === 'yes') {
            // If student wants English programs, Chinese is not required
            score += 10; // Full points for English programs
        } else if (englishPref === 'both') {
            // If student is flexible, give points based on Chinese level
            if (chineseLevel === 'advanced') score += 10;
            else if (chineseLevel === 'intermediate') score += 8;
            else if (chineseLevel === 'basic') score += 5;
            else score += 3; // Even with no Chinese, some flexibility
        } else if (englishPref === 'chinese') {
            // If student wants Chinese programs, Chinese level matters
            if (hasChinesePrograms && chineseLevel !== 'none') {
                if (chineseLevel === 'advanced') score += 10;
                else if (chineseLevel === 'intermediate') score += 8;
                else if (chineseLevel === 'basic') score += 5;
            } else if (!hasChinesePrograms) {
                score += 10; // No Chinese required
            }
        }
        
        // Realistic chance assessment - penalize unrealistic matches
        let realisticBonus = 0;
        let unrealisticPenalty = 0;
        
        // Check if this is a realistic match based on GPA and university ranking
        if (university.globalRanking <= 50) {
            // Top 50 universities require very high qualifications
            if (userGPAValue < 3.5) {
                unrealisticPenalty = 25; // Major penalty for low GPA at top universities
            } else if (userGPAValue < 3.7) {
                unrealisticPenalty = 15; // Significant penalty for borderline GPA
            } else if (userGPAValue >= 3.8) {
                realisticBonus = 5; // Bonus for very well-qualified applicants
            }
        } else if (university.globalRanking <= 100) {
            // Top 100 universities require high qualifications
            if (userGPAValue < 3.3) {
                unrealisticPenalty = 20; // Significant penalty for low GPA at top universities
            } else if (userGPAValue < 3.5) {
                unrealisticPenalty = 10; // Small penalty for borderline GPA
            } else if (userGPAValue >= 3.7) {
                realisticBonus = 3; // Bonus for well-qualified applicants
            }
        } else if (university.globalRanking <= 500) {
            // Top 500 universities require good qualifications
            if (userGPAValue < 3.0) {
                unrealisticPenalty = 15;
            } else if (userGPAValue >= 3.3) {
                realisticBonus = 2;
            }
        }
        
        // Apply realistic assessment
        score += realisticBonus - unrealisticPenalty;
        
        // Normalize score to 0-100
        score = Math.max(0, Math.min(100, score));
        
        console.log(`${university.name} score: ${score}`);
        
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
                fieldMatch: university.fields.includes(userAnswers.step1) ? 20 : 0,
                academicLevel: 12, // Assuming it has programs
                budget: 'calculated above',
                citySize: university.citySize === userAnswers.step4 ? 12 : 8,
                ranking: 'calculated above',
                english: 'calculated above',
                gpa: 'calculated above',
                chinese: 'calculated above',
                realisticBonus,
                unrealisticPenalty
            });
            console.log('Final score:', score);
            console.log('=== END DEBUG ===');
        }
        
        if (score > 15) { // Higher threshold for better quality matches
            matches.push({
                ...university,
                matchScore: score
            });
        }
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
    const resultsGrid = document.getElementById('resultsGrid');
    console.log('Results grid element:', resultsGrid);
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
        
        // Add about section
        const donationCard = document.createElement('div');
        donationCard.className = 'university-card donation-section';
        donationCard.innerHTML = `
            <div class="donation-content">
                <i class="fas fa-heart"></i>
                <h3>About This Tool</h3>
                <p>This free tool helps international students find their perfect Chinese university match through our comprehensive database and smart matching algorithm.</p>
                <div id="donation-button-container"></div>
        </div>
    `;
    resultsGrid.appendChild(donationCard);
    }
    console.log('Results display completed');
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
     
     // Get application dates
     const applicationDeadline = university.admissionData?.application_deadline;
     const applicationStartDate = university.admissionData?.application_start_date;
     
     // Format application deadline for better readability
     const formatDeadline = (deadline) => {
         if (!deadline) return 'TBD';
         // Convert "Mar_31" to "March 31"
         const monthMap = {
             'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
             'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
             'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
         };
         const parts = deadline.split('_');
         if (parts.length === 2) {
             const month = monthMap[parts[0]] || parts[0];
             return `${month} ${parts[1]}`;
         }
         return deadline;
     };
     
     // Get English requirements (with defaults based on university type)
     const englishRequirement = university.admissionData?.english_requirement;
     const ieltsRequirement = university.admissionData?.ielts_requirement;
     const toeflRequirement = university.admissionData?.toefl_requirement;
     
     // Set default English requirements based on university ranking and type
     let defaultEnglishReq = '';
     if (university.globalRanking <= 100) {
         defaultEnglishReq = 'IELTS 6.5+ / TOEFL 90+';
     } else if (university.globalRanking <= 500) {
         defaultEnglishReq = 'IELTS 6.0+ / TOEFL 80+';
     } else {
         defaultEnglishReq = 'IELTS 5.5+ / TOEFL 70+';
     }
    
    // Get scholarship information
    const scholarshipData = university.scholarshipData;
    const additionalData = university.additionalData;
    
    card.innerHTML = `
        <div class="university-header">
            <div class="university-logo">${university.abbreviation}</div>
            <div class="university-info">
                <h3 class="university-name" title="${university.name}">${rank}. ${university.name}</h3>
                <p class="university-meta">${university.city} • Global Rank #${university.globalRanking}</p>
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
             
             <!-- English Requirements -->
             <div class="detail-item">
                 <i class="fas fa-globe"></i>
                 <span>English: ${englishRequirement || ieltsRequirement || toeflRequirement ? 
                     `${englishRequirement || ''}${ieltsRequirement ? ` IELTS ${ieltsRequirement}` : ''}${toeflRequirement ? ` TOEFL ${toeflRequirement}` : ''}` : 
                     defaultEnglishReq}</span>
             </div>
             
             <!-- Application Dates -->
             <div class="detail-item">
                 <i class="fas fa-calendar-alt"></i>
                 <span>Application: ${applicationStartDate ? `${applicationStartDate} - ` : ''}${formatDeadline(applicationDeadline)}</span>
             </div>
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
            <h4><i class="fas fa-info-circle"></i> Campus & Student Life</h4>
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
                    <span class="additional-value campus-rating">${'★'.repeat(additionalData.campus_rating_1to5)}${'☆'.repeat(5-additionalData.campus_rating_1to5)}</span>
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
        
                 <div class="university-footer">
             ${university.website ? `
             <div class="website-link">
                 <a href="https://${university.website}" target="_blank" class="btn btn-outline">
                     <i class="fas fa-external-link-alt"></i>
                     Visit Official Website
                 </a>
             </div>
             ` : ''}
             <div class="match-score">
                 ${university.matchScore}% Match
             </div>
         </div>
     `;
     
     return card;
}

// Setup PayPal donation integration
function setupPayPal() {
    // Check if PayPal SDK is loaded
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
        // Show loading state and load PayPal on demand
        const container = document.getElementById('donation-button-container');
        container.innerHTML = `
            <button class="btn btn-primary" onclick="loadPayPalOnDemand()">
                <svg class="icon icon-sm"><use href="#icon-heart"></use></svg>
                Support This Project
            </button>
        `;
    }
}

// Load PayPal SDK on demand
function loadPayPalOnDemand() {
    const container = document.getElementById('donation-button-container');
    container.innerHTML = `
        <div class="loading-paypal">
            <div class="spinner"></div>
            <span>Loading payment options...</span>
        </div>
    `;
    
    // Load PayPal SDK dynamically
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=ATXfI5E_I4zpr7KqfZhqyPwLguEnXAqpFBGohws4VdqKWTZRDW0bUdkUbG6EKGMHHNipkb1nQyGSP9D1&currency=USD';
    script.onload = function() {
        setupPayPal();
    };
    script.onerror = function() {
        container.innerHTML = `
            <button class="btn btn-primary" onclick="showThankYouMessage()">
                <svg class="icon icon-sm"><use href="#icon-heart"></use></svg>
                Learn More About This Tool
            </button>
        `;
    };
    document.head.appendChild(script);
}

// Show thank you message (after donation)
function showThankYouMessage() {
    const donationContainer = document.getElementById('donation-button-container');
    if (donationContainer) {
        donationContainer.innerHTML = `
            <div class="thank-you-message">
                <i class="fas fa-check-circle"></i>
                <h4>Thank You for Using Our Tool!</h4>
                <p>We hope this tool helps you find your perfect Chinese university match.</p>
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
        // Show loading state and load PayPal on demand
        const container = document.getElementById('donation-button-container-main');
        container.innerHTML = `
            <button class="btn btn-primary" onclick="loadMainPayPalOnDemand()">
                <svg class="icon icon-sm"><use href="#icon-heart"></use></svg>
                Support This Project
            </button>
        `;
    }
}

// Load PayPal SDK on demand for main donation button
function loadMainPayPalOnDemand() {
    const container = document.getElementById('donation-button-container-main');
    container.innerHTML = `
        <div class="loading-paypal">
            <div class="spinner"></div>
            <span>Loading payment options...</span>
        </div>
    `;
    
    // Load PayPal SDK dynamically
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=ATXfI5E_I4zpr7KqfZhqyPwLguEnXAqpFBGohws4VdqKWTZRDW0bUdkUbG6EKGMHHNipkb1nQyGSP9D1&currency=USD';
    script.onload = function() {
        setupMainDonationButton();
    };
    script.onerror = function() {
        container.innerHTML = `
            <button class="btn btn-primary" onclick="showMainThankYouMessage()">
                <svg class="icon icon-sm"><use href="#icon-heart"></use></svg>
                Learn More About This Tool
            </button>
        `;
    };
    document.head.appendChild(script);
}

// Show thank you message for main donation
function showMainThankYouMessage() {
    const donationContainer = document.getElementById('donation-button-container-main');
    if (donationContainer) {
        donationContainer.innerHTML = `
            <div class="thank-you-message">
                <i class="fas fa-check-circle"></i>
                <h4>Thank You for Using Our Tool!</h4>
                <p>We hope this tool helps you find your perfect Chinese university match.</p>
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

