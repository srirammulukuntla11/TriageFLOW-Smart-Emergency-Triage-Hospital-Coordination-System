// Ambulance crew functionality - For reference (main logic is now in index.html)
// This file can be used if you want to separate ambulance functionality

document.addEventListener('DOMContentLoaded', function() {
    // Set up form submission
    document.getElementById('patient-form').addEventListener('submit', handlePatientSubmission);
});

function handlePatientSubmission(e) {
    e.preventDefault();
    
    // Get vital signs values
    const vitalSigns = {
        id: generatePatientId(),
        heartRate: parseInt(document.getElementById('heart-rate').value),
        systolicBP: parseInt(document.getElementById('blood-pressure-systolic').value),
        diastolicBP: parseInt(document.getElementById('blood-pressure-diastolic').value),
        respiratoryRate: parseInt(document.getElementById('respiratory-rate').value),
        oxygenSaturation: parseInt(document.getElementById('oxygen-saturation').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        gcs: parseInt(document.getElementById('gcs').value),
        bloodGlucose: parseInt(document.getElementById('blood-glucose').value),
        chiefComplaint: document.getElementById('chief-complaint').value,
        symptoms: document.getElementById('symptoms').value,
        arrivalTime: new Date().toLocaleString()
    };
    
    // Calculate patient priority based on vital signs
    vitalSigns.priority = calculatePriority(vitalSigns);
    
    // Add to patients array (assuming global patients array)
    if (typeof window.patients !== 'undefined') {
        window.patients.push(vitalSigns);
        
        // Save to localStorage
        if (typeof savePatientData === 'function') {
            savePatientData();
        }
        
        // Determine required hospital capabilities based on vital signs and symptoms
        const requiredCapabilities = determineRequiredCapabilities(vitalSigns);
        
        // Find matching hospitals
        const matchingHospitals = findMatchingHospitals(requiredCapabilities, vitalSigns.priority);
        
        // Display results
        displayHospitalResults(matchingHospitals, vitalSigns.priority);
        
        // Show results section
        document.getElementById('hospital-results').style.display = 'block';
        
        // Scroll to results
        document.getElementById('hospital-results').scrollIntoView({ behavior: 'smooth' });
        
        // Reset form
        document.getElementById('patient-form').reset();
    } else {
        console.error('Patients array not found');
    }
}

// Generate unique patient ID
function generatePatientId() {
    return 'P' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Calculate patient priority based on vital signs
function calculatePriority(vitalSigns) {
    let score = 0;
    
    // Heart rate scoring
    if (vitalSigns.heartRate < 50 || vitalSigns.heartRate > 120) score += 2;
    else if (vitalSigns.heartRate < 60 || vitalSigns.heartRate > 100) score += 1;
    
    // Blood pressure scoring
    if (vitalSigns.systolicBP < 90 || vitalSigns.systolicBP > 180) score += 2;
    else if (vitalSigns.systolicBP < 100 || vitalSigns.systolicBP > 160) score += 1;
    
    if (vitalSigns.diastolicBP < 60 || vitalSigns.diastolicBP > 110) score += 2;
    else if (vitalSigns.diastolicBP < 70 || vitalSigns.diastolicBP > 100) score += 1;
    
    // Respiratory rate scoring
    if (vitalSigns.respiratoryRate < 12 || vitalSigns.respiratoryRate > 24) score += 2;
    else if (vitalSigns.respiratoryRate < 14 || vitalSigns.respiratoryRate > 20) score += 1;
    
    // Oxygen saturation scoring
    if (vitalSigns.oxygenSaturation < 92) score += 3;
    else if (vitalSigns.oxygenSaturation < 95) score += 1;
    
    // GCS scoring
    if (vitalSigns.gcs < 9) score += 3;
    else if (vitalSigns.gcs < 13) score += 2;
    else if (vitalSigns.gcs < 15) score += 1;
    
    // Blood glucose scoring
    if (vitalSigns.bloodGlucose < 70 || vitalSigns.bloodGlucose > 180) score += 1;
    if (vitalSigns.bloodGlucose < 50 || vitalSigns.bloodGlucose > 250) score += 2;
    
    // Determine priority based on total score
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
}

// Determine required hospital capabilities based on vital signs and symptoms
function determineRequiredCapabilities(vitalSigns) {
    const capabilities = [];
    
    // Based on vital signs abnormalities
    if (vitalSigns.heartRate < 50 || vitalSigns.heartRate > 120 || 
        vitalSigns.systolicBP < 90 || vitalSigns.systolicBP > 180) {
        capabilities.push('cardiology');
    }
    
    if (vitalSigns.respiratoryRate < 12 || vitalSigns.respiratoryRate > 24 || 
        vitalSigns.oxygenSaturation < 92) {
        capabilities.push('respiratory-care');
    }
    
    if (vitalSigns.gcs < 13) {
        capabilities.push('neurology');
    }
    
    if (vitalSigns.bloodGlucose < 50 || vitalSigns.bloodGlucose > 250) {
        capabilities.push('endocrine');
    }
    
    // Based on symptoms mentioned
    if (vitalSigns.symptoms) {
        const symptoms = vitalSigns.symptoms.toLowerCase();
        
        if (symptoms.includes('chest pain') || symptoms.includes('heart')) {
            capabilities.push('cardiology', 'cardiac-surgery');
        }
        
        if (symptoms.includes('stroke') || symptoms.includes('paralysis') || 
            symptoms.includes('numbness')) {
            capabilities.push('neurology', 'stroke-center');
        }
        
        if (symptoms.includes('trauma') || symptoms.includes('accident') || 
            symptoms.includes('fracture')) {
            capabilities.push('trauma-center', 'orthopedic-surgery');
        }
    }
    
    // Always include emergency capability
    capabilities.push('emergency');
    
    return [...new Set(capabilities)]; // Remove duplicates
}

// Find hospitals that match patient requirements
function findMatchingHospitals(requiredCapabilities, priority) {
    // This function requires the hospitals array to be defined
    if (typeof window.hospitals === 'undefined') {
        console.error('Hospitals array not found');
        return [];
    }
    
    // Reset match scores
    window.hospitals.forEach(hospital => hospital.matchScore = 0);
    
    // Calculate match scores for each hospital
    window.hospitals.forEach(hospital => {
        // Score based on matching capabilities
        requiredCapabilities.forEach(capability => {
            if (hospital.capabilities.includes(capability)) {
                hospital.matchScore += 3; // High score for matching capability
            }
        });
        
        // Adjust score based on priority and bed availability
        if (priority === 'high') {
            if (hospital.bedAvailability === 'High') hospital.matchScore += 5;
            else if (hospital.bedAvailability === 'Medium') hospital.matchScore += 3;
            else hospital.matchScore += 1;
        } else if (priority === 'medium') {
            if (hospital.bedAvailability === 'High') hospital.matchScore += 3;
            else if (hospital.bedAvailability === 'Medium') hospital.matchScore += 2;
        } else {
            if (hospital.bedAvailability === 'High') hospital.matchScore += 2;
        }
        
        // Bonus for hospitals with ICU capability for high priority patients
        if (priority === 'high' && hospital.capabilities.includes('icu')) {
            hospital.matchScore += 3;
        }
    });
    
    // Filter hospitals with at least some match
    const matchingHospitals = window.hospitals.filter(h => h.matchScore > 0);
    
    // Sort by match score (descending) and distance (ascending)
    matchingHospitals.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
        }
        // If scores are equal, sort by distance (convert to number for comparison)
        return parseFloat(a.distance) - parseFloat(b.distance);
    });
    
    return matchingHospitals;
}

