// ================== 共通：UIスケール ==================
function scaleUI() {
  const baseWidth = 1920;
  const baseHeight = 1080;

  const scaleX = window.innerWidth / baseWidth;
  const scaleY = window.innerHeight / baseHeight;

  const scale = Math.min(scaleX, scaleY);

  const ui = document.getElementById("background_edge");
  ui.style.transform = `scale(${scale})`;

  const offsetX = (window.innerWidth - baseWidth * scale) / 2;
  const offsetY = (window.innerHeight - baseHeight * scale) / 2;

  ui.style.left = "0px";
  ui.style.top = "0px";
}

window.addEventListener("resize", scaleUI);
window.addEventListener("load", scaleUI);

// ================== 右側ボタンの見た目だけ ==================
const btnB1 = document.getElementById("B1"); // 知力スタートボタン
const btnC1 = document.getElementById("C1");
const btnD1 = document.getElementById("D1"); // ← ここを修正！

// ヘルプ画像の要素を取得（idを修正）
// ヘルプ画像の要素を取得（HTMLのIDに合わせる）
// ヘルプ要素の取得
const helpVideo = document.getElementById("HelpS");  // IDをHelpSに修正
const helpStatic = document.getElementById("HelpStatic");

let isC1Locked = false;
let isD1Locked = false;

// C1ボタン
btnC1.addEventListener("click", () => {
  if (isC1Locked) return;
  isC1Locked = true;
  btnC1.src = "texture/C2.png";
  applyCPenalty();
  setTimeout(() => {
    btnC1.src = "texture/C1.png";
    isC1Locked = false;
  }, 300);
});

let animationDirection = 'reverse'; // 10→1 か 1→10 の切り替え

// 初回表示フラグ（ローカルストレージから読み込み）
let isFirstTime = !localStorage.getItem('helpShown');

// ページ読み込み完了時の処理
// ================== 緊急デバッグ ==================
// window.loadの直後に実行
window.addEventListener('load', () => {
  if (isFirstTime) {
    helpStatic.style.display = "block";
    console.log('📺【静止画】表示中');
  } else {
    helpStatic.style.display = "none";
    console.log('📺【静止画】非表示');
  }
  helpF.style.display = "none";
  
  // ★ 強制確認：1秒後にもう一度チェック
  setTimeout(() => {
    const currentDisplay = window.getComputedStyle(helpStatic).display;
    console.log('🔍 1秒後の実際のdisplay:', currentDisplay);
    console.log('🔍 style.displayプロパティ:', helpStatic.style.display);
    console.log('🔍 isFirstTimeの値:', isFirstTime);
  }, 1000);
});

// さらに、何かが上書きしていないか監視
const originalSet = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style').set;
Object.defineProperty(HTMLElement.prototype, 'style', {
  set: function(value) {
    if (this.id === 'HelpStatic' && value.display === 'none') {
      console.trace('⚠️ HelpStatic が none に設定されました');
    }
    originalSet.call(this, value);
  }
});
// 初回用：静止画クリックでアニメーション開始（初回のみ）
helpStatic.addEventListener("click", function onClick() {
  if (isFirstTime) {
    // イベントを一度だけ実行するために削除
    helpStatic.removeEventListener("click", onClick);
    // 強制的に開始時アニメーション（S:1→10）にする
    animationDirection = 'forward'; // 1→10（S）に設定
    startAnimation(true); // true = 初回演出（ボタンを変更しない）
    
    // 初回表示済みをローカルストレージに保存（次回以降は表示しない）
    localStorage.setItem('helpShown', 'true');
    console.log('📺【静止画】非表示'); // ← 追加
  }
});

