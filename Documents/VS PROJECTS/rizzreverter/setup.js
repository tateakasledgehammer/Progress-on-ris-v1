// makes sure all the existing stuff is there and if empty, then starts empty
let inclusionCriteria = JSON.parse(localStorage.getItem('inclusionCriteria')) || {};
let exclusionCriteria = JSON.parse(localStorage.getItem('exclusionCriteria')) || {};

let inclusionOrder = JSON.parse(localStorage.getItem('inclusionOrder')) || Object.keys(inclusionCriteria);
let exclusionOrder = JSON.parse(localStorage.getItem('exclusionOrder')) || Object.keys(exclusionCriteria);

const titleInput = document.getElementById('titleReview');

/* ON LOAD */
window.addEventListener('DOMContentLoaded', () => {
    // loops through each section stored in inclusion (i.e. Population, Intervention) and makes sure there are UI elements for each, and that all they keywords show up
    inclusionOrder.forEach(section => {
        createSectionUI('inclusion', section, 'inclusionSections');
        updateKeywordList('inclusion', section);
    });

    // same but for exclusion
    exclusionOrder.forEach(section => {
        createSectionUI('exclusion', section, 'exclusionSections');
        updateKeywordList('exclusion', section);
    });

    // Drop downs working and saving
    document.querySelectorAll('select[data-storage-key').forEach(dropdownOption => {
        const key = dropdownOption.dataset.storageKey;
        const savedValue = localStorage.getItem(key);
        if (savedValue) dropdownOption.value = savedValue;

        dropdownOption.addEventListener('change', () => {
            localStorage.setItem(key, dropdownOption.value)
        });
    });

    // Saving the title
    const savedTitle = localStorage.getItem('reviewTitle');
    if (savedTitle) {
        titleInput.value = savedTitle;
    }
});

// Saving the title
titleInput.addEventListener('input', () => {
    localStorage.setItem('reviewTitle', titleInput.value);
});

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


/* ADD FULL TEXT EXCLUSION REASONS */
let fullTextCriteria = JSON.parse(localStorage.getItem('globalExclusion')) || [];

function updateFullTextExclusion() {
    const list = document.getElementById('criteriaList');
    list.innerHTML = '';

    fullTextCriteria.forEach((criteria, index) => {
        // creates a list item
        const li = document.createElement('li');
        li.textContent = criteria;

        // remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.classList.add('remove-criteria-btn');
        removeBtn.style.marginLeft = '10px';

        // when X is clicked, the tag is removed, saved to localStorage and then the list is updated
        removeBtn.onclick = () => {
            fullTextCriteria.splice(index, 1); // remove
            localStorage.setItem('globalExclusion', JSON.stringify(fullTextCriteria)); // update the background list of globalTags which is responsible for keywords
            updateFullTextExclusion(); // refreshes the list to not have it anymore
        };
        
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
};

document.getElementById('addFullTextCriteriaBtn').addEventListener('click', () => {
    const newCriteria = document.getElementById('newFullTextExclusionInput').value.trim();

    if (newCriteria && !fullTextCriteria.includes(newCriteria)) {
        fullTextCriteria.push(newCriteria);
        localStorage.setItem('globalExclusion', JSON.stringify(fullTextCriteria));
        updateFullTextExclusion();
    }

    document.getElementById('newFullTextExclusionInput').value = '';
})

document.getElementById('newFullTextExclusionInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('addFullTextCriteriaBtn').click();
    }
});

updateFullTextExclusion(); 

/* ADD INCLUSION/EXCLUSION CRITERIA */
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
            <button class="move-up-btn" title="Move section up">^</button>
            <button class="move-down-btn" title="Move section down">v</button>
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
        if (type === 'inclusion') {
            inclusionOrder = inclusionOrder.filter(name => name !== sectionName);
            localStorage.setItem('inclusionOrder', JSON.stringify(inclusionOrder));
        } else {
            exclusionOrder = exclusionOrder.filter(name => name !== sectionName);
            localStorage.setItem('exclusionOrder', JSON.stringify(exclusionOrder));
        }
        sectionDiv.remove(); // removes the div from showing on the site
    })

    // move up button
    sectionDiv.querySelector('.move-up-btn').addEventListener('click', () => {
        const order = type === 'inclusion' ? inclusionOrder : exclusionOrder;
        const index = order.indexOf(sectionName);
        if (index > 0) {
            // swap the order
            [order[index - 1], order[index]] = [order[index], order[index - 1]];
            
            // save update to local storage
            localStorage.setItem(type === 'inclusion' ? 'inclusionOrder' : 'exclusionOrder', JSON.stringify(order));

            // re-render the sections in the new order
            reloadCriteriaSections(type);
        }
    });

    // move down button
    sectionDiv.querySelector('.move-down-btn').addEventListener('click', () => {
        const order = type === 'inclusion' ? inclusionOrder : exclusionOrder;
        const index = order.indexOf(sectionName);
        if (index < order.length - 1) {
            // swap the order
            [order[index + 1], order[index]] = [order[index], order[index + 1]];
            
            // save update
            localStorage.setItem(type === 'inclusion' ? 'inclusionOrder' : 'exclusionOrder', JSON.stringify(order));

            // re-render the sections in the new order
            reloadCriteriaSections(type);
        }
    });
    
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
};

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
        localStorage.setItem(
            type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria',
            JSON.stringify(criteria)
        );
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

// reload criteria sections function
function reloadCriteriaSections(type) {
    const criteria = type === 'inclusion' ? inclusionCriteria : exclusionCriteria;
    const containerId = type === 'inclusion' ? 'inclusionSections' : 'exclusionSections';
    const container = document.getElementById(containerId);
    const order = type === 'inclusion' ? inclusionOrder : exclusionOrder;

    container.innerHTML = ''; // clears

    order.forEach(section => {
        if (criteria[section]) {
            createSectionUI(type, section, containerId);
            updateKeywordList(type, section);
        }
    });
}

// reset button for criteria
document.getElementById('resetIncExcCriteria').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear your Inclusion & Exclusion criteria?")) {
        localStorage.removeItem('inclusionCriteria');
        localStorage.removeItem('exclusionCriteria');
        localStorage.removeItem('inclusionOrder');
        localStorage.removeItem('exclusionOrder');
        location.reload();
    }
});