/* ON LOAD */
window.addEventListener('DOMContentLoaded', () => {
    Object.keys(inclusionCriteria).forEach(section => {
        createSectionUI('inclusion', section, 'inclusionSections');
        updateKeywordList('inclusion', section);
    });

    Object.keys(exclusionCriteria).forEach(section => {
        createSectionUI('exclusion', section, 'exclusionSections');
        updateKeywordList('exclusion', section);
    });
})

/* ADD TAGS */
let tags = JSON.parse(localStorage.getItem('globalTags')) || [];

function updateTagListUI() {
    const list = document.getElementById('tagList');
    list.innerHTML = '';

    tags.forEach((tag, index) => {
        const li = document.createElement('li');
        li.textContent = tag;

        // remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.classList.add('remove-tag-btn');
        removeBtn.style.marginLeft = '10px';
        removeBtn.onclick = () => {
            tags.splice(index, 1);
            localStorage.setItem('globalTags', JSON.stringify(tags));
            updateTagListUI();
        };
        
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

document.getElementById('addTagBtn').addEventListener('click', () => {
    const newTag = document.getElementById('newTagInput').value.trim();
    if (newTag && !tags.includes(newTag)) {
        tags.push(newTag);
        localStorage.setItem('globalTags', JSON.stringify(tags));
        updateTagListUI();
    }
    document.getElementById('newTagInput').value = '';
});

updateTagListUI();

/* ADD INCLUSION/EXCLUSION CRITERIA */
let inclusionCriteria = JSON.parse(localStorage.getItem('inclusionCriteria')) || {};
let exclusionCriteria = JSON.parse(localStorage.getItem('exclusionCriteria')) || {};

function createSectionUI(type, sectionName, containerId) {
    const container = document.getElementById(containerId);
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'criteria-section';
    sectionDiv.innerHTML = `
        <h5>${sectionName}
            <button class="remove-section-btn" title="Remove section">X</button>
        </h5>
        <input type="text" id="${type}-${sectionName}-input" placeholder="Enter inclusion term..">
        <button onclick="addKeyword('${type}', '${sectionName}')">Add Keyword</button>
        <ul id="${type}-${sectionName}-list"></ul>
    `;

    // remove button handler
    sectionDiv.querySelector('.remove-section-btn').addEventListener('click', () => {
        const criteria = type = 'inclusion' ? inclusionCriteria : exclusionCriteria;
        delete criteria[sectionName];
        localStorage.setItem(
            type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria',
            JSON.stringify(criteria)
        );
        sectionDiv.remove();
    })

    container.appendChild(sectionDiv);
}

function addInclusionSection() {
    const sectionName = document.getElementById('newInclusionSection').value.trim();
    if (sectionName && !inclusionCriteria[sectionName]) {
        inclusionCriteria[sectionName] = [];
        localStorage.setItem('inclusionCriteria', JSON.stringify(inclusionCriteria));
        createSectionUI('inclusion', sectionName, 'inclusionSections');
        document.getElementById('newInclusionSection').value = '';
    }
}

function addExclusionSection() {
    const sectionName = document.getElementById('newExclusionSection').value.trim();
    if (sectionName && !exclusionCriteria[sectionName]) {
        exclusionCriteria[sectionName] = [];
        localStorage.setItem('exclusionCriteria', JSON.stringify(exclusionCriteria));
        createSectionUI('exclusion', sectionName, 'exclusionSections');
        document.getElementById('newExclusionSection').value = '';
    }
}

// Add keywords to the inclusion/exclusion
function addKeyword(type, section) {
    const input = document.getElementById(`${type}-${section}-input`);
    const value = input.value.trim();
    if (!value) return;

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
        li.textContent = term;

        // remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.classList.add('remove-keyword-btn');
        removeBtn.style.marginLeft = '8px';
        removeBtn.onclick = () => {
            criteria[section].splice(i, 1);
            localStorage.setItem(type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria', JSON.stringify(criteria));
            updateKeywordList(type, section);
        };
        
        list.appendChild(li);
        li.appendChild(removeBtn);
    });
};