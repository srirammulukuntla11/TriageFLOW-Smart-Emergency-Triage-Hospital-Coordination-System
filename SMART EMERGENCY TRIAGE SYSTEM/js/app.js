// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

function initApp() {
    // Set up event listeners for navigation
    setupNavigation();
    
    // Load any saved patient data
    loadPatientData();
}

function setupNavigation() {
    // Role selection buttons
    document.getElementById('ambulance-btn').addEventListener('click', showAmbulanceSection);
    document.getElementById('hospital-btn').addEventListener('click', showHospitalSection);
    
    // Back buttons
    document.getElementById('ambulance-back').addEventListener('click', showRoleSelection);
    document.getElementById('hospital-back').addEventListener('click', showRoleSelection);
    
    // Close patient details
    document.getElementById('close-details').addEventListener('click', closePatientDetails);
}

function showRoleSelection() {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show role selection
    document.getElementById('role-selection').classList.add('active');
    
    // Close patient details if open
    closePatientDetails();
}

function showAmbulanceSection() {
    // Hide role selection and other sections
    document.getElementById('role-selection').classList.remove('active');
    document.getElementById('hospital-section').classList.remove('active');
    
    // Show ambulance section
    document.getElementById('ambulance-section').classList.add('active');
}

function showHospitalSection() {
    // Hide role selection and other sections
    document.getElementById('role-selection').classList.remove('active');
    document.getElementById('ambulance-section').classList.remove('active');
    
    // Show hospital section
    document.getElementById('hospital-section').classList.add('active');
    
    // Refresh the dashboard
    refreshDashboard();
}

function closePatientDetails() {
    document.getElementById('patient-detail').style.display = 'none';
}

function loadPatientData() {
    // Try to load from localStorage
    const savedPatients = localStorage.getItem('triagePatients');
    
    if (savedPatients) {
        window.patients = JSON.parse(savedPatients);
    } else {
        // Load sample data if none exists
        window.patients = getSamplePatientData();
        savePatientData();
    }
}

function savePatientData() {
    localStorage.setItem('triagePatients', JSON.stringify(window.patients));
}

function getSamplePatientData() {
    return [
        {
            id: "P001",
            name: "John Smith",
            age: 45,
            gender: "male",
            heartRate: 110,
            bloodPressure: "150/95",
            respiratoryRate: 22,
            oxygenSaturation: 92,
            temperature: 38.5,
            gcs: 14,
            symptoms: "Chest pain radiating to left arm, shortness of breath",
            medicalHistory: "Hypertension, family history of heart disease",
            medications: "Lisinopril 10mg daily",
            arrivalTime: new Date().toISOString(),
            priority: "high"
        },
        {
            id: "P002",
            name: "Maria Garcia",
            age: 32,
            gender: "female",
            heartRate: 85,
            bloodPressure: "118/78",
            respiratoryRate: 16,
            oxygenSaturation: 98,
            temperature: 37.2,
            gcs: 15,
            symptoms: "Fever, cough, body aches for 3 days",
            medicalHistory: "Asthma, seasonal allergies",
            medications: "Albuterol inhaler as needed",
            arrivalTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
            priority: "medium"
        },
        {
            id: "P003",
            name: "Robert Johnson",
            age: 68,
            gender: "male",
            heartRate: 72,
            bloodPressure: "130/85",
            respiratoryRate: 18,
            oxygenSaturation: 96,
            temperature: 36.8,
            gcs: 15,
            symptoms: "Laceration on right forearm from fall",
            medicalHistory: "Type 2 diabetes, hypertension",
            medications: "Metformin, Lisinopril",
            arrivalTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 minutes ago
            priority: "low"
        }
    ];
}