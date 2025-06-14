let studies = []; // global array
let currentPage = 1;
let itemsPerPage = 25;
let sortBy = 'title_des';

window.onload = () => {
    const savedStudies = localStorage.getItem('studies');
    const savedStatus = localStorage.getItem('activeStatus') || 'unscreened';

    if (savedStudies) {
        studies = JSON.parse(savedStudies);
    }

    // dropdown handler
    document.getElementById('itemsPerPage').addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value, 10);
        currentPage = 1;
        renderFilteredStudies(savedStatus);
    });

    // load more button handler
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        currentPage++;
        renderFilteredStudies(savedStatus);
    });

    // having the right sort by order
    sortBy = localStorage.getItem('sortBy') || 'title_des';

    // set active button handler
    toggleButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === savedStatus) {
            btn.classList.add('active');
        }
    });

    renderFilteredStudies(savedStatus);
    updateToggleCounts();
};

// Sorting studies
document.getElementById('sortBy').addEventListener('change', (e) => {
    sortBy = e.target.value;
    localStorage.setItem('sortBy', sortBy); // keeps it when reloading
    currentPage = 1;
    const activeStatus = localStorage.getItem('activeStatus') || 'unscreened';
    renderFilteredStudies(activeStatus);
});

function sortStudies(studies, sortBy) {
    return [...studies].sort((a, b) => {
        switch (sortBy) {
            case 'year_asc':
                return (a.PY?.[0] || 0) - (b.PY?.[0] || 0);
            case 'year_des':
                return (b.PY?.[0] || 0) - (a.PY?.[0] || 0);
            case 'title_asc':
                return (a.TI?.[0] || '').localeCompare(b.TI?.[0] || 0);
            case 'title_des':
                return (b.TI?.[0] || '').localeCompare(a.TI?.[0] || 0);
            case 'author_asc':
                return (a.AU?.[0] || '').localeCompare(b.AU?.[0] || 0);
            case 'author_des':
                return (b.AU?.[0] || '').localeCompare(a.AU?.[0] || 0);
            case 'index_asc':
                return a.index - b.index;
            default:
                return 0;
        }
    });
}

