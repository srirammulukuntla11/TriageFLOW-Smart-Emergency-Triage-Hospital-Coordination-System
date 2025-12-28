// Hospital dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for the dashboard
    if (document.getElementById('priority-filter')) {
        document.getElementById('priority-filter').addEventListener('change', refreshDashboard);
    }
    
    if (document.getElementById('search-patient')) {
        document.getElementById('search-patient').addEventListener('input', debounce(refreshDashboard, 300));
    }
    
    // Initial load of the dashboard when switching to the hospital section
    if (document.getElementById('hospital-section') && 
        document.getElementById('hospital-section').classList.contains('active')) {
        refreshDashboard();
    }
});

function refreshDashboard() {
    // Update patient table
    updatePatientTable();
    
    // Update incoming patients
    displayIncomingPatients();
}

function updatePatientTable() {
    const filterValue = document.getElementById('priority-filter').value;
    const searchValue = document.getElementById('search-patient').value.toLowerCase();
    const patientList = document.getElementById('patient-list');
    
    if (!patientList) return;
    
    // Filter patients (assuming global patients array)
    if (typeof window.patients === 'undefined') {
        console.error('Patients array not found');
        return;
    }
    
    let filteredPatients = window.patients;
    
    if (filterValue !== 'all') {
        filteredPatients = filteredPatients.filter(patient => patient.priority === filterValue);
    }
    
    if (searchValue) {
        filteredPatients = filteredPatients.filter(patient => 
            patient.chiefComplaint.toLowerCase().includes(searchValue) || 
            (patient.symptoms && patient.symptoms.toLowerCase().includes(searchValue))
        );
    }
    
    // Sort by priority (high first) and arrival time (most recent first)
    filteredPatients.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.arrivalTime) - new Date(a.arrivalTime);
    });
    
    // Update table
    patientList.innerHTML = '';
    
    filteredPatients.forEach(patient => {
        const row = document.createElement('tr');
        
        // Priority
        const priorityCell = document.createElement('td');
        priorityCell.innerHTML = `<span class="priority-badge priority-${patient.priority}">${patient.priority.toUpperCase()}</span>`;
        row.appendChild(priorityCell);
        
        // Arrival Time
        const timeCell = document.createElement('td');
        timeCell.textContent = patient.arrivalTime;
        row.appendChild(timeCell);
        
        // Chief Complaint
        const complaintCell = document.createElement('td');
        complaintCell.textContent = patient.chiefComplaint;
        row.appendChild(complaintCell);
        
        // Heart Rate
        const hrCell = document.createElement('td');
        hrCell.textContent = patient.heartRate + ' bpm';
        row.appendChild(hrCell);
        
        // Blood Pressure
        const bpCell = document.createElement('td');
        bpCell.textContent = patient.systolicBP + '/' + patient.diastolicBP + ' mmHg';
        row.appendChild(bpCell);
        
        // Actions
        const actionCell = document.createElement('td');
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn view-btn';
        viewBtn.textContent = 'View Details';
        viewBtn.addEventListener('click', () => showPatientDetails(patient.id));
        actionCell.appendChild(viewBtn);
        row.appendChild(actionCell);
        
        patientList.appendChild(row);
    });
}

