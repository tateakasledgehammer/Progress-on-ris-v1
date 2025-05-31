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
    return records;
}

// Function to filter studies by status
function renderFilteredStudies(status) {
    const filtered = studies.filter(study => study.status === status);
    renderResults(filtered);
}

// renders the results into HTML
function renderResults(records) {
    // gets the output container where results displayed
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';

    // forEach loops through ecords, then gets details
    records.forEach((entry, index) => {
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

        // define the HTML block for this entry
        const cardHTML = `
            <div class="study-card">
                <h4>${title}</h4>
                <p class="authors"><strong>Authors: </strong>${authors}</p>
                <p class="year"><strong>Year: </strong>${year}</p>
                <p class="type"><strong>Type: </strong>${type}</p>
                <p class="language"><strong>Language: </strong>${language}</p>
                <p class="journal"><strong>Journal: </strong>${journal}</p>
                <p class="doi"><strong>DOI: </strong>${doi 
                    ? `<a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">${doi}</a>` // target="_blank" = OPENS IN NEW WINDOW!!
                    : 'N/A'}
                </p>
                <div>
                    <p class="keywords"><strong>Keywords: </strong>${keywords}</p>
                </div>
                <div>
                    <p class="abstract"><strong>Abstract: </strong>${abstract}</p>
                </div>  

            <!-- Action buttons -->
                <div class="actions">
                    <button class="accept-btn" onclick="updateStatus(${index}, 'accepted')">ACCEPT</button>
                    <button class="reject-btn" onclick="updateStatus(${index}, 'rejected')">REJECT</button>
                    <button class="revert-btn" onclick="updateStatus(${index}, 'unscreened')">REVERT</button>
                    <div class="note-section">
                        <label>Add Note:</label>
                        <textarea class="note-input" placeholder="Enter your note here..."></textarea>
                    </div>
                    <div class="tag-section">
                        <label>Assign Tag:</label>
                        <input type="text" class="tag-input" placeholder="Enter tag...">
                    </div>
                 </div>
            </div>
            `;

        // insert constructed HTML card into the output container
        outputDiv.insertAdjacentHTML('beforeend',cardHTML)})
};

// Update status function
function updateStatus(index, newStatus) {
    studies[index].status = newStatus;
    renderFilteredStudies(newStatus === 'unscreened'
        ? 'unscreened'
        : newStatus);
}

const toggleButtons = document.querySelectorAll('.toggle button');

toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    })
})