// Function to filter studies by status
function renderFilteredStudies(status) {
    let filtered = studies
        .map((study, i) => ({ ...study, index: i }))
        .filter(study => study.status === status);

    filtered = sortStudies(filtered, sortBy);

    const paginated = filtered.slice(0, currentPage * itemsPerPage);
    
    renderResults(paginated);

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (currentPage * itemsPerPage >= filtered.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
};

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
            <h4><span class="highlightable">${title}</span></h4>
            <div class="sub-information">
            <p><strong>Study Index: </strong>${index}</p>
            <p class="authors"><strong>Authors: </strong>${authors}</p>
            <p class="year"><strong>Year: </strong>${year}</p>
            <p class="type"><strong>Type: </strong>${type}</p>
            <p class="language"><strong>Language: </strong>${language}</p>
            <p class="journal"><strong>Journal: </strong>${journal}</p>
            <p class="doi"><strong>DOI: </strong>${doi 
                ? `<a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">${doi}</a>` // target="_blank" = OPENS IN NEW WINDOW!!
                : 'N/A'}
            </p>
            </div>
            `;

        const expandable = document.createElement('div');
        expandable.classList.add('expandable');
        expandable.style.display = 'none';
        expandable.innerHTML = `
            <p class="keywords"><strong>Keywords: </strong><span class="highlightable">${keywords}</span></p>
            <p class="abstract"><strong>Abstract: </strong><span class="highlightable">${abstract}</span></p>
        `;

        const dropdownButton = document.createElement('button');
        dropdownButton.textContent = '▼ Show Keywords & Abstract';
        dropdownButton.classList.add('dropdown-button');

        dropdownButton.addEventListener('click', () => {
            const isHidden = expandable.style.display === 'none';
            expandable.style.display = isHidden ? 'block' : 'none';
            dropdownButton.textContent = isHidden ? '▲ Hide Details' : '▼ Show Keywords & Abstract';
        });

        card.appendChild(dropdownButton);
        card.append(expandable);

        const actions = document.createElement('div');
        actions.classList.add('actions');

        // Accept button
        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'ACCEPT';
        acceptBtn.classList.add('accept-btn');
        acceptBtn.onclick = () => updateStatus(index, 'accepted');
                // when there is a click:
                // runs updateStatus function
                // sets status as 'accepted' for the index of the study
        actions.appendChild(acceptBtn);
                // adds acceptBtn to the actions div (made in the bit above this)

        // Reject button
        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'REJECT';
        rejectBtn.classList.add('reject-btn');
        rejectBtn.onclick = () => updateStatus(index, 'rejected');
        actions.appendChild(rejectBtn);

        // Revert button
        if (entry.status !== 'unscreened') { // only appears once something has been decided
            const revertBtn = document.createElement('button');
            revertBtn.textContent = 'REVERT';
            revertBtn.classList.add('revert-btn');
            revertBtn.onclick = () => updateStatus(index, 'unscreened');
            actions.appendChild(revertBtn);
        };
               
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
        const tagInput = document.createElement('select');
        tagInput.className = 'tag-input';

        const globalTags = JSON.parse(localStorage.getItem('globalTags')) || [];

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a tag';
        tagInput.appendChild(defaultOption);

        globalTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            if (entry.tag === tag) option.selected = true;
            tagInput.appendChild(option);
        });

        tagInput.onchange = () => {
            studies[index].tag = tagInput.value;
            localStorage.setItem('studies', JSON.stringify(studies));
        }
        actions.appendChild(tagInput);

        // card is where we put all the study information, so we adding the buttons for each study here by appending
        card.appendChild(actions);
        // insert constructed HTML card into the output container
        outputDiv.appendChild(card);
})};

// Update status function
function updateStatus(index, newStatus) {
    studies[index].status = newStatus;
    localStorage.setItem('studies', JSON.stringify(studies)); // saves to local storage

    const activeBtn = document.querySelector('.toggle button.active'); //finds the toggle button that has the active class (what matches)
    const activeStatus = activeBtn?.dataset.status || 'unscreened'; // defaults to unscreened if null

    localStorage.setItem('activeStatus', activeStatus) // saves what status we are in;

    currentPage = 1;
    renderFilteredStudies(activeStatus); // re-renders the screen to only show those that match (gets rid of it once selected)
    updateToggleCounts(); // updates the subheader
};

// Button toggles (Unscreened, Accepted, Rejected)
const toggleButtons = document.querySelectorAll('.toggle button');

toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleButtons.forEach(b => b.classList.remove('active')); // removes active when a decision is made 'clicked'
        btn.classList.add('active'); // gives the one that was clicked active status

        localStorage.setItem('activeStatus', btn.dataset.status);

        renderFilteredStudies(btn.dataset.status); // shows the studies in that list with that status, as set previously
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

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

let detailsAreExpanded = false; /* defaults as hidden */

document.getElementById('toggleDetailsBtn').addEventListener('click', () => {
    const expandable = document.querySelectorAll('.expandable');
    const allDropdownButtons = document.querySelectorAll('.dropdown-button');

    detailsAreExpanded = !detailsAreExpanded; /* toggles the global state */

    /* loops through each to change the display */
    expandable.forEach(section => {
        section.style.display = detailsAreExpanded ? 'block' : 'none';
    });

    allDropdownButtons.forEach(btn => {
        btn.textContent = detailsAreExpanded ? '▲ Hide Details' : '▼ Show Keywords & Abstract';
    })

    /* updates the label of the button */
    document.getElementById('toggleDetailsBtn').textContent = detailsAreExpanded ? '▲ Hide Details' : '▼ Show Details';
});

// HIGHLIGHTING KEY WORDS

function escapeRegex(term) {
    return term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function highlightKeywords() {
    const inclusionCriteria = JSON.parse(localStorage.getItem('inclusionCriteria')) || {};
    const exclusionCriteria = JSON.parse(localStorage.getItem('exclusionCriteria')) || {};    

    const textBlocks = document.querySelectorAll('.highlightable');

    textBlocks.forEach(block => {
        let text = block.textContent;

        // start clean each time
        block.innerHTML = text;

        // highlight inclusion
        Object.values(inclusionCriteria).flat().forEach(term => {
            const regex = new RegExp(`\\b(${escapeRegex(term)})\\b`, 'gi');
            block.innerHTML = block.innerHTML(regex, `<span class="highlight-exclusion>$1</span>`);
        });
    });
}


window.addEventListener('DOMContentLoaded', () => {
    highlightKeywords();
});