function displayIncomingPatients() {
    const incomingPatientsDiv = document.getElementById('incoming-patients');
    if (!incomingPatientsDiv) return;
    
    const notifications = JSON.parse(localStorage.getItem('hospitalNotifications')) || [];
    
    if (notifications.length === 0) {
        incomingPatientsDiv.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No incoming patients</p>';
        return;
    }
    
    // Filter notifications for this hospital (assuming hospital id is 1 for demo)
    // In a real app, you'd filter by logged-in hospital ID
    const hospitalId = 1; // Demo - first hospital
    const hospitalNotifications = notifications.filter(n => n.selectedHospitalId === hospitalId);
    
    if (hospitalNotifications.length === 0) {
        incomingPatientsDiv.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No incoming patients assigned to this hospital</p>';
        return;
    }
    
    let html = '<div class="incoming-patients-grid">';
    
    hospitalNotifications.forEach(notification => {
        const patient = notification.patientData;
        html += `
            <div class="incoming-patient-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin-bottom: 5px;">Patient ${patient.id}</h4>
                        <p style="color: #7f8c8d; font-size: 14px;">${patient.chiefComplaint}</p>
                        <div style="display: flex; gap: 10px; margin-top: 10px; font-size: 14px;">
                            <span><strong>Priority:</strong> <span class="priority-badge priority-${patient.priority}">${patient.priority.toUpperCase()}</span></span>
                            <span><strong>ETA:</strong> ${notification.eta} min</span>
                            <span><strong>Crew:</strong> ${notification.ambulanceCrewId}</span>
                        </div>
                    </div>
                    <div>
                        <span style="background-color: #3498db; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">${notification.status}</span>
                    </div>
                </div>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                    <button class="btn view-btn" onclick="viewIncomingPatient('${notification.patientId}')" style="padding: 5px 10px; font-size: 12px;">
                        View Details
                    </button>
                    <button class="btn" onclick="admitPatient('${notification.patientId}')" style="padding: 5px 10px; font-size: 12px; background-color: #2ecc71; margin-left: 5px;">
                        Admit Patient
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    incomingPatientsDiv.innerHTML = html;
}

// Function to view incoming patient details
window.viewIncomingPatient = function(patientId) {
    // Find the patient in regular patients array
    if (typeof window.patients === 'undefined') {
        console.error('Patients array not found');
        return;
    }
    
    const patient = window.patients.find(p => p.id === patientId);
    if (patient) {
        showPatientDetails(patientId);
    } else {
        alert('Patient details not found');
    }
}

// Function to admit patient (mark as arrived)
window.admitPatient = function(patientId) {
    const notifications = JSON.parse(localStorage.getItem('hospitalNotifications')) || [];
    const notificationIndex = notifications.findIndex(n => n.patientData.id === patientId);
    
    if (notificationIndex !== -1) {
        notifications[notificationIndex].status = 'arrived';
        localStorage.setItem('hospitalNotifications', JSON.stringify(notifications));
        
        // Refresh display
        displayIncomingPatients();
        alert('Patient marked as arrived');
    }
}

// Show patient details
function showPatientDetails(patientId) {
    const patientDetails = document.getElementById('patient-details');
    if (!patientDetails) return;
    
    if (typeof window.patients === 'undefined') {
        console.error('Patients array not found');
        return;
    }
    
    const patient = window.patients.find(p => p.id === patientId);
    
    if (patient) {
        patientDetails.innerHTML = `
            <h3>Patient Details</h3>
            <p><strong>Patient ID:</strong> ${patient.id}</p>
            <p><strong>Arrival Time:</strong> ${patient.arrivalTime}</p>
            <p><strong>Priority:</strong> <span class="priority-badge priority-${patient.priority}">${patient.priority.toUpperCase()}</span></p>
            <p><strong>Chief Complaint:</strong> ${patient.chiefComplaint}</p>
            <p><strong>Symptoms:</strong> ${patient.symptoms || 'None specified'}</p>
            
            <div class="vitals-grid">
                <div class="vital-item">
                    <strong>Heart Rate</strong>
                    <div>${patient.heartRate} bpm</div>
                </div>
                <div class="vital-item">
                    <strong>Blood Pressure</strong>
                    <div>${patient.systolicBP}/${patient.diastolicBP} mmHg</div>
                </div>
                <div class="vital-item">
                    <strong>Respiratory Rate</strong>
                    <div>${patient.respiratoryRate} breaths/min</div>
                </div>
                <div class="vital-item">
                    <strong>Oxygen Saturation</strong>
                    <div>${patient.oxygenSaturation}%</div>
                </div>
                <div class="vital-item">
                    <strong>Temperature</strong>
                    <div>${patient.temperature}°C</div>
                </div>
                <div class="vital-item">
                    <strong>Glasgow Coma Scale</strong>
                    <div>${patient.gcs}/15</div>
                </div>
                <div class="vital-item">
                    <strong>Blood Glucose</strong>
                    <div>${patient.bloodGlucose} mg/dL</div>
                </div>
            </div>
        `;
        
        patientDetails.style.display = 'block';
        
        // Scroll to details
        patientDetails.scrollIntoView({ behavior: 'smooth' });
    }
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}