// ================== D1ボタンの完全制御（修正版2） ==================
function setupD1Button() {
  const d1 = document.getElementById('D1');
  if (!d1) return;
  
  // 永久抹消済みチェック
  const permanentlyGone = localStorage.getItem('helpButtonGone') === 'true';
  if (permanentlyGone) {
    console.log('D1は永久抹消済み - 削除します');
    d1.remove();
    return;
  }
  
  // 古いイベントを全て削除
  const newD1 = d1.cloneNode(true);
  d1.parentNode.replaceChild(newD1, d1);
  
  newD1.addEventListener('click', function d1Click(e) {
    e.stopPropagation();
    
    const allRemoved = screwIds.every(id => 
      localStorage.getItem(`screw_${id}`) === 'true'
    );
    
    const fadeOutDone = localStorage.getItem('helpButtonGone') === 'true';
    
    console.log('📊 D1クリック:', { allRemoved, fadeOutDone });
    
    if (allRemoved && !fadeOutDone) {
      // ★ help静止画を強制的に再取得
      const helpStatic = document.getElementById('HelpStatic');
      console.log('🔍 helpStatic:', helpStatic);
      
      // ★ 表示状態を強制チェック
      let isHelpVisible = false;
      if (helpStatic) {
        // style属性と計算値の両方をチェック
        const styleDisplay = helpStatic.style.display;
        const computedDisplay = window.getComputedStyle(helpStatic).display;
        console.log('📐 display - style:', styleDisplay, 'computed:', computedDisplay);
        
        isHelpVisible = (styleDisplay === 'block' || computedDisplay === 'block');
      }
      
      console.log('🖼️ 判定結果:', isHelpVisible ? '表示中' : '非表示');
      
      if (isHelpVisible) {
        console.log('🎬 Sアニメーション開始');
        
        // 強制的にSアニメーション
        animationDirection = 'forward';
        
        // 静止画を隠す
        helpStatic.style.display = 'none';
        helpF.style.display = 'block';
        
        // 直接アニメーション
        let frame = 1;
        function playS() {
          helpF.src = `texture/HELPanimation/${frame}.png`;
          frame++;
          
          if (frame <= 10) {
            setTimeout(playS, 41);
          } else {
            helpF.style.display = 'none';
            console.log('Sアニメーション終了 - フェードアウト');
            
            // フェードアウト
            let opacity = 1;
            const fadeInterval = setInterval(() => {
              opacity -= 0.1;
              newD1.style.opacity = opacity;
              
              if (opacity <= 0) {
                clearInterval(fadeInterval);
                newD1.style.display = 'none';
                localStorage.setItem('helpButtonGone', 'true');
                console.log('✅ D1永久抹消完了');
                startFadeAnimation();
              }
            }, 50);
          }
        }
        playS();
        
      } else {
        console.log('D1永久抹消開始');
        let opacity = 1;
        const fadeInterval = setInterval(() => {
          opacity -= 0.1;
          newD1.style.opacity = opacity;
          
          if (opacity <= 0) {
            clearInterval(fadeInterval);
            newD1.style.display = 'none';
            localStorage.setItem('helpButtonGone', 'true');
            console.log('✅ D1永久抹消完了');
            startFadeAnimation();
          }
        }, 50);
      }
      
    } else if (!allRemoved) {
      console.log('通常help演出');
      if (typeof startAnimation === 'function') {
        startAnimation(false);
      }
    }
  });
  
  if (typeof btnD1 !== 'undefined') {
    btnD1 = newD1;
  }
}

// アニメーション開始共通関数
function startAnimation(isFirstTimeClick = false) {
  if (isD1Locked) return;
  
  isD1Locked = true;
  
  // 初回演出でなければボタンの画像を変更
  if (!isFirstTimeClick) {
    btnD1.src = "texture/D2.png";
  }

  // 静止画を隠す（アニメーション中は隠す）
  helpStatic.style.display = "none";

  if (isFirstTimeClick) {
    fadeOutEdgeNo(); // 初回演出時のみ実行
  }

  helpF.style.display = "block";

  // 開始フレームと終了フレームを設定
  let startFrame, endFrame, nextFrame;
  const isFinish = animationDirection === 'reverse'; // reverseがF（終了時）
  
  if (isFinish) {
    // 10→1（F：終了時アニメーション）
    startFrame = 10;
    endFrame = 1;
    nextFrame = (frame) => frame - 1;
    animationDirection = 'forward';
  } else {
    // 1→10（S：開始時アニメーション）
    startFrame = 1;
    endFrame = 10;
    nextFrame = (frame) => frame + 1;
    animationDirection = 'reverse';
  }

  let frame = startFrame;

  function play() {
    helpF.src = `texture/HELPanimation/${frame}.png`;
    
    if (frame !== endFrame) {
      frame = nextFrame(frame);
      setTimeout(play, 41);
    } else {
      // 最終フレームを表示したら少し待って終了
      setTimeout(() => {
        helpF.style.display = "none";
        
        // 初回フラグをfalseに設定
        isFirstTime = false;
        
        // 終了時アニメーション（F）の場合に静止画を表示
        if (isFinish) {  
          helpStatic.style.display = "block";
        }
        // S（開始時）の場合は何もしない = 静止画は表示されない
        
        // 初回演出でなければボタンの画像を戻す
        if (!isFirstTimeClick) {
          btnD1.src = "texture/D1.png";
        }
        
        isD1Locked = false;
      }, 41);
    }
  }

  play();
}

// 初回helpが消えるタイミング（既存のコード内）で呼び出す
// fadeOutEdgeN

// ================== ねじの演出 ==================
const screwIds = ['De', 'In', 'Gr'];
let screwsRemoved = 0;

// ねじの初期化（最優先）
function initScrews() {
  console.log('ねじ初期化開始');
  
  screwIds.forEach(id => {
    const screw = document.getElementById(id);
    if (!screw) {
      console.error(`ねじ ${id} なし`);
      return;
    }
    
    // ローカルストレージから状態復元
    const removed = localStorage.getItem(`screw_${id}`) === 'true';
    if (removed) {
      screw.style.display = 'none';
      screwsRemoved++;
    }
    
    // ねじのクリックイベント（最優先）
    screw.addEventListener('click', function screwClick(e) {
      e.stopPropagation(); // イベントの伝播を止める
      console.log(`ねじ ${id} クリック`);
      
      // 既に消えていれば何もしない
      if (localStorage.getItem(`screw_${id}`) === 'true') return;
      
      // ねじを消す
      this.style.display = 'none';
      localStorage.setItem(`screw_${id}`, 'true');
      screwsRemoved++;
      
      // 3つ消えたかチェック
      if (screwsRemoved === 3) {
        console.log('3つのねじが消えました');
        if (screwsRemoved === 3) {console.log('3つのねじが消えました');forceCloseHelpIfVisible();}
      }
    });
  });
  
  // Emの初期化
  const em = document.getElementById('Em');
  if (em) {
    const emAppeared = localStorage.getItem('screw_Em_appeared') === 'true';
    em.style.opacity = emAppeared ? '1' : '0';
    
    em.addEventListener('click', function emClick(e) {
      e.stopPropagation();
      
      if (screwsRemoved === 3) {
        this.style.opacity = '1';
        localStorage.setItem('screw_Em_appeared', 'true');
      }
    });
  }
  
  console.log(`現在の削除数: ${screwsRemoved}`);
}

