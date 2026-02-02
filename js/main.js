const rand = function(min, max) {
  return Math.random() * ( max - min ) + min;
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
const toggleInput = document.querySelector('.toggle-switch input');

let animationId; 
let isAnimating = true; 

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = true;

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.imageSmoothingEnabled = true;
  items.forEach(item => {
      if (item.x > canvas.width) item.x = canvas.width;
      if (item.y > canvas.height) item.y = canvas.height;
  });
});

let backgroundColors = [ '#f5f2ed', '#ebe7df' ];
let colors = [
  [ '#cfc7b9', "#b8af9d" ],
  [ '#d4d9cc', '#98CE44' ],
  [ '#d9c9b6' ,'#c2b09b' ]
];

let items = [];
const blurRange = [30, 60];
const radiusRange = [50, 180];

function initItems() {
    items = [];
    let count = 20;
    while(count--) {
        let thisRadius = rand( radiusRange[0], radiusRange[1] );
        let thisBlur = rand( blurRange[0], blurRange[1] );
        let x = rand( -100, canvas.width + 100 );
        let y = rand( -100, canvas.height + 100 );
        let colorIndex = Math.floor(rand(0, 299) / 100);
        
        items.push({
          x: x, y: y,
          blur: thisBlur,
          radius: thisRadius,
          initialXDirection: Math.round(rand(-99, 99) / 100),
          initialYDirection: Math.round(rand(-99, 99) / 100),
          initialBlurDirection: Math.round(rand(-99, 99) / 100),
          colorOne: colors[colorIndex][0],
          colorTwo: colors[colorIndex][1],
          gradient: [ x - thisRadius / 2, y - thisRadius / 2, x + thisRadius, y + thisRadius ],
        });
    }
}
initItems();

function changeCanvas() {
  if (!isAnimating) return; 

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'lighter';

  let adjX = 2;
  let adjY = 2;
  let adjBlur = 1;

  items.forEach(function(item) {
      if(item.x + (item.initialXDirection * adjX) >= canvas.width || item.x + (item.initialXDirection * adjX) <= 0) {
        item.initialXDirection *= -1;
      }
      if(item.y + (item.initialYDirection * adjY) >= canvas.height || item.y + (item.initialYDirection * adjY) <= 0) {
        item.initialYDirection *= -1;
      }
      if(item.blur + (item.initialBlurDirection * adjBlur) >= radiusRange[1] || item.blur + (item.initialBlurDirection * adjBlur) <= radiusRange[0]) {
        item.initialBlurDirection *= -1;
      }
    
      item.x += (item.initialXDirection * adjX);
      item.y += (item.initialYDirection * adjY);
      item.blur += (item.initialBlurDirection * adjBlur);

      ctx.beginPath();
      ctx.filter = `blur(${item.blur}px)`;
      let grd = ctx.createLinearGradient(item.gradient[0], item.gradient[1], item.gradient[2], item.gradient[3]);
      grd.addColorStop(0, item.colorOne);
      grd.addColorStop(1, item.colorTwo);
      ctx.fillStyle = grd;
      ctx.arc( item.x, item.y, item.radius, 0, Math.PI * 2 );
      ctx.fill();
      ctx.closePath();
  });
  animationId = window.requestAnimationFrame(changeCanvas);
}

// --- スイッチ切り替え指示 ---
function updateMode() {
    if (toggleInput.checked) {
        // ON: Visualモード (背景停止・指定要素の非表示)
        document.body.classList.add('is-visual-mode');
        isAnimating = false;
        cancelAnimationFrame(animationId);
        
        // 背景色を単色（グレージュ系）に変更
        document.body.style.backgroundColor = '#f5f2ed'; 
    } else {
        // OFF: Listモード (背景アニメ再開・全要素表示)
        document.body.classList.remove('is-visual-mode');
        isAnimating = true;
        
        // 元の背景色に戻す
        document.body.style.backgroundColor = '#fff';
        
        // 二重起動を防止してアニメーション再開
        cancelAnimationFrame(animationId);
        animationId = window.requestAnimationFrame(changeCanvas);
    }
}

// イベントリスナーの登録
toggleInput.addEventListener('change', updateMode);

// ページ読み込み時の状態を即座に反映
updateMode();

function handleResize() {
    if (window.innerWidth < 768) {
        // モバイルサイズならビジュアルモードを強制解除
        document.body.classList.remove('is-visual-mode');
        // チェックボックスの状態もオフに戻す
        const toggle = document.querySelector('.toggle-switch input');
        if (toggle) toggle.checked = false;
    }
}

window.addEventListener('resize', handleResize);
handleResize(); // 初期実行


