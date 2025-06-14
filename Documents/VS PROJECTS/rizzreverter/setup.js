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

/* ADD INCLUSION CRITERIA */
let includedTerms = JSON.parse(localStorage.getItem('globalInclusion')) || [];

function updateIncludedList() {
    const list_included = document.getElementById('includedList');
    list_included.innerHTML = '';

    includedTerms.forEach((includedTerm, index) => {
        const li = document.createElement('li');
        li.textContent = includedTerm;

        list_included.appendChild(li);
    });
};

document.getElementById('addIncludedBtn').addEventListener('click', () => {
    const newInclusion = document.getElementById('newIncludedInput').value.trim();
    if (newInclusion && !includedTerms.includes(newInclusion)) {
        includedTerms.push(newInclusion);
        localStorage.setItem('globalInclusion', JSON.stringify(includedTerms));
        updateIncludedList();
    }
    document.getElementById('newIncludedInput').value = '';
})