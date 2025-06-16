// adds a listener to see if the risFileInput (select file) is used
document.getElementById('risFileInput').addEventListener('change', function(event) {
    // gets the first selected file - uploaded one at a time
    const file = event.target.files[0];
    // if there are no files then exit
    if (!file) return; 

    // creates a FileReader to read file
    const reader = new FileReader();

    // handles error
    reader.onerror = function() {
        console.error("Error reading file", reader.error);
        alert("Error reading file.");
    }

    // defines what happens once the file is read (get text > parse into records > puts into 'renderResults' to display)
    reader.onload = function(e) { // this is a function that happens as soon as the file has been read
        // e (event) contains metadata about the file reading process
        const content = e.target.result; // gets the file content as text - e.target is the FileReader instance (reader), whereas .result is the result of the file reading (string)
        const studies = parseRIS(content); // parse the text into an array of study objects

        // existing studies
        const existingStudies = JSON.parse(localStorage.getItem('studies') || '[]'); // load any existing studies from localStorage

        // combine the studies
        const combinedStudies = existingStudies.concat(studies); // bring the different study arrays together

        //
        //
        // !!!! ADD DUPLICATION CHECKER
        //
        //

        // save back to local storage
        localStorage.setItem('studies', JSON.stringify(combinedStudies));

        // add this upload to upload history - to display below
        addUploadRecord(file.name, studies.length);

        // show success message, from <p id="uploadStatus"></p> in the HTML
        document.getElementById('uploadStatus').textContent = 'File uploaded!';       
        
        //
        //
        // !!!! HAVE THIS FADE OUT
        //
        //

        // refresh upload history to display in list
        renderUploadHistory();
    };

    // starts reading the file as text
    reader.readAsText(file); 
});


// puts RIS text into JS objects
function parseRIS(text) {
    // breaks it down - just a formatting thing in the background for Windoes & Unix
    const lines = text.split(/\r?\n/);

    // sets up the storage (records) and storage for the entry being parsed
    const records = []; 
    let entry = {};

    // loop to skip empty lines - EXPLAIN FURTHER
    for (let line of lines) {
        if (line.trim() === '') continue; 

        // extract tags (AU, TY, etc.) and the value (skips over the tag by starting at the 6th character)
        const tag = line.slice(0, 2); 
        const value = line.slice(6).trim(); 

        //
        //
        // !!!! CAN THIS BE IMPROVED
        //
        //

    // TY is the start of a new, so checks to push the value to records then resets
    if (tag === 'TY') {
        entry = { TY: value }; 
    }  else if (tag === 'ER') { // ER = end record
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
    
    // 
    //
    // !!!! Can TI & AU be validated to make sure everything is there before pushing ?
    //
    //

    return records;
};

function addUploadRecord(filename, studyCount) {
    const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]'); // checks if anything there already
    const timestamp = new Date().toLocaleString(); // format

    history.push({
        timestamp,
        filename,
        studyCount
    });

    localStorage.setItem('uploadHistory', JSON.stringify(history));
}

function renderUploadHistory() {
    const historyList = document.getElementById('uploadHistoryList');
    historyList.innerHTML = '';

    const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    if (history.length === 0) {
        historyList.innerHTML = `<li>No uploads yet.</li>`;
        return;
    }
    
    history.forEach((upload, i) => {
        const li = document.createElement('li');
        li.textContent = `${upload.timestamp} - ${upload.filename} - ${upload.studyCount} studies`;
        historyList.appendChild(li);

        //
        //
        // !!!! ADD UL FOR STYLING + REMOVE BUTTON
        //
        //

    });
}

// makes sure the uploadHistory pops up when loaded
window.onload = function() {
    renderUploadHistory();
};