// --- 作品クリック時の表示切り替え処理 ---
const workItems = document.querySelectorAll('.work-item');
const mainDisplay = document.getElementById('js-main-display');
const displayImg = mainDisplay.querySelector('.displayImage');
const archiveTitle = document.querySelector('h1');
const textWrapper = document.querySelector('.text-wrapper');

// 1. リストの各項目をクリックした時の処理
workItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();

        // 【追加】すべての項目から is-selected を消してから、クリックしたものだけに付与
        workItems.forEach(el => el.classList.remove('is-selected'));
        item.classList.add('is-selected');

        const imgSrc = item.getAttribute('data-img');
        
        displayImg.src = imgSrc;
        mainDisplay.classList.add('is-active');
        
        archiveTitle.classList.add('is-hidden');

        if (textWrapper) {
            textWrapper.classList.add('is-hidden');
        }
    });
});

// 2. 「元に戻す」共通関数
function resetDisplay() {
    // メイン画像の非表示とタイトルの再表示
    mainDisplay.classList.remove('is-active');
    archiveTitle.classList.remove('is-hidden');

    // 左下のテキストを再表示する
    if (textWrapper) {
        textWrapper.classList.remove('is-hidden');
    }

    // --- ここを追加：リストの「▶︎」をすべて消す ---
    workItems.forEach(el => el.classList.remove('is-selected'));
}

// 3. 画面のどこをクリックしても戻るように設定
window.addEventListener('click', () => {
    if (mainDisplay.classList.contains('is-active')) {
        resetDisplay();
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.toggle-switch input');
    const body = document.body;
    const circleInner = document.getElementById('js-circle-inner');
    const workItems = document.querySelectorAll('.work-item');
    
    // もしHTMLにIDがない場合は、直上の親要素を取得するようにします
    if (!circleInner) {
        console.error("ID 'js-circle-inner' が見つかりません。HTMLに <div id='js-circle-inner' class='circle-inner'> があるか確認してください。");
        return;
    }

    let currentRotation = 0; 
    const totalItems = workItems.length;

    // 【修正】360度を枚数で割るのではなく、1枚あたりの間隔を広めに固定する
    // 例: 45度（Math.PI / 4）ずつ離す設定
    const angleStepRad = Math.PI / 4; 
    
    // 半径をさらに大きくして、カーブを緩やかにする
    let radius = window.innerWidth * 0.7; 

    const circleItems = [];

    // 1. 初期配置
    workItems.forEach((item, index) => {
        const imgSrc = item.getAttribute('data-img');
        const initialAngle = index * angleStepRad; // 広がった間隔で配置
        
        const div = document.createElement('div');
        div.className = 'circle-item';
        
        const img = document.createElement('img');
        img.src = imgSrc;
        div.appendChild(img);
        circleInner.appendChild(div);
        
        circleItems.push({
            element: div,
            angle: initialAngle
        });
    });

    // 2. 更新関数（透明度の減衰を強化して奥の重なりを消す）
    function updateGallery() {
        const rotationRad = (currentRotation * Math.PI) / 180;

        circleItems.forEach((item) => {
            const currentAngle = item.angle + rotationRad;
            const x = Math.cos(currentAngle) * radius;
            const y = Math.sin(currentAngle) * radius;

            // --- ここを修正：x座標が一番左（手前）に来た時にzIndexが最大になるようにする ---
            // x は -radius から +radius まで動くので、(radius - x) とすると
            // x = -radius (最前面) のとき、zIndex = 2 * radius (最大) になります
            const zIndex = Math.round((radius - x) * 100); 
            
            const depthFactor = (x + radius) / (2 * radius); 
            const scale = 1.2 - (depthFactor * 0.8); 
            
            let opacity = 1.2 - (depthFactor * 1.5); 
            if (opacity > 1) opacity = 1;
            if (opacity < 0) opacity = 0;

            item.element.style.zIndex = zIndex; // 反映
            item.element.style.opacity = opacity;
            item.element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            
            item.element.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
        });
    }

    // リサイズ設定は元のシンプルなものに戻す（または削除）
    window.addEventListener('resize', () => {
        radius = window.innerWidth * 0.9; // 半径は広げすぎず標準に戻す
        updateGallery();
    });

    // 3. クリックイベント（回転角度を angleStepRad に合わせる）
    document.addEventListener('click', (e) => {
        if (body.classList.contains('is-visual-mode')) {
            if (e.target.closest('.toggle-switch')) return;
            
            // 固定した間隔分（45度ずつ）きれいに回転させる
            currentRotation -= 45; 
            updateGallery();
        }
    });

    // ページ読み込み時に一度反映
    updateGallery();

    // 画面リサイズへの対応
    window.addEventListener('resize', () => {
        radius = window.innerWidth * 0.9;
        updateGallery();
    });
});

