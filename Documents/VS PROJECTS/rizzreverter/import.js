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
        document.getElementById('uploadStatus').textContent = 'File uploaded!';         
    };

    // starts reading the file as text
    reader.readAsText(file); 
});


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

    localStorage.setItem('studies', JSON.stringify(records));
};