// ================== D1ボタンの完全制御（永続的非表示版） ==================
function setupD1Button() {
  const d1 = document.getElementById('D1');
  if (!d1) return;
  
  // ★ 最も優先：ローカルストレージをチェック（永久抹消フラグ）
  const permanentlyGone = localStorage.getItem('helpButtonGone') === 'true';
  
  if (permanentlyGone) {
    console.log('D1は永久抹消済み - 完全に削除');
    d1.remove(); // DOMから完全に消す
    return;
  }
  
  d1.addEventListener('click', function d1Click(e) {
    e.stopPropagation();
    console.log('D1クリック');
    
    const allRemoved = screwIds.every(id => 
      localStorage.getItem(`screw_${id}`) === 'true'
    );
    
    if (allRemoved) {
      // 仮A状態：フェードアウトして永久抹消
      console.log('D1永久抹消開始');
      let opacity = 1;
      const fadeInterval = setInterval(() => {
        opacity -= 0.1;
        d1.style.opacity = opacity;
        
        if (opacity <= 0) {
          clearInterval(fadeInterval);
          d1.remove(); // DOMから完全削除
          localStorage.setItem('helpButtonGone', 'true'); // 永久抹消フラグ
          console.log('✅ D1永久抹消完了');
          startFadeAnimation();
        }
      }, 50);
      
    } else {
      // 通常時：help演出
      console.log('通常help演出');
      if (typeof startAnimation === 'function') {
        startAnimation(false);
      }
    }
  });
}

// 実行順序を明確に
document.addEventListener('DOMContentLoaded', () => {
  // 1. まずねじを初期化
  initScrews();
  
  // 2. その後にD1ボタンを設定
  setupD1Button();
  
  // デバッグボタン
  if (typeof ENABLE_SCREW_DEBUG_BUTTON !== 'undefined' && ENABLE_SCREW_DEBUG_BUTTON) {
    setTimeout(() => createDebugScrewButton(), 500);
  }
});
// ================== 強制ヘルプクローズ関数 ==================
function forceCloseHelpIfVisible() {
  // 直接DOMから取得（変数に依存しない）
  const helpStatic = document.getElementById('HelpStatic');
  const helpF = document.getElementById('helpF');
  
  // 要素がなければ終了
  if (!helpStatic || !helpF) return;

  // 現在の表示状態を確実にチェック（styleと計算値の両方）
  const isVisible = helpStatic.style.display === 'block' || 
                    window.getComputedStyle(helpStatic).display === 'block';

  if (isVisible) {
    console.log('🔧 ねじ3つ消去: ヘルプ表示中 → 強制終了');
    
    // 静止画を非表示にし、アニメーション開始
    helpStatic.style.display = 'none';
    helpF.style.display = 'block';

    let frame = 1;
    function playS() {
      helpF.src = `texture/HELPanimation/${frame}.png`;
      frame++;
      if (frame <= 10) {
        setTimeout(playS, 41);
      } else {
        helpF.style.display = 'none';
        console.log('✅ 強制終了完了');
      }
    }
    playS();
  }
}

const SHOW_RESET_BUTTON = false;

// リセットボタン
if (SHOW_RESET_BUTTON) {
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'testリセット';
  resetBtn.style.position = 'fixed';
  resetBtn.style.bottom = '20px';
  resetBtn.style.right = '20px';
  resetBtn.style.zIndex = '9999';
  resetBtn.style.padding = '8px 16px';
  resetBtn.style.backgroundColor = '#ffffff';
  
  resetBtn.addEventListener('click', () => {
    // 全て削除
    localStorage.removeItem('screw_De');
    localStorage.removeItem('screw_In');
    localStorage.removeItem('screw_Gr');
    localStorage.removeItem('screw_Em_appeared');
    localStorage.removeItem('helpButtonGone'); // 新しいキー
    location.reload();
    localStorage.removeItem('edgeNoFaded'); 
    localStorage.removeItem('helpShown');
  });
  
  document.body.appendChild(resetBtn);
}
// ================== Dボタン消滅アニメーション ==================
let animationFrame = 1;  // 現在のフレーム (1〜250)
let animationActive = false;  // アニメーション再生中フラグ
const MAX_FRAME = 250;

// アニメーション画像を表示する要素を作成
function createAnimationElement() {

  const img = document.createElement('img');
  img.id = 'Earthanimation';
  img.src = 'texture/Earthanimation/001.png';  // 待機状態
  img.style.position = 'absolute';
  img.style.transform = 'translateY(32px)';
  img.style.right = '32px';
  img.style.width = '306px';
  img.style.height = 'auto';
  img.style.zIndex = '18';
  document.getElementById('background_edge').appendChild(img);
  return img;
}

