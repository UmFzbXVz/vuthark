const runeMap = {
    'a': 'ᚨ', 'á': 'ᚨ', 'ä': 'ᚨ',
    'b': 'ᛒ',
    'c': 'ᚲ', 'k': 'ᚲ',
    'd': 'ᛞ',
    'e': 'ᛖ', 'é': 'ᛖ',
    'f': 'ᚠ',
    'g': 'ᚷ',
    'h': 'ᚺ',
    'i': 'ᛁ', 'í': 'ᛁ',
    'j': 'ᛃ',
    'l': 'ᛚ',
    'm': 'ᛗ',
    'n': 'ᚾ',
    'o': 'ᛟ', 'ó': 'ᛟ', 'ö': 'ᛟ',
    'p': 'ᛈ',
    'q': 'ᚲ',
    'r': 'ᚱ',
    's': 'ᛊ',
    't': 'ᛏ',
    'u': 'ᚢ', 'ú': 'ᚢ',
    'v': 'ᚹ', 'w': 'ᚹ',
    'x': 'ᚲᛊ',
    'y': 'ᛁ',
    'z': 'ᛉ',
    'æ': 'ᛇ',
    'þ': 'ᚦ', 'ð': 'ᚦ', 'th': 'ᚦ',
    'ŋ': 'ᛜ', 'ng': 'ᛜ',
};

function translateToRunes(text) {
    text = text.toLowerCase();
    let runes = [];
    let i = 0;
    while (i < text.length) {
        if (i + 1 < text.length && ['th', 'ng'].includes(text.substring(i, i + 2))) {
            const digraph = text.substring(i, i + 2);
            runes.push(runeMap[digraph] || text[i]);
            i += 2;
        } else {
            runes.push(runeMap[text[i]] || text[i]);
            i += 1;
        }
    }
    return runes.join('');
}

const input = document.getElementById('input');
const horizontal = document.getElementById('horizontal');
const canvas = document.getElementById('vertical-canvas');
const ctx = canvas.getContext('2d');

const lineHeightFactor = 0.70;
const leftPadding = 20;
const runePercentOffsets = {
    'ᚾ': -11,
    'ᚷ': 9,
    'ᛟ': 5,
    'ᛊ': 0,
    'ᛖ':-0.8,
    'ᛞ':-0.8,
    'ᛁ':-0.1,
    'ᛉ':9,
    'ᛇ': 12.5,
    'ᛏ': 13,
    'ᚢ': -1.5
};
const runeWidthScales = {
    'ᛖ': 1.055,
    'ᚷ': 1.0,
    'ᛞ': 1.06,
    'ᛉ': 0.94,
    'ᛟ': 1.14,
    'ᛏ': 0.97,
    'ᚢ': 1.135
};

let userRuneOffsets = [];

function drawVerticalRunes() {
    const runes = translateToRunes(input.value);
    const displayRunes = runes || 'ᛁᚱᛗᛖᚠ';

    if (userRuneOffsets.length !== displayRunes.length) {
        userRuneOffsets = new Array(displayRunes.length).fill(0);
    }

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    ctx.clearRect(0, 0, width, height);

    let runeSize = Math.floor(height / displayRunes.length * 1.2);
    runeSize = Math.max(runeSize, 20);
    runeSize = Math.min(runeSize, 120);
    ctx.font = `${runeSize}px 'Noto Sans Runic', Arial, sans-serif`;
    ctx.fillStyle = '#ddd';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    let maxRuneWidth = 0;
    for (const rune of displayRunes) {
        const scale = runeWidthScales[rune] || 1.0;
        const metrics = ctx.measureText(rune);
        const scaledWidth = metrics.width * scale;
        if (scaledWidth > maxRuneWidth) {
            maxRuneWidth = scaledWidth;
        }
    }

    const columnWidth = maxRuneWidth + leftPadding * 2;
    const columnStartX = (width - columnWidth) / 2;
    const runeStartX = columnStartX + leftPadding;

    const totalRuneHeight = displayRunes.length * runeSize * lineHeightFactor;
    let y = (height - totalRuneHeight) / 2 + (runeSize * lineHeightFactor / 2);

    for (let i = 0; i < displayRunes.length; i++) {
        const rune = displayRunes[i];
        const percentOffset = runePercentOffsets[rune] || 0;
        const pixelOffset = (percentOffset / 100) * runeSize;
        const baseX = runeStartX + pixelOffset;
        const userOffset = userRuneOffsets[i] || 0; 
        const finalX = baseX + userOffset;

        const scale = runeWidthScales[rune] || 1.0;

        ctx.save();
        ctx.translate(finalX, y);
        ctx.scale(scale, 1);
        ctx.fillText(rune, 0, 0);
        ctx.restore();

        y += runeSize * lineHeightFactor;
    }
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    drawVerticalRunes();
}

function updateHorizontal() {
    const runes = translateToRunes(input.value);
    horizontal.textContent = runes || 'ᛁᚱᛗᛖᚠ';
}

function updateAll() {
    updateHorizontal();
    drawVerticalRunes(); 
}

let isDragging = false;
let draggedRuneIndex = -1;
let startX = 0;
let startOffset = 0;

function getEventPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    return clientX - rect.left;
}

function getRuneIndexFromY(clientY) {
    const rect = canvas.getBoundingClientRect();
    const y = clientY - rect.top;

    const runes = translateToRunes(input.value) || '';
    const height = canvas.offsetHeight;
    let runeSize = Math.floor(height / runes.length * 1.2);
    runeSize = Math.max(runeSize, 20);
    runeSize = Math.min(runeSize, 120);

    const totalRuneHeight = runes.length * runeSize * lineHeightFactor;
    let startY = (height - totalRuneHeight) / 2 + (runeSize * lineHeightFactor / 2);

    for (let i = 0; i < runes.length; i++) {
        const runeTop = startY + i * runeSize * lineHeightFactor - runeSize * lineHeightFactor / 2;
        const runeBottom = runeTop + runeSize * lineHeightFactor;
        if (y >= runeTop && y <= runeBottom) {
            return i;
        }
    }
    return -1;
}

function startDrag(e) {
    e.preventDefault();
    const x = getEventPos(e);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const index = getRuneIndexFromY(clientY);
    if (index !== -1) {
        isDragging = true;
        draggedRuneIndex = index;
        startX = x;
        startOffset = userRuneOffsets[index] || 0;
    }
}

function moveDrag(e) {
    if (!isDragging) return;
    e.preventDefault();

    const x = getEventPos(e);
    const deltaX = x - startX;
    const newOffset = startOffset + deltaX;

    userRuneOffsets[draggedRuneIndex] = Math.max(-100, Math.min(100, newOffset));

    drawVerticalRunes();
}

function endDrag() {
    isDragging = false;
    draggedRuneIndex = -1;
}

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('touchstart', startDrag, { passive: false });

canvas.addEventListener('mousemove', moveDrag);
canvas.addEventListener('touchmove', moveDrag, { passive: false });

canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mouseleave', endDrag);
canvas.addEventListener('touchend', endDrag);
canvas.addEventListener('touchcancel', endDrag);

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
input.addEventListener('input', updateAll);

resizeCanvas();
updateHorizontal();
