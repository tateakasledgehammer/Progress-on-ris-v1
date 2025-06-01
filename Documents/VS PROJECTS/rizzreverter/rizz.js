document.getElementById('risFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    // if there are no files then exit
    if (!file) return; 

    // creates a FileReader to read file
    const reader = new FileReader();

    // handles error
    reader.onerror = function() {
        console.error("Error reading file", reader.error);
    }

    // defines what happens once the file is read (get text > parse into records > puts into 'renderResults' to display)
    reader.onload = function(e) {
        const content = e.target.result;
        parseRIS(content);         
    };

    // starts reading the file as text
    reader.readAsText(file); 
});

let studies = []; // global array

// puts RIS text into JS objects
function parseRIS(text) {
    // breaks it down
    const lines = text.split(/\r?\n/);

    // holds on to the entries
    const records = []; 

    // holds one of the entries
    let entry = {};
    // skip empty lines
    for (let line of lines) {
        if (line.trim() === '') continue; 

        // extract tags (AU, TI, etc.) and the value
        const tag = line.slice(0, 2); 
        const value = line.slice(6).trim(); 

    // TY is the start of a new, so checks to push the value to records then resets
    if (tag === 'TY') {
        entry = { TY: value }; 
    }  else if (tag === 'ER') {
        entry.status = 'unscreened';
        records.push(entry);
        entry = {};
    } else {
        if (!entry[tag]) {
            entry[tag] = [];
        }
        entry[tag].push(value);
        }
    }  

    // return the final list of parsed entries
    studies = records;
    renderFilteredStudies('unscreened'); // filters and displays studies with unscreened status
    updateToggleCounts();
}

// Function to filter studies by status
function renderFilteredStudies(status) {
    const filtered = studies
        .map((study, i) => ({ ...study, index: i }))
        .filter(study => study.status === status);
    renderResults(filtered);
}

// renders the results into HTML
function renderResults(records) {
    // gets the output container where results displayed
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';

    // forEach loops through ecords, then gets details
    records.forEach((entry) => {
        const index = entry.index;
        const title = (entry.TI && entry.TI[0] || 'N/A');
        const year = (entry.PY && entry.PY[0] || 'N/A'); // having entry.PY & entry.PY[0] means it works regardless of how it has been formatted ['2024'] or another way
        const type = (entry.M3 && entry.M3[0] || 'N/A')
        const authors = entry.AU ? entry.AU.join(', ') : 'N/A'; 
        const doi = (entry.DO && entry.DO[0] || 'N/A');
        const link = (entry.UR && entry.UR[0] || 'N/A');
        const journal = (entry.T2 && entry.T2[0] || 'N/A');
        const volume = (entry.VL && entry.VL[0] || '');
        const issue = (entry.IS && entry.IS[0] || '');
        const abstract = (entry.AB && entry.AB[0] || 'N/A');
        const keywords = entry.KW ? entry.KW.join(', ') : 'N/A';
        const language = (entry.LA && entry.LA[0] || 'N/A');


        const card = document.createElement('div');
        card.classList.add('study-card');

        // define the HTML block for this entry
        card.innerHTML = `
            <h4>${title}</h4>
            <h5>${index}</h5>
            <p class="authors"><strong>Authors: </strong>${authors}</p>
            <p class="year"><strong>Year: </strong>${year}</p>
            <p class="type"><strong>Type: </strong>${type}</p>
            <p class="language"><strong>Language: </strong>${language}</p>
            <p class="journal"><strong>Journal: </strong>${journal}</p>
            <p class="doi"><strong>DOI: </strong>${doi 
                ? `<a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">${doi}</a>` // target="_blank" = OPENS IN NEW WINDOW!!
                : 'N/A'}
            </p>
            <p class="keywords"><strong>Keywords: </strong>${keywords}</p>
            <p class="abstract"><strong>Abstract: </strong>${abstract}</p>
        `;

        const actions = document.createElement('div');
        actions.classList.add('actions');

        // Accept button
        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'ACCEPT';
        acceptBtn.classList.add('accept-btn');
        acceptBtn.onclick = () => updateStatus(index, 'accepted');
        actions.appendChild(acceptBtn);

        // Reject button
        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'REJECT';
        rejectBtn.classList.add('reject-btn');
        rejectBtn.onclick = () => updateStatus(index, 'rejected');
        actions.appendChild(rejectBtn);

        // Revert button
        if (entry.status !== 'unscreened') {
            const revertBtn = document.createElement('button');
            revertBtn.textContent = 'REVERT';
            revertBtn.classList.add('revert-btn');
            revertBtn.onclick = () => updateStatus(index, 'unscreened');
            actions.appendChild(revertBtn);
        }
               
        // Note saving
        const noteInput = document.createElement('textarea');
        noteInput.className = 'note-input';
        noteInput.label = 'Add Note:'
        noteInput.placeholder = 'Enter your note here';
        noteInput.value = entry.note || '';
        noteInput.oninput = () => {
            studies[index].note = noteInput.value;
        };
        actions.appendChild(noteInput);
        
        // Tag saving
        const tagInput = document.createElement('textarea');
        tagInput.className = 'tag-input';
        tagInput.label = 'Select tag:'
        tagInput.placeholder = 'Enter tag...';
        tagInput.value = entry.tag || '';
        tagInput.oninput = () => {
            studies[index].tag = tagInput.value;
        };
        actions.appendChild(tagInput);

        card.appendChild(actions);
        // insert constructed HTML card into the output container
        outputDiv.appendChild(card);
})};

// Update status function
function updateStatus(index, newStatus) {
    studies[index].status = newStatus;

    const activeBtn = document.querySelector('.toggle button.active');
    const activeStatus = activeBtn?.dataset.status || 'unscreened';

    renderFilteredStudies(activeStatus);
    updateToggleCounts();
}

// Button toggles (Unscreened, Accepted, Rejected)
const toggleButtons = document.querySelectorAll('.toggle button');

toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderFilteredStudies(btn.dataset.status);
    })
});

// Update label counts
function updateToggleCounts() {
    const counts = {
        unscreened: studies.filter(s => s.status === 'unscreened').length,
        accepted: studies.filter(s => s.status === 'accepted').length,
        rejected: studies.filter(s => s.status === 'rejected').length,
    };

    toggleButtons.forEach(btn => {
        const status = btn.dataset.status;
        btn.textContent = `${capitalize(status)} (${counts[status]})`;
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}