// アニメーション開始
function startFadeAnimation() {
  if (animationActive) return;
  
  animationActive = true;
  animationFrame = 1;
  
  let animImg = document.getElementById('Earthanimation');
  if (!animImg) {
    animImg = createAnimationElement();
  }
  
  animImg.style.display = 'block';
  
  function playFrame() {
    if (!animationActive) return;
    
    // フレーム番号を3桁ゼロ埋め
    const frameNum = String(animationFrame).padStart(3, '0');
    animImg.src = `texture/Earthanimation/${frameNum}.png`;
    animationFrame++;
    
    if (animationFrame <= 250) {
      setTimeout(playFrame, 1000 / 24); // 24fps = 約41.67ms
    } else {
      // アニメーション終了
      animationActive = false;
      showHealTheEarth();
       localStorage.setItem("earth_healed", "true");
      animImg.style.display = 'none';
    }
  }
  
  playFrame();
}


// C1の重複イベントは削除
// C1ボタンのクリックイベント（既存のものと統合）
btnC1.addEventListener("click", () => {
  if (isC1Locked) return; // ロック中は処理しない
  applyCPenalty();
});


// ================== タイマー＆ポイント方式2 ==================

const TYPES = ["tech", "int"];

// 各 type ごとの状態
const state = {
  tech: {
    isRunning: false,
    isLocked: false,
    isHourButtonsLocked: false,
    timerInterval: null,
    pointInterval: null,
    emergencyReady: false,
    emergencyCrackEl: null,
    emergencyClickCount: 0,
    emergencyTimer: null,
    skillBlinkInterval: null,
    point: 0,
    currentDigit: 1
  },
  int: {
    isRunning: false,
    isLocked: false,
    isHourButtonsLocked: false,
    timerInterval: null,
    pointInterval: null,
    emergencyReady: false,
    emergencyCrackEl: null,
    emergencyClickCount: 0,
    emergencyTimer: null,
    skillBlinkInterval: null,
    point: 0,
    currentDigit: 1
  }
};

// DOM ヘルパー
function getBlock(type) {
  return document.querySelector(`.skill-block[data-type="${type}"]`);
}
function getHourButtons(type) {
  return getBlock(type).querySelectorAll(".hour-btn");
}
function getTimerDisplay(type) {
  return getBlock(type).querySelector(".timer-display");
}
function getBarTrue(type) {
  return getBlock(type).querySelector(".bar-true");
}
function getBarBlack(type) {
  return getBlock(type).querySelector(".bar-black");
}
function getIcon(type) {
  return getBlock(type).querySelector(".icon");
}
function getPointDisplay(type) {
  return getBlock(type).querySelector(".point-display");
}
function getUpTrue(type) {
  return getBlock(type).querySelector(".up-true");
}

// スタートボタン（技量=A1, 知力=B1）
const startButtons = {
  tech: document.getElementById("A1"),
  int: document.getElementById("B1")
};
const startButtonImages = {
  tech: { off: "texture/Edit-A1.png", on: "texture/Edit-A2.png" },
  int: { off: "texture/B1.png", on: "texture/B2.png" }
};

