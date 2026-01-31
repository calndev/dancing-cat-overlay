const { ipcRenderer } = require('electron');

const catGif = document.getElementById('cat-gif');
const assetsPath = 'assets/';
const cats = [
    'cat1.gif',
    'cat2.gif',
    'cat3.gif',
    'cat4.gif',
    'cat5.gif',
    'cat6.gif',
    'cat7.gif'
];

let currentIndex = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
const clickThreshold = 5;

cats.forEach(cat => {
    const img = new Image();
    img.src = `${assetsPath}${cat}`;
});

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
    }
});

catGif.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    startX = e.screenX;
    startY = e.screenY;
    isDragging = false;
});

document.addEventListener('mouseup', (e) => {
    if (e.button !== 0) return;

    if (!isDragging && !e.ctrlKey) {
        cycleCat();
    }
    isDragging = false;
});

document.addEventListener('mousemove', (e) => {
    if (e.ctrlKey && (e.buttons === 1)) {
        const deltaX = e.screenX - startX;
        const deltaY = e.screenY - startY;

        if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
            isDragging = true;
            try {
                ipcRenderer.send('window-move', { x: deltaX, y: deltaY });

                startX = e.screenX;
                startY = e.screenY;
            } catch (err) {
                console.error(err);
            }
        }
    }
});

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ipcRenderer.send('show-context-menu');
});

function cycleCat() {
    currentIndex = (currentIndex + 1) % cats.length;
    catGif.src = `${assetsPath}${cats[currentIndex]}`;
}a
