const rand = (min, max) => Math.random() * (max - min) + min;
const canvas = document.getElementById('canvas');
const ctx = canvas?.getContext('2d');
const toggleInput = document.querySelector('.toggle-switch input');

let animationId; 
let isAnimating = true; 
let items = [];

const colors = [['#cfc7b9', "#b8af9d"], ['#d4d9cc', '#98CE44'], ['#d9c9b6', '#c2b09b']];
const radiusRange = [150, 250]; // ぼかしがない分、少し大きくすると迫力が出ます
const gridContainer = document.createElement('div');
gridContainer.id = 'bg-image-grid-right';
document.body.appendChild(gridContainer);

function initCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    items = [];
    // 円の数は以前の効果を維持しつつ調整　(スマホの数):(PCの数);
    let count = window.innerWidth < 768 ? 6 : 16; 

    for (let i = 0; i < count; i++) {
        let radius = rand(radiusRange[0], radiusRange[1]);
        let colorIndex = Math.floor(rand(0, 3));
        items.push({
            x: rand(0, canvas.width),
            y: rand(0, canvas.height),
            radius,
            // 動きを少し強く（1.2〜1.5倍程度にアップ）
            initialXDirection: rand(-1.2, 1.2),
            initialYDirection: rand(-1.2, 1.2),
            colorOne: colors[colorIndex][0],
            colorTwo: colors[colorIndex][1]
        });
    }
}

function draw() {
    if (!isAnimating || !ctx) return; 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // これが重なった時に白く光るための重要な設定
    ctx.globalCompositeOperation = 'lighter';

    items.forEach(item => {
        // 壁での跳ね返り判定
        if(item.x >= canvas.width + item.radius || item.x <= -item.radius) item.initialXDirection *= -1;
        if(item.y >= canvas.height + item.radius || item.y <= -item.radius) item.initialYDirection *= -1;

        item.x += item.initialXDirection;
        item.y += item.initialYDirection;

        // グラデーションで「ぼかし」と「発光」を表現
        let grd = ctx.createRadialGradient(
            item.x, item.y, 0,           // 中心
            item.x, item.y, item.radius  // 外周
        );
        
        // 中心の色（不透明）
        grd.addColorStop(0, item.colorOne);
        // 中間点の色
        grd.addColorStop(0.3, item.colorTwo);
        // 外側に向かって完全に透明にする（これでぼけて見える）
        grd.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.fillStyle = grd;
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
    animationId = requestAnimationFrame(draw);
}

/* --- 2. モード切り替え & グリッド制御 --- */
function updateMode() {
    if (toggleInput && toggleInput.checked) {
        document.body.classList.add('is-visual-mode');
        gridContainer.classList.add('is-active');
        isAnimating = false;
        cancelAnimationFrame(animationId);
    } else {
        document.body.classList.remove('is-visual-mode');
        gridContainer.classList.remove('is-active');
        if (!isAnimating) {
            isAnimating = true;
            draw();
        }
    }
}

/* --- 3. UI操作系 --- */
const workItems = document.querySelectorAll('.work-item');
const mainDisplay = document.getElementById('js-main-display');
const displayImg = mainDisplay?.querySelector('.displayImage');

function resetDisplay() {
    mainDisplay?.classList.remove('is-active');
    workItems.forEach(el => el.classList.remove('is-selected'));
}

function initBackgroundGrid() {
    gridContainer.innerHTML = ''; 
    workItems.forEach((item, index) => {
        if(index >= 16) return;
        const imgPath = item.getAttribute('data-img');
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        const img = document.createElement('img');
        img.src = imgPath;
        gridItem.appendChild(img);
        gridContainer.appendChild(gridItem);

        gridItem.addEventListener('click', (e) => {
            e.stopPropagation();
            if (displayImg) {
                displayImg.src = imgPath;
                mainDisplay.classList.add('is-active');
            }
        });
    });
}

// イベント設定
if (toggleInput) {
    toggleInput.addEventListener('change', updateMode);
}

workItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        resetDisplay();
        item.classList.add('is-selected');
        if (displayImg) {
            displayImg.src = item.getAttribute('data-img');
            mainDisplay.classList.add('is-active');
        }
    });
});

window.addEventListener('click', resetDisplay);

// リサイズ処理（debounce）
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        initCanvas();
        if (window.innerWidth < 768 && toggleInput) {
            toggleInput.checked = false;
            updateMode();
        }
    }, 250);
});

// 全体の初期化実行
initCanvas();
initBackgroundGrid();
updateMode(); // これにより初期の isAnimating 状態が決定される
if (isAnimating) draw();