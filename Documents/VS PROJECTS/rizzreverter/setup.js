/* ON LOAD */
window.addEventListener('DOMContentLoaded', () => {
    // loops through each section stored in inclusion (i.e. Population, Intervention) and makes sure there are UI elements for each, and that all they keywords show up
    Object.keys(inclusionCriteria).forEach(section => {
        createSectionUI('inclusion', section, 'inclusionSections');
        updateKeywordList('inclusion', section);
    });

    // same but for exclusion
    Object.keys(exclusionCriteria).forEach(section => {
        createSectionUI('exclusion', section, 'exclusionSections');
        updateKeywordList('exclusion', section);
    });
})

/* ADD TAGS */
// loads previously saved tags or sets it as empty if need be
let tags = JSON.parse(localStorage.getItem('globalTags')) || [];

function updateTagListUI() {
    const list = document.getElementById('tagList');
    list.innerHTML = ''; // clear the list, as everytime this is run, we rebuild the list, by using the below for loop that goes through each 'tags' (saved list of all the 'globalTags')

    tags.forEach((tag, index) => {
        // creates a list item
        const li = document.createElement('li');
        li.textContent = tag;

        // remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.classList.add('remove-tag-btn');
        removeBtn.style.marginLeft = '10px';

        // when X is clicked, the tag is removed, saved to localStorage and then the list is updated
        removeBtn.onclick = () => {
            tags.splice(index, 1); // remove
            localStorage.setItem('globalTags', JSON.stringify(tags)); // update the background list of globalTags which is responsible for keywords
            updateTagListUI(); // refreshes the list to not have it anymore
        };
        
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
};

// makes a handler for when the 'addTagBtn' gets clicked
document.getElementById('addTagBtn').addEventListener('click', () => {
    // newTagInput is what gets written into the input section to make a tag
    // this takes the value and puts it under 'newTag'
    const newTag = document.getElementById('newTagInput').value.trim();

    // double checks it isn't a duplicate
    if (newTag && !tags.includes(newTag)) {
        tags.push(newTag); // adds to tags list
        localStorage.setItem('globalTags', JSON.stringify(tags)); // saved for keywords later
        updateTagListUI(); // refreshes list to show it
    }
    document.getElementById('newTagInput').value = ''; // empties the text in the input section
});

// same as above but for pressing enter
document.getElementById('newTagInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('addTagBtn').click();
    }
});

updateTagListUI(); // double checks everything is showing correctly

/* ADD INCLUSION/EXCLUSION CRITERIA */
// makes sure all the existing stuff is there and if empty, then starts empty
let inclusionCriteria = JSON.parse(localStorage.getItem('inclusionCriteria')) || {};
let exclusionCriteria = JSON.parse(localStorage.getItem('exclusionCriteria')) || {};

// function to set up criteria sections (i.e. population, intervention)
function createSectionUI(type, sectionName, containerId) {
    // sets up where to insert the info
    const container = document.getElementById(containerId); // 
    const sectionDiv = document.createElement('div');

    // give the section the class and default layout (name, remove button, option to put in other terms for list)
    sectionDiv.className = 'criteria-section';
    sectionDiv.innerHTML = `
        <h5>${sectionName}
            <button class="remove-section-btn" title="Remove section">X</button>
        </h5>
        <input type="text" id="${type}-${sectionName}-input" placeholder="Enter keyword...">
        <button onclick="addKeyword('${type}', '${sectionName}')">Add Keyword</button>
        <ul id="${type}-${sectionName}-list"></ul>
    `;

    // adding keywords with pressing 'enter'
    const keywordInput = sectionDiv.querySelector(`#${type}-${sectionName}-input`);
    keywordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addKeyword(type, sectionName);
        }
    });

    // remove button handler - how does this work more specifically?
    sectionDiv.querySelector('.remove-section-btn').addEventListener('click', () => {
        const criteria = type === 'inclusion' ? inclusionCriteria : exclusionCriteria;
        delete criteria[sectionName]; // removes from criteria object (inclusionCriteria or exclusionCriteria)
        localStorage.setItem( // removes from localStorage
            type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria',
            JSON.stringify(criteria)
        );
        sectionDiv.remove(); // removes the div from showing on the site
    })

    // adds the div that was just formatted to the 'container'
    container.appendChild(sectionDiv);
}

// quick function to reformat inputs so they show up with Title Case formatting
function titleCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// adding for Inclusion & Exclusion specifically
function addInclusionSection() {
    let sectionName = document.getElementById('newInclusionSection').value.trim();
    sectionName = titleCase(sectionName);

    // checking it isn't empty or a duplicate
    if (!sectionName) {
        alert("Section name cannot be empty.");
        return;
    }
    if (inclusionCriteria[sectionName]) {
        alert("This criteria already exists.");
        return;
    }

    // adds the section
    if (sectionName && !inclusionCriteria[sectionName]) {
        inclusionCriteria[sectionName] = [];
        localStorage.setItem('inclusionCriteria', JSON.stringify(inclusionCriteria)); // saves to local storage
        createSectionUI('inclusion', sectionName, 'inclusionSections'); // makes it show up
        document.getElementById('newInclusionSection').value = ''; // clears what is in the box
    }
};

function addExclusionSection() {
    let sectionName = document.getElementById('newExclusionSection').value.trim();
    sectionName = titleCase(sectionName);

    if (!sectionName) {
        alert("Section name cannot be empty.");
        return;
    }
    if (exclusionCriteria[sectionName]) {
        alert("This criteria already exists.");
        return;
    }

    if (sectionName && !exclusionCriteria[sectionName]) {
        exclusionCriteria[sectionName] = [];
        localStorage.setItem('exclusionCriteria', JSON.stringify(exclusionCriteria));
        createSectionUI('exclusion', sectionName, 'exclusionSections');
        document.getElementById('newExclusionSection').value = '';
    }
}


// making enter work
document.getElementById('newInclusionSection').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addInclusionSection();
    }
});

document.getElementById('newExclusionSection').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addExclusionSection();
    }
});

// Add keywords to the inclusion/exclusion
function addKeyword(type, section) {
    const input = document.getElementById(`${type}-${section}-input`);
    const value = input.value.trim();
    
    const criteria = type === 'inclusion' ? inclusionCriteria : exclusionCriteria;
    if (!criteria[section]) criteria[section] = [];
    if (!criteria[section].includes(value)) {
        criteria[section].push(value);
        localStorage.setItem(`${type}Criteria`, JSON.stringify(criteria));
        updateKeywordList(type, section);
    }
    input.value = '';
}

function updateKeywordList(type, section) {
    const criteria = type === 'inclusion' ? inclusionCriteria : exclusionCriteria;
    const list = document.getElementById(`${type}-${section}-list`);
    list.innerHTML = '';
    criteria[section].forEach((term, i) => {
        const li = document.createElement('li');
        term = titleCase(term);
        li.textContent = term;

        // remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.title="Remove keyword"
        removeBtn.classList.add('remove-keyword-btn');
        removeBtn.style.marginLeft = '8px';

        removeBtn.onclick = () => {
            criteria[section].splice(i, 1); // i = index, 1 is the number of elements to remove
            localStorage.setItem(type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria', JSON.stringify(criteria));
            updateKeywordList(type, section);
        };
        
        list.appendChild(li);
        li.appendChild(removeBtn);
    });
};