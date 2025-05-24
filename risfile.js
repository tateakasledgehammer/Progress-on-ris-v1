// idk why I put this here
// const fileInput = document.getElementById('risFileInput');
// const file = fileInput.files[0];

// .addEventListener('change') - runs function everytime new file is picked up
// the change part runs the function every time a new file is picked
document.getElementById('risFileInput').addEventListener('change', function(event) {
    // go for the first file [0]
    const file = event.target.files[0];
    if (!file) return; // go back if there is nothing

    // create something to check the contents of a file
    // FileReader lets web apps read contents of files
    const reader = new FileReader ();

    // do function when the file has finished loading - we need to do something with it, so here is a function to get started
    reader.onload = function(e) {
    
        const content = e.target.result; // get text content of the file - gives it a const that stores it
            // the e.target.result contains the data in a long string
        const records = parseRIS(content); //parse the RIS text into a JS object
            // turns into
            // [
            // {
            //  TY: "JOUR",
            //  AU: ["Smith", "John"]
            //  TI: ["Title of the paper"]
            //  PY: ["2023"]
            // },
            // etc.

        // stringify formats it out nicer to read as above (idk where that goes)
        // (dataXXX, null, 2) is the common method
        //      null: used to skip a replacer function (we don't need to replace, so we write null)
        //      2: number of spaces to use for indentation
        //          increasing # would mean more indented - this would move it to the right more as it's techincally deeper in there - probably matters more when things more complex (capped at 10)
        //          don't want 0 as it gets all squished up
        // using 'output' puts it in the right spot
        //      output is a <pre> block which is the format for JSON
        // document - refers to the webpage currently loaded
        // .getElementByID('output') - finds element in HTML with the ID output (it's a <pre>)
        // .textContent - gets the text inside the element (preserves the text but doesn't render HTML) - similar to .innerText but doesn't style it all. .textContent is RAW
        document.getElementById('output').textContent = JSON.stringify(records, null, 2) // display parsed result
    };

    // start reading the file
    reader.readAsText(file); // file = event.target.files[0];
});

// this is JSDoc comment which helps to understand each function
// now if you hover over the below function it will say what's in the bit below
/**
 * Parses RIS-formatted text into JavaScript objects
 *  @param {string} text - The content of a .ris file
 *  @returns {Array} Array of parsed RIS records
 * this says there is a parameter (what is in the .ris file) and there is something to array (array of the records from those files)
 */

function parseRIS(text) {
    // regex
    // this is commonly used to split text into lines
    // \r is a carriage return (?)
    // \n is a Line Feed or newline
    // \r?\n matches \n with or without a preceding /r
    // ? means '0 or 1'
    const lines = text.split(/\r?\n/);

    const records = []; // empty array for entries to be parsed into
    // const used as just gets added to

    let entry = {}; // creates empty object to hold a single entry
    // let used as can be updated
    // object means we can see the keys (labels) (i.e. TY: "JOUR", rather than an array which would just have "JOUR")

    // let line of lines loops through every line of the RIS file
    for (let line of lines) {
        if (line.trim() === '') continue; // skips empty lines (if there is whitespace at start or end)
    }

    const tag = line.slice(0, 2); // gets TY, AU, TI
    const value = line.slice(6).trim(); // data after 6th character (TY - ) - trim() here also clears any extra bits

    if (tag === 'TY') {
        entry = { TY: value }; // adds to the new entry
    }
}