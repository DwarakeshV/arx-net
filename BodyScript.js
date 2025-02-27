/* Add graph on enter key press */
const allGraphControls = document.querySelector('.allGraphControls');
document.getElementById('edges').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addGraph();
    }
});

/* Show controls common to all graphs on right click */
document.querySelector('.outliner').addEventListener('contextmenu', function (event) {
    event.preventDefault(); // Prevent the default context menu

    // Get the mouse position relative to the viewport
    const x = event.clientX - 50;
    const y = event.clientY - 10;

    // Get the dimensions of the viewport and the menu
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = allGraphControls.offsetWidth;
    const menuHeight = allGraphControls.offsetHeight;

    // Calculate the maximum allowed position to keep the menu within the viewport
    const maxX = viewportWidth - menuWidth;
    const maxY = viewportHeight - menuHeight;

    // Adjust the menu position to stay within bounds
    allGraphControls.style.left = `${Math.min(Math.max(x, 0), maxX)}px`;
    allGraphControls.style.top = `${Math.min(Math.max(y, 0), maxY)}px`;

    // Display the menu
    allGraphControls.style.display = 'block';
});

// Hide the menu when clicking outside
allGraphControls.addEventListener('mouseleave', function () {
    allGraphControls.style.display = 'none';
});
/* End of show controls common to all graphs on right click */

/* Add functionality to the controls */
document.getElementById('closeAll').addEventListener('click', function () {
    const outliner = document.querySelector('.outliner');
    outliner.querySelectorAll('.showHideDeleteDiv').forEach(item => {
        const eyeBtn = item.querySelector('button:nth-last-child(2)'); // Second last button is the visibility button
        if (eyeBtn && eyeBtn.querySelector('img')?.src.endsWith('show.png')) {
            eyeBtn.click();
        }
    });
    allGraphControls.style.display = 'none';
});

document.getElementById('showAll').addEventListener('click', function () {
    const outliner = document.querySelector('.outliner');
    outliner.querySelectorAll('.showHideDeleteDiv').forEach(item => {
        const eyeBtn = item.querySelector('button:nth-last-child(2)'); // Last button is the visibility button
        if (eyeBtn && eyeBtn.querySelector('img')?.src.endsWith('hide.png')) {
            eyeBtn.click();
        }
    });
    allGraphControls.style.display = 'none';
});

document.getElementById('clearAll').addEventListener('click', function () {
    if (confirm('Are you sure you want to delete all graphs? (This action cannot be undone)')) {
        document.querySelectorAll('.graphContainer').forEach(function (item) {
            item.remove();
        });
        document.querySelectorAll('.showHideDeleteDiv').forEach(function (item) {
            item.remove();
        });
    }
    allGraphControls.style.display = 'none';
});
/* End of add functionality to the controls */

const view4 = document.getElementById('view4');
const view9 = document.getElementById('view9');
let view4gen = false;
let view9gen = false;

view4.addEventListener('click', function () {
    const img = view4.getElementsByTagName('img')[0];
    if (img.src.endsWith('enable4g.png')) {
        img.src = 'disable4g.png';
        view4gen = false;
    } else {
        img.src = 'enable4g.png';
        view9.getElementsByTagName('img')[0].src = 'disable9g.png';
        view4gen = true;
        view9gen = false;
    }
    document.querySelectorAll('.graphContainer').forEach(function (item) {
        item.style.transform = 'scale(1)';
    });
});

view9.addEventListener('click', function () {
    const img = view9.getElementsByTagName('img')[0];
    if (img.src.endsWith('enable9g.png')) {
        img.src = 'disable9g.png';
        view9gen = false;
    } else {
        img.src = 'enable9g.png';
        view4.getElementsByTagName('img')[0].src = 'disable4g.png';
        view4gen = false;
        view9gen = true;
    }
    const newScale = 2/3;
    document.querySelectorAll('.graphContainer').forEach(function (item) {
        item.style.transform = `scale(${newScale})`;
    });
});