// フォーマット
const MAX_DIGITS = 7;
function formatPoint(value) {
  return value.toString().padStart(MAX_DIGITS, " ");
}
function formatHM(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h${m}m`;
}

// ====== 1h ボタンのクリック ======
function setupHourButtons(type) {
  const buttons = getHourButtons(type);

  buttons.forEach((btn, index) => {
    // 初期状態
    if (!btn.dataset.state) {
      btn.dataset.state = "off";
      btn.dataset.hour = "1";
    }

    btn.addEventListener("click", () => {
      if (state[type].isRunning || state[type].isHourButtonsLocked) return;

      if (btn.dataset.state === "off") {
        btn.src = "texture/H_true.png";
        btn.dataset.state = "on";
      } else {
        btn.src = "texture/H_false.png";
        btn.dataset.state = "off";
      }

      updateDisplayHours(type);
    });
  });
}

function updateDisplayHours(type) {
  const buttons = getHourButtons(type);
  let totalHours = 0;

  buttons.forEach(btn => {
    if (btn.dataset.state === "on") {
      totalHours += Number(btn.dataset.hour);
    }
  });

  getTimerDisplay(type).textContent = `${totalHours}h`;
}

function getHourCount(type) {
  const buttons = getHourButtons(type);
  let count = 0;
  buttons.forEach(btn => {
    if (btn.dataset.state === "on") count++;
  });
  return count;
}

// ====== スキル点滅 ======
function startSkillBlink(type) {
  stopSkillBlink(type);

  const block = getBlock(type);

  if (type === "tech") {
    // 技術力は従来通り
    const on  = block.querySelector(".skill-on");
    const off = block.querySelector(".skill-off");

    on.style.opacity = "1";
    off.style.opacity = "0";

    let stateOn = true;
    state[type].skillBlinkInterval = setInterval(() => {
      stateOn = !stateOn;
      on.style.opacity  = stateOn ? "1" : "0";
      off.style.opacity = stateOn ? "0" : "1";
    }, 1000);

  } else {
    // ★ 知力：on がフェード、off が排他的に切り替わる
    const on  = block.querySelector(".brain-on");
    const off = block.querySelector(".brain-off");

    // on をフェード開始
    on.style.animation = "fadeBlink 4s infinite";
  }
}


function stopSkillBlink(type) {
  if (state[type].skillBlinkInterval) {
    clearInterval(state[type].skillBlinkInterval);
    state[type].skillBlinkInterval = null;
  }

  const block = getBlock(type);

  if (type === "tech") {
    const on  = block.querySelector(".skill-on");
    const off = block.querySelector(".skill-off");
    on.style.opacity  = "0";
    off.style.opacity = "1";
  } else {
    const on  = block.querySelector(".brain-on");
    const off = block.querySelector(".brain-off");

    on.style.animation = "none";
    on.style.opacity = "0";
    off.style.opacity = "1";
  }
}





// ====== ポイント ======
function loadPoints() {
  TYPES.forEach(type => {
    const saved = localStorage.getItem(`${type}_point`);
    state[type].point = saved ? Number(saved) : 0;
    state[type].currentDigit = state[type].point.toString().length;
    getPointDisplay(type).textContent = formatPoint(state[type].point);
    updateTrueBarPosition(type);
  });
}

function startPointGain(type) {
  stopPointGain(type);

  const interval = (type === "tech") ? 2000 : 4000;
  const gain     = (type === "tech") ? 1    : 2;

  state[type].pointInterval = setInterval(() => {
    state[type].point += gain;

    showPointFloat(type, gain);

    getPointDisplay(type).textContent = formatPoint(state[type].point);
    localStorage.setItem(`${type}_point`, state[type].point);

    const digit = state[type].point.toString().length;
    if (digit > state[type].currentDigit) {
      state[type].currentDigit = digit;
      moveTrueBar(type);
    }
  }, interval);
}


function stopPointGain(type) {
  if (state[type].pointInterval) {
    clearInterval(state[type].pointInterval);
    state[type].pointInterval = null;
  }
}

function moveTrueBar(type) {
  const upTrue = getUpTrue(type);
  const step = 46;

  const leftStr = upTrue.style.left || getComputedStyle(upTrue).left;
  const currentLeft = parseFloat(leftStr);
  const newLeft = currentLeft - step;
  upTrue.style.left = newLeft + "px";

  localStorage.setItem(`${type}_Up_true_left`, newLeft);
}

function updateTrueBarPosition(type) {
  const upTrue = getUpTrue(type);
  const step = 46;
  const digit = state[type].point.toString().length;
  const initialLeft = 302;
  const newLeft = initialLeft - (digit - 1) * step;
  upTrue.style.left = newLeft + "px";
  localStorage.setItem(`${type}_Up_true_left`, newLeft);
}

// ====== タイマー ======
function startTimer(type, totalSeconds) {
  const s = state[type];
  if (s.isRunning) return;

  s.isRunning = true;
  s.isHourButtonsLocked = true;

  localStorage.setItem(`${type}_timer_remaining`, totalSeconds);
  localStorage.setItem(`${type}_timer_running`, "true");
  localStorage.setItem(`${type}_timer_total`, totalSeconds);
  localStorage.setItem(`${type}_A_locked`, "true");

  // 1h ボタン状態保存
  const buttons = getHourButtons(type);
  buttons.forEach((btn, index) => {
    localStorage.setItem(`${type}_hour_${index}`, btn.dataset.state);
  });

  startSkillBlink(type);
  startPointGain(type);

  const display = getTimerDisplay(type);
  display.textContent = "";

  let remaining = totalSeconds;
  let lastDisplayedMinute = -1;

  const barTrue = getBarTrue(type);
  barTrue.style.transitionDuration = `${remaining}s`;
  barTrue.style.left = "0px";

  s.timerInterval = setInterval(() => {
    remaining--;
    localStorage.setItem(`${type}_timer_remaining`, remaining);

    const currentMinute = Math.floor((remaining % 3600) / 60);
    if (currentMinute !== lastDisplayedMinute) {
      display.textContent = formatHM(remaining);
      lastDisplayedMinute = currentMinute;
    }

    if (remaining <= 0) finishTimer(type);
  }, 1000);
}

function resumeTimer(type, totalSeconds, totalAll) {
  const s = state[type];
  s.isRunning = true;
  s.isHourButtonsLocked = true;

  const display = getTimerDisplay(type);
  display.textContent = "";

  let remaining = totalSeconds;
  let lastDisplayedMinute = -1;

  const barTrue = getBarTrue(type);

  s.timerInterval = setInterval(() => {
    remaining--;
    localStorage.setItem(`${type}_timer_remaining`, remaining);

    const currentMinute = Math.floor((remaining % 3600) / 60);
    if (currentMinute !== lastDisplayedMinute) {
      display.textContent = formatHM(remaining);
      lastDisplayedMinute = currentMinute;
    }

    if (remaining <= 0) finishTimer(type);
  }, 1000);
}

function finishTimer(type) {
  stopSound = true;
  const s = state[type];
  if (s.timerInterval) {
    clearInterval(s.timerInterval);
    s.timerInterval = null;
  }

  localStorage.setItem(`${type}_timer_done`, "true");
  localStorage.setItem(`${type}_timer_running`, "false");

  const N = getHourCount(type);
  const bonus = N + 1;
  s.point += N + 1;
  s.point += bonus;

  showBonusFloat(type, bonus);
  getPointDisplay(type).textContent = formatPoint(s.point);
  localStorage.setItem(`${type}_point`, s.point);

  s.isRunning = false;

  const display = getTimerDisplay(type);
  display.innerHTML = '<img src="texture/done.png" class="done">';

  playStepSound();
}

// ====== タイマーリセット ======
function resetTimer(type) {
  stopSkillBlink(type);
  stopSound = true;
  const s = state[type];

  if (s.timerInterval) {
    clearInterval(s.timerInterval);
    s.timerInterval = null;
  }

  localStorage.removeItem(`${type}_timer_done`);
  localStorage.removeItem(`${type}_timer_running`);
  localStorage.removeItem(`${type}_timer_remaining`);
  localStorage.removeItem(`${type}_timer_total`);
  localStorage.removeItem(`${type}_A_locked`);

  stopPointGain(type);
  stopSkillBlink(type);

  s.isRunning = false;
  s.isHourButtonsLocked = false;
  s.isLocked = false;

  // 1h ボタンリセット
  const buttons = getHourButtons(type);
  buttons.forEach((btn, index) => {
    btn.src = "texture/H_false.png";
    btn.dataset.state = "off";
    localStorage.setItem(`${type}_hour_${index}`, "off");
  });

  // trueバー初期位置
  const barTrue = getBarTrue(type);
  barTrue.style.transitionDuration = "0s";
  barTrue.style.left = "-756.5px";
  setTimeout(() => {
    barTrue.style.transitionDuration = "";
  }, 50);

  // スタートボタン画像
  const btn = startButtons[type];
  btn.src = startButtonImages[type].off;

  // 表示
  getTimerDisplay(type).textContent = "0h";
}

// ====== 保存タイマーだけリセット ======
function resetSavedTimer(type) {
  const s = state[type];
  stopSkillBlink(type);

  localStorage.removeItem(`${type}_timer_remaining`);
  localStorage.removeItem(`${type}_timer_running`);
  localStorage.removeItem(`${type}_timer_total`);
  localStorage.removeItem(`${type}_timer_done`);
  localStorage.removeItem(`${type}_A_locked`);

  if (s.timerInterval) {
    clearInterval(s.timerInterval);
    s.timerInterval = null;
  }

  stopSkillBlink(type);
  stopPointGain(type);

  s.isRunning = false;
  s.isLocked = false;
  s.isHourButtonsLocked = false;

  const display = getTimerDisplay(type);
  display.textContent = "0h";

  const barTrue = getBarTrue(type);
  barTrue.style.transitionDuration = "0s";
  barTrue.style.left = "-756.5px";
  setTimeout(() => {
    barTrue.style.transitionDuration = "";
  }, 50);

  const btn = startButtons[type];
  btn.src = startButtonImages[type].off;
}

// ====== スタートボタンのセットアップ ======
function setupStartButtons() {
  TYPES.forEach(type => {
    const btn = startButtons[type];

    btn.addEventListener("click", () => {
      const s = state[type];
      if (s.isRunning || s.isLocked) return;

      // 1h 合計
      const buttons = getHourButtons(type);
      let totalHours = 0;
      buttons.forEach(btn => {
        if (btn.dataset.state === "on") {
          totalHours += Number(btn.dataset.hour);
        }
      });

      if (totalHours > 0) {
        btn.src = startButtonImages[type].on;
        s.isLocked = true;

        const totalSeconds = totalHours * 3600; // 今は1秒=1hテスト
        startTimer(type, totalSeconds);
      }
    });
  });
}

// ====== 緊急リセット（割れガラス） ======
function showEmergencyCrack(type, clickX, clickY) {
  const s = state[type];
  if (s.emergencyCrackEl) return;
  stopSound = true;
  stopSkillBlink(type);
  s.emergencyReady = false;

  const crack = document.createElement("img");
  crack.src = "texture/glass_crack.png";
  crack.id = `emergency-crack-${type}`;

  const width = 1509;
  const height = 559;

  const barBlack = getBarBlack(type);
  const rect = barBlack.getBoundingClientRect();

  const visualWidth = 757.5;
  const domWidth = rect.width;
  const scaleX = visualWidth / domWidth;

  const visualHeight = 154;
  const domHeight = rect.height;
  const scaleY = visualHeight / domHeight;

  const offsetX = 4;
  const offsetY = 0;

  const localX = (clickX - rect.left) * scaleX + offsetX;
  const localY = (clickY - rect.top) * scaleY + offsetY;

  crack.style.width = width + "px";
  crack.style.height = height + "px";
  crack.style.left = (localX - width / 2) + "px";
  crack.style.top = (localY - height / 2) + "px";
  crack.style.position = "absolute";
  crack.style.zIndex = "3";
  crack.style.pointerEvents = "none";

  barBlack.appendChild(crack);
  s.emergencyCrackEl = crack;

  setTimeout(() => {
    s.emergencyReady = true;
  }, 1000);
}
// 画像が読み込めるかテスト
function testImageLoad() {
  const img = new Image();
  img.src = "texture/Glass_crack.png";
  img.onload = () => console.log("✅ 画像読み込み成功");
  img.onerror = () => console.error("❌ 画像読み込み失敗");
}

testImageLoad();
function setupBarBlackClick(type) {
  const barBlack = getBarBlack(type);

  // 前面エッジ
  const frontEdge = document.createElement("img");
  frontEdge.src = "texture/bar_black.png";
  frontEdge.className = "front-edge";
  frontEdge.style.position = "absolute";
  frontEdge.style.top = "0";
  frontEdge.style.left = "0";
  frontEdge.style.width = "100%";
  frontEdge.style.height = "100%";
  frontEdge.style.zIndex = "4";
  frontEdge.style.pointerEvents = "none";
  barBlack.appendChild(frontEdge);

  barBlack.addEventListener("click", (e) => {
    const s = state[type];

    // done 表示中なら通常リセット
    const display = getTimerDisplay(type);
    if (display.innerHTML.includes("done") && !s.isRunning && !s.emergencyReady) {
      resetTimer(type);
      if (s.emergencyCrackEl) s.emergencyCrackEl.remove();
      s.emergencyCrackEl = null;
      s.emergencyClickCount = 0;
      s.emergencyReady = false;
      return;
    }

    // 緊急モード中なら即リセット
    if (s.emergencyReady) {
      resetTimer(type);
      if (s.emergencyCrackEl) s.emergencyCrackEl.remove();
      s.emergencyCrackEl = null;
      s.emergencyClickCount = 0;
      s.emergencyReady = false;
      return;
    }

    if (!s.isRunning) return;

    s.emergencyClickCount++;

    if (s.emergencyClickCount === 5) {
      showEmergencyCrack(type, e.clientX, e.clientY);
    }

    clearTimeout(s.emergencyTimer);
    s.emergencyTimer = setTimeout(() => {
      s.emergencyClickCount = 0;
    }, 3000);
  });
}

// ====== ポイント浮遊表示 ======
function showPointFloat(type, gain = 1) {
  const float = document.createElement("div");
  float.textContent = `+${gain}`;
  float.classList.add("point-float");

  let baseX, baseY;

  if (type === "tech") {
    baseX = 715;
    baseY = 145;
  } else {
    baseX = 1500; // 知力側の位置（必要なら調整）
    baseY = 145;
  }

  float.style.left = baseX + "px";
  float.style.top = baseY + "px";

  document.getElementById("background_edge").appendChild(float);

  setTimeout(() => float.remove(), 2000);
}


function showBonusFloat(type, bonusValue) {
  const float = document.createElement("div");
  float.textContent = `+${bonusValue}`;
  float.classList.add("bonus-float");

  let baseX, baseY;
  if (type === "tech") {
    baseX = 690;
    baseY = 230;
  } else {
    baseX = 1470; // 仮：知力側。調整
    baseY = 230;
  }

  float.style.left = baseX + "px";
  float.style.top = (baseY + 40) + "px";

  document.getElementById("background_edge").appendChild(float);

  setTimeout(() => {
    float.remove();
  }, 2000);
}

// テストボタン（ボーナス表示は技量側でテスト）
document.getElementById("bonus-test-btn").addEventListener("click", () => {
  const testBonus = 5;
  showBonusFloat("tech", testBonus);
});

// ====== 全リセット ======
function resetAll() {
  TYPES.forEach(type => {
    localStorage.removeItem(`${type}_point`);
    localStorage.removeItem(`${type}_Up_true_left`);
    localStorage.removeItem(`${type}_timer_remaining`);
    localStorage.removeItem(`${type}_timer_running`);
    localStorage.removeItem(`${type}_timer_total`);
    localStorage.removeItem(`${type}_timer_done`);
    localStorage.removeItem(`${type}_A_locked`);

    const buttons = getHourButtons(type);
    buttons.forEach((btn, index) => {
      localStorage.removeItem(`${type}_hour_${index}`);
    });

    state[type].point = 0;
    getPointDisplay(type).textContent = formatPoint(0);

    const upTrue = getUpTrue(type);
    upTrue.style.left = "302px";

    if (state[type].timerInterval) {
      clearInterval(state[type].timerInterval);
      state[type].timerInterval = null;
    }
    stopSkillBlink(type);
    stopPointGain(type);

    state[type].isRunning = false;
    state[type].isLocked = false;
    state[type].isHourButtonsLocked = false;

    const btn = startButtons[type];
    btn.src = startButtonImages[type].off;

    const buttons2 = getHourButtons(type);
    buttons2.forEach(btn => {
      btn.dataset.state = "off";
      btn.src = "texture/H_false.png";
    });

    const display = getTimerDisplay(type);
    display.textContent = "0h";

    const barTrue = getBarTrue(type);
    barTrue.style.transitionDuration = "0s";
    barTrue.style.left = "-756.5px";
    setTimeout(() => {
      barTrue.style.transitionDuration = "";
    }, 50);
  });

  console.log("すべて初期化しました");
}

document.getElementById("reset-all-test").addEventListener("click", resetAll);

// タイマー保存だけリセット（両方）
function resetSavedTimerAll() {
  TYPES.forEach(type => resetSavedTimer(type));
  console.log("保存タイマーをリセットしました");
}
document.getElementById("reset-timer-test").addEventListener("click", resetSavedTimerAll);

// ====== サウンド ======
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let stopSound = false;

function playStepSound() {
  stopSound = false;

  let loopCount = 0;

  function runOneLoop() {
    if (stopSound) return;

    let freq = 100;

    function playOneTone() {
      if (stopSound) return;

      if (freq > 1000) {
        loopCount++;
        if (loopCount < 5) {
          setTimeout(() => {
            if (!stopSound) runOneLoop();
          }, 1000);
        }
        return;
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.5;

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);

      freq += 100;

      setTimeout(playOneTone, 200);
    }

    playOneTone();
  }

  runOneLoop();
}

// ====== 起動時復元 ======
document.addEventListener("DOMContentLoaded", () => {
  // 1hボタンセットアップ
  TYPES.forEach(type => {
    setupHourButtons(type);
    setupBarBlackClick(type);
  });

  // ポイント復元
  loadPoints();

  // タイマー復元
  TYPES.forEach(type => {
    const running = localStorage.getItem(`${type}_timer_running`);
    const remaining = Number(localStorage.getItem(`${type}_timer_remaining`));
    const total = Number(localStorage.getItem(`${type}_timer_total`));
    const done = localStorage.getItem(`${type}_timer_done`);
    const savedLock = localStorage.getItem(`${type}_A_locked`);

    // スタートボタン復元
    if (savedLock === "true") {
      state[type].isLocked = true;
      startButtons[type].src = startButtonImages[type].on;
    } else {
      state[type].isLocked = false;
      startButtons[type].src = startButtonImages[type].off;
    }

    // 1hボタン復元
    const buttons = getHourButtons(type);
    buttons.forEach((btn, index) => {
      const saved = localStorage.getItem(`${type}_hour_${index}`);
      if (saved === "on") {
        btn.dataset.state = "on";
        btn.src = "texture/H_true.png";
      } else {
        btn.dataset.state = "off";
        btn.src = "texture/H_false.png";
      }
    });

    // Up_true 復元
    const savedLeft = localStorage.getItem(`${type}_Up_true_left`);
    if (savedLeft !== null) {
      getUpTrue(type).style.left = savedLeft + "px";
    } else {
      updateTrueBarPosition(type);
    }

    // タイマー動作中の復元
    if (running === "true" && remaining > 0 && total > 0) {
      const barTrue = getBarTrue(type);
      const startLeft = -756.5;
      const endLeft = 0;

      const progress = 1 - (remaining / total);

      barTrue.style.transitionDuration = "0s";
      barTrue.style.left = `${startLeft + (endLeft - startLeft) * progress}px`;

      startSkillBlink(type);
      startPointGain(type);

      setTimeout(() => {
        barTrue.style.transitionDuration = `${remaining}s`;
        barTrue.style.left = "0px";
      }, 50);

      resumeTimer(type, remaining, total);
    }

    // done 状態の復元
    if (done === "true") {
      const display = getTimerDisplay(type);
      display.innerHTML = '<img src="texture/done.png" class="done">';

      state[type].isLocked = true;
      startButtons[type].src = startButtonImages[type].on;
      state[type].isHourButtonsLocked = true;

      const barTrue = getBarTrue(type);
      barTrue.style.transitionDuration = "0s";
      barTrue.style.left = "0px";

      startSkillBlink(type);
      startPointGain(type);
    }
  });

  // スタートボタンのイベント
  setupStartButtons();
});

function applyCPenalty() {
  applyPenaltyTo("tech", 500); // 技術力 -500
  showPenaltyFloat("tech", 500);
  applyPenaltyTo("int", 1000); // 知力 -1000
  showPenaltyFloat("int",1000);
}

function applyPenaltyTo(type, amount) {
  const block = getBlock(type);
  const pointDisplay = block.querySelector(".point-display");

  let current = Number(pointDisplay.textContent || "0");

  current -= amount;
  if (current < 0) current = 0;

  pointDisplay.textContent = current;

  // 内部 state を更新
  state[type].point = current;

  // 保存
  savePoints(type, current);

  // ★ 桁が減ったときもバーを再計算して戻す
  state[type].currentDigit = current.toString().length;
  updateTrueBarPosition(type);
}
function showPenaltyFloat(type, amount) {
  const float = document.createElement("div");
  float.textContent = `-${amount}`;
  float.classList.add("penalty-float");

  let baseX, baseY;

  if (type === "tech") {
    baseX = 645;   // ボーナスと同じ位置
    baseY = 200;
  } else {
    baseX = 1414;  // 知力側の位置
    baseY = 200;
  }

  float.style.left = baseX + "px";
  float.style.top = (baseY + 40) + "px";

  document.getElementById("background_edge").appendChild(float);

  setTimeout(() => float.remove(), 3000);
}


console.log(getBlock("int"));
console.log(getBlock("int").querySelector(".point-display"));
function savePoints(type, value) {
  localStorage.setItem(`${type}_point`, value);
}
document.getElementById("add-test-points").addEventListener("click", addTestPoints);
function addTestPoints() {
  ["tech", "int"].forEach(type => {
    state[type].point += 2000;
    getPointDisplay(type).textContent = formatPoint(state[type].point);
    localStorage.setItem(`${type}_point`, state[type].point);
  });
}