// Display hospital results
function displayHospitalResults(hospitals, priority) {
    const hospitalList = document.getElementById('hospital-list');
    const hospitalOptions = document.getElementById('hospital-options');
    const hospitalSelection = document.getElementById('hospital-selection');
    const confirmationMessage = document.getElementById('confirmation-message');
    
    hospitalList.innerHTML = '';
    hospitalOptions.innerHTML = '';
    hospitalSelection.style.display = 'none';
    confirmationMessage.style.display = 'none';
    
    if (hospitals.length === 0) {
        hospitalList.innerHTML = `
            <div class="no-results">
                <p>No hospitals match the patient's requirements.</p>
                <p>Please try the nearest general hospital: City General Hospital (2.3 miles)</p>
            </div>
        `;
        return;
    }
    
    // Display priority badge
    const priorityText = document.createElement('p');
    priorityText.innerHTML = `Patient Priority: <span class="priority-badge priority-${priority}">${priority.toUpperCase()} PRIORITY</span>`;
    hospitalList.appendChild(priorityText);
    
    hospitals.forEach((hospital, index) => {
        const hospitalCard = document.createElement('div');
        hospitalCard.className = 'hospital-card';
        
        // Calculate match percentage (for display purposes)
        const maxPossibleScore = 30; // Approximate maximum score
        const matchPercentage = Math.min(Math.round((hospital.matchScore / maxPossibleScore) * 100), 100);
        
        hospitalCard.innerHTML = `
            <div class="hospital-info">
                <h3>${hospital.name}</h3>
                <p>Distance: ${hospital.distance} • Wait time: ${hospital.waitTime} • Beds: ${hospital.bedAvailability}</p>
                <div class="hospital-features">
                    ${hospital.capabilities.map(capability => 
                        `<span class="feature-tag">${formatCapability(capability)}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="hospital-match">
                <span class="match-score">${matchPercentage}% Match</span>
            </div>
        `;
        
        hospitalList.appendChild(hospitalCard);
        
        // Add to selection options
        const hospitalOption = document.createElement('div');
        hospitalOption.className = 'hospital-option';
        
        hospitalOption.innerHTML = `
            <label>
                <input type="radio" name="selected-hospital" value="${hospital.id}" data-name="${hospital.name}" ${index === 0 ? 'checked' : ''}>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div>
                        <strong>${hospital.name}</strong>
                        <div style="font-size: 14px; color: #666;">
                            Distance: ${hospital.distance} • Wait: ${hospital.waitTime} • Match: ${matchPercentage}%
                        </div>
                    </div>
                </div>
            </label>
        `;
        
        hospitalOptions.appendChild(hospitalOption);
    });
    
    // Show selection section
    hospitalSelection.style.display = 'block';
}

// Format capability for display
function formatCapability(capability) {
    const capabilityMap = {
        'icu': 'ICU',
        'surgery': 'Surgery',
        'cardiology': 'Cardiology',
        'emergency': 'Emergency',
        'neuro': 'Neurology',
        'trauma-center': 'Trauma Center',
        'stroke-center': 'Stroke Center',
        'pediatric-unit': 'Pediatrics',
        'burn-unit': 'Burn Care',
        'orthopedic-surgery': 'Orthopedics',
        'cardiac-surgery': 'Cardiac Surgery',
        'neonatal-icu': 'NICU',
        'respiratory-care': 'Respiratory Care',
        'endocrine': 'Endocrine'
    };
    
    return capabilityMap[capability] || capability;
}