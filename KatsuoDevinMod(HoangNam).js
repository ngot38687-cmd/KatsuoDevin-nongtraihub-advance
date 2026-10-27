// ==UserScript==
// @name         Nông trại 10 — KatsuoDevin Hub (v1.8)
// @namespace    local
// @version      Advance-1.9
// @description  Giao diện Liquid Glass, Mod by Katsuo. Fix hệ thống Key 14 ngày.
// @match        https://nongtrai10.netlify.app/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ngot38687-cmd/KatsuoDevin-nongtraihub-advance/main/KatsuoDevinMod(HoangNam).js
// @downloadURL  https://raw.githubusercontent.com/ngot38687-cmd/KatsuoDevin-nongtraihub-advance/main/KatsuoDevinMod(HoangNam).js
// ==/UserScript==

(() => {
  'use strict';

  const LOG = (...a) => console.log('%c[KatsuoDevin Hub]', 'color:#0ca678;font-weight:900', ...a);
  const $  = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const norm = s => String(s || '').trim();

  // ============================================================
  // HỆ THỐNG XÁC THỰC KEY (KEY 14 NGÀY)
  // ============================================================
  // Danh sách các Key hợp lệ (Thêm key mới vào đây mỗi khi muốn đổi đợt)
  const VALID_KEYS = [
      "KATSUO_ADVANCE_ab6a300e-3db0-429f-a3fb-acb639306ded" // Key hiện tại của bạn
  ];

  const MASTER_KEY = "KATSUO_MASTER_BYPASS"; // Key mở khóa vĩnh viễn cho bạn test
  const DAYS_VALID = 14; // Số ngày hiệu lực của key
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const checkAuth = () => {
      const savedKey = localStorage.getItem('katsuo_hub_key');
      const expireTime = localStorage.getItem('katsuo_hub_expire');
      
      if (!savedKey || !expireTime) return false;
      
      // Nếu là Master Key thì luôn cho qua
      if (savedKey === MASTER_KEY) return true;
      
      // Kiểm tra key có nằm trong danh sách hợp lệ không
      if (!VALID_KEYS.includes(savedKey)) return false;
      
      // Kiểm tra thời gian hết hạn (nếu thời gian hiện tại lớn hơn hạn thì khóa)
      if (Date.now() > parseInt(expireTime)) return false;
      
      return true;
  };

  const showAuthModal = () => {
      const modal = document.createElement('div');
      modal.id = 'katsuo-auth-panel';
      modal.innerHTML = `
        <style>
          #katsuo-auth-panel {
            position: fixed; top: 15px; left: 15px; z-index: 999999;
            width: 310px; 
            background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.6);
            border-left: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 24px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255,255,255,0.1);
            color: #fff; font-family: 'Segoe UI', Roboto, sans-serif;
            font-size: 13px; overflow: hidden; transition: transform 0.1s;
          }
          #katsuo-auth-header {
            padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; 
            cursor: grab; border-bottom: 1px solid rgba(255,255,255,0.1); 
            background: rgba(255,255,255,0.05); user-select: none;
          }
          .auth-body { padding: 20px 18px; display: flex; flex-direction: column; gap: 12px; }
          .auth-body input {
            width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2);
            border-radius: 10px; color: #fff; font-size: 14px; text-align: center; outline: none; box-sizing: border-box;
            transition: border 0.2s;
          }
          .auth-body input:focus { border-color: #a9e34b; }
          .auth-body button {
            width: 100%; background: linear-gradient(135deg, rgba(47, 158, 68, 0.8), rgba(12, 166, 120, 0.8)); 
            color: #fff; border: 1px solid rgba(255,255,255,0.4); padding: 12px;
            border-radius: 10px; font-weight: bold; font-size: 14px; cursor: pointer; transition: 0.2s;
          }
          .auth-body button:hover { filter: brightness(1.2); transform: translateY(-1px); }
          .auth-err { color: #ff6b6b; font-size: 12px; text-align: center; display: none; font-weight: 600; }
        </style>
        
        <div id="katsuo-auth-header">
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 15px; color: #a9e34b;">KatsuoDevin Hub</span>
                <span style="font-size: 10px; color: #ccc; font-weight: 500; margin-top: 2px;">Authentication Required</span>
            </div>
        </div>
        
        <div class="auth-body">
          <div class="auth-err" id="auth-err">Key không hợp lệ hoặc đã hết hạn!</div>
          <input type="text" id="auth-input" placeholder="Nhập Key 14 ngày...">
          <button id="auth-btn">XÁC NHẬN</button>
        </div>
      `;
      document.body.appendChild(modal);

      // Logic Kéo Thả Panel
      const header = document.getElementById('katsuo-auth-header');
      let isDragging = false, startX, startY, startLeft, startTop;

      header.onpointerdown = (e) => {
        isDragging = true;
        startX = e.clientX; startY = e.clientY;
        const rect = modal.getBoundingClientRect();
        startLeft = rect.left; startTop = rect.top;
        header.style.cursor = 'grabbing';
        modal.style.transition = 'none';
        header.setPointerCapture(e.pointerId);
      };

      header.onpointermove = (e) => {
        if (!isDragging) return;
        modal.style.left = (startLeft + e.clientX - startX) + 'px';
        modal.style.top = (startTop + e.clientY - startY) + 'px';
      };

      header.onpointerup = (e) => {
        isDragging = false;
        header.style.cursor = 'grab';
        modal.style.transition = 'all 0.3s ease';
        header.releasePointerCapture(e.pointerId);
      };

      // Logic Nhập Key
      const input = document.getElementById('auth-input');
      const btn = document.getElementById('auth-btn');
      const err = document.getElementById('auth-err');

      const attemptLogin = () => {
          const val = input.value.trim();

          if (val === MASTER_KEY || VALID_KEYS.includes(val)) {
              localStorage.setItem('katsuo_hub_key', val);
              
              // Tính toán thời gian hết hạn (Hiện tại + 14 ngày)
              const expireTime = Date.now() + (DAYS_VALID * MS_PER_DAY);
              localStorage.setItem('katsuo_hub_expire', expireTime.toString());
              
              modal.remove();
              initHub();
          } else {
              err.style.display = 'block';
              input.value = '';
              input.focus();
          }
      };

      btn.onclick = attemptLogin;
      input.onkeydown = (e) => { if (e.key === 'Enter') attemptLogin(); };
      setTimeout(() => input.focus(), 100);
  };

  // ============================================================
  // HIỆU ỨNG TUYẾT RƠI (SNOWFALL)
  // ============================================================
  try {
    const snowContainer = document.createElement('div');
    snowContainer.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;overflow:hidden;';
    for (let i = 0; i < 50; i++) {
        const snow = document.createElement('div');
        snow.style.cssText = `
            position:absolute; top:-10px; background:#fff; border-radius:50%; opacity:0.8;
            left:${Math.random() * 100}vw;
            width:${Math.random() * 4 + 2}px;
            height:${Math.random() * 4 + 2}px;
            animation: fall ${Math.random() * 3 + 2}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        snowContainer.appendChild(snow);
    }
    document.body.appendChild(snowContainer);

    const style = document.createElement('style');
    style.textContent = `@keyframes fall { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(105vh) translateX(20px); } }`;
    document.head.appendChild(style);
  } catch(e) {}

  // ============================================================
  // KỸ THUẬT CHỐNG NGỦ (WORKER + AUDIO CONTEXT)
  // ============================================================
  let bgAudioCtx = null;
  let bgAudioEl = null;

  try {
    const blob = new Blob(["setInterval(()=>{postMessage(1)},1000)"], {type: "text/javascript"});
    const worker = new Worker(URL.createObjectURL(blob));
    worker.onmessage = () => {};
  } catch(e) {}

  const toggleBackground = (enable) => {
      if (enable) {
          if (bgAudioCtx) return;
          try {
              bgAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = bgAudioCtx.createOscillator();
              const gain = bgAudioCtx.createGain();
              gain.gain.value = 0;
              const dest = bgAudioCtx.createMediaStreamDestination();
              osc.connect(gain);
              gain.connect(dest);
              osc.start();

              bgAudioEl = document.createElement('audio');
              bgAudioEl.srcObject = dest.stream;
              bgAudioEl.play().catch(e => console.log('Lỗi phát âm thanh ngầm:', e));
              LOG('🔊 Đã bật chế độ chạy ngầm (Out Tab).');
          } catch (e) {
              console.log('Trình duyệt không hỗ trợ AudioContext', e);
          }
      } else {
          if (bgAudioCtx) {
              bgAudioCtx.close();
              bgAudioCtx = null;
          }
          if (bgAudioEl) {
              bgAudioEl.pause();
              bgAudioEl = null;
          }
          LOG('🔇 Đã tắt chế độ chạy ngầm.');
      }
  };

  // 1. TRÍCH XUẤT DATA TỪ GAME
  const s = document.createElement('script');
  s.textContent = `
    window._G = {
      getS: () => typeof S !== 'undefined' ? S : null,
      getCAY: () => typeof CAY !== 'undefined' ? CAY : {},
      getVAT: () => typeof VAT !== 'undefined' ? VAT : {},
      getCap: () => typeof cap !== 'undefined' ? cap() : 1,
      getGIA_O: () => typeof GIA_O !== 'undefined' ? GIA_O : [0,0,0,0,50,80,120,160,200],
      getPHUT: () => typeof PHUT !== 'undefined' ? PHUT : 60000,
      getSO_LAN_TUOI: () => typeof SO_LAN_TUOI !== 'undefined' ? SO_LAN_TUOI : 2,
      gieo: (i, k) => typeof gieo !== 'undefined' ? gieo(i, k) : null,
      muaVat: (k) => typeof muaVat !== 'undefined' ? muaVat(k) : null,
      bamVat: (i) => typeof bamVat !== 'undefined' ? bamVat(i) : null,
      banHang: (k) => typeof banHang !== 'undefined' ? banHang(k) : null,
      thuHet: () => typeof thuHet !== 'undefined' ? thuHet() : null,
      tuoiHet: () => typeof tuoiHet !== 'undefined' ? tuoiHet() : null,
      moO: () => typeof moO !== 'undefined' ? moO() : null,
      CAU: typeof CAU !== 'undefined' ? CAU : [],
      CAU_AI: typeof CAU_AI !== 'undefined' ? CAU_AI : []
    };
  `;
  document.head.appendChild(s);
  s.remove();

  let MC_MAP = new Map();
  const buildMaps = () => {
    try {
      if (window._G.CAU) for (const c of window._G.CAU) MC_MAP.set(norm(c[1]), c[2]);
      if (window._G.CAU_AI) for (const c of window._G.CAU_AI) MC_MAP.set(norm(c[1]), c[2]);
    } catch (e) {}
  };

  // Cài đặt
  const defaultCfg = {
    autoNext: true, autoReplay: false, autoBackground: false, autoFarm: false, autoSell: false,
    autoQuiz: false, autoQuest: false, autoLand: false, autoAscend: false,
    plantId: 'ngo', animalId: 'ga'
  };
  let cfg = JSON.parse(localStorage.getItem('bot_adv_cfg')) || defaultCfg;
  const saveCfg = () => localStorage.setItem('bot_adv_cfg', JSON.stringify(cfg));

  // ============================================================
  // BỘ ĐẾM SỐ CÂU
  // ============================================================
  const todayStr = new Date().toLocaleDateString('vi-VN');
  const qCountKey = 'bot_qcount_' + todayStr;
  let qCount = parseInt(localStorage.getItem(qCountKey) || '0');
  
  const updateQCount = () => {
    const el1 = $('#st-qcount');
    if (el1) el1.textContent = qCount;
    localStorage.setItem(qCountKey, qCount);
  };

  const godClick = (el) => {
    if (!el) return;
    let current = el;
    for (let i = 0; i < 3; i++) {
        if (!current) break;
        const keys = Object.keys(current);
        const rKey = keys.find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
        if (rKey && current[rKey] && typeof current[rKey].onClick === 'function') {
            current[rKey].onClick({ preventDefault: () => {}, stopPropagation: () => {}, target: current });
            return;
        }
        current = current.parentElement;
    }
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    el.click();
  };

  // LOGIC TỰ ĐỘNG NEXT VÀ REPLAY
  let lastNextTs = 0;
  const actionNext = () => {
      if (Date.now() - lastNextTs < 800) return; 
      const sheet = $('#sheet');
      if (!sheet || sheet.classList.contains('an')) return;

      const btns = Array.from(sheet.querySelectorAll('button, a, div[role="button"]'));
      
      if (cfg.autoReplay) {
          let replayBtn = btns.find(b => {
              if (b.disabled || b.offsetWidth === 0) return false;
              const t = b.textContent.toLowerCase();
              return t.includes('chơi lại') || t.includes('ván mới') || t.includes('leo lại') || t.includes('làm lại') || t.includes('bắt đầu');
          });
          if (replayBtn) { lastNextTs = Date.now(); godClick(replayBtn); return; }
      }

      let nextBtn = btns.find(b => {
          if (b.disabled || b.offsetWidth === 0 || b.offsetHeight === 0) return false;
          const t = b.textContent.toLowerCase();
          return (
              t.includes('câu tiếp') || t.includes('câu đố tiếp') || t.includes('chơi tiếp') ||
              t.includes('tiếp tục') || t.includes('leo tầng') || t.includes('nhận thưởng')
          );
      });
      if (nextBtn) { lastNextTs = Date.now(); godClick(nextBtn); lastQuestionText = ''; return; }
  };

  const answerNow = () => {
    const sheet = $('#sheet');
    if (!sheet || sheet.classList.contains('an')) return; 
    const cauEl = $('#hop .cau, #gHoi .cau');
    if (!cauEl) return;
    const qText = norm(cauEl.textContent);
    const correct = MC_MAP.get(qText);
    if (correct) {
      const btns = Array.from($$('#hop .lc:not([disabled]), #gHoi .lc:not([disabled])'));
      const target = btns.find(b => norm(b.textContent) === norm(correct));
      if (target) godClick(target);
    } else {
      const btns = Array.from($$('#hop .lc:not([disabled]), #gHoi .lc:not([disabled])'));
      if (btns.length > 0) godClick(btns[0]);
    }
  };

  const stopAll = () => {
    for (let k in cfg) if (typeof cfg[k] === 'boolean') cfg[k] = false;
    saveCfg();
    $$('.db-switch input').forEach(input => input.checked = false);
    toggleBackground(false);
    alert("Đã TẮT toàn bộ Auto.");
  };

  const harvestAndReplant = async () => {
    if (window._G.thuHet) window._G.thuHet();
    await sleep(300);
    if (window._G.tuoiHet) window._G.tuoiHet();
    await sleep(300);
    const S = window._G.getS();
    const CAY = window._G.getCAY();
    const crop = CAY[cfg.plantId];
    if (S && crop) {
      S.o.forEach((plot, i) => {
        if (i < S.soO && !plot && S.xu >= crop.gia) {
          if (window._G.gieo) window._G.gieo(i, cfg.plantId);
        }
      });
    }
    await sleep(300);
    if (S && S.vat) {
        S.vat.forEach((v, i) => {
            if (window._G.bamVat) window._G.bamVat(i);
        });
    }
  };

  const updateFarmStatus = () => {
    const S = window._G.getS();
    if (!S) return;
    const CAY = window._G.getCAY();
    const VAT = window._G.getVAT();
    const PHUT = window._G.getPHUT();
    const MAX_TUOI = window._G.getSO_LAN_TUOI();
    const now = Date.now();

    let cropTotal = 0, cropReady = 0, cropThirsty = 0;
    S.o.forEach((x, i) => {
        if (i < S.soO && x) {
            cropTotal++;
            const C = CAY[x.c];
            if (!C) return;
            const con = x.t0 + C.t * PHUT - now;
            const thieu = MAX_TUOI - x.tuoi;
            if (con <= 0 && thieu <= 0) cropReady++;
            else if (thieu > 0) cropThirsty++;
        }
    });

    let animalTotal = 0, animalReady = 0, animalHungry = 0;
    S.vat.forEach(v => {
        animalTotal++;
        const V = VAT[v.k];
        if (!V) return;
        if (!v.t0) animalHungry++;
        else {
            const con = v.t0 + V.cho * PHUT - now;
            if (con <= 0) animalReady++;
        }
    });

    const cropTotalEl = $('#st-crop-total'); if (cropTotalEl) cropTotalEl.textContent = cropTotal;
    const cropMaxEl = $('#st-crop-max'); if (cropMaxEl) cropMaxEl.textContent = S.soO;
    const cropReadyEl = $('#st-crop-ready'); if (cropReadyEl) cropReadyEl.textContent = cropReady;
    const cropThirstyEl = $('#st-crop-thirsty'); if (cropThirstyEl) cropThirstyEl.textContent = cropThirsty;
    const animalTotalEl = $('#st-animal-total'); if (animalTotalEl) animalTotalEl.textContent = animalTotal;
    const animalReadyEl = $('#st-animal-ready'); if (animalReadyEl) animalReadyEl.textContent = animalReady;
    const animalHungryEl = $('#st-animal-hungry'); if (animalHungryEl) animalHungryEl.textContent = animalHungry;
  };

  /* ============================================================
     LOGIC TỰ ĐỘNG
     ============================================================ */
  let lastQuestionText = '', lastQuestTs = 0;
  let ascendClickTs = 0;

  setInterval(() => {
      if (cfg.autoNext || cfg.autoReplay) {
          actionNext();
      }
  }, 250);

  setInterval(async () => {
    const S = window._G.getS();
    if (!S) return;

    updateFarmStatus();

    // AUTO ASCEND
    if (cfg.autoAscend) {
        if (Date.now() - ascendClickTs > 1500) {
            const sheet = $('#sheet');
            const isHidden = sheet && sheet.classList.contains('an');
            const hop = $('#hop');
            const hopText = hop ? hop.innerText : '';

            if (isHidden) {
                const ascendBtn = Array.from($$('button')).find(b => norm(b.textContent).includes('Vượt ải'));
                if (ascendBtn) { godClick(ascendBtn); ascendClickTs = Date.now(); }
            } else if (hopText.includes('Ải thăng cấp') || hopText.includes('Chúc mừng! Em đã lên cấp') || hopText.includes('Chưa qua ải')) {
                if (hopText.includes('Chúc mừng! Em đã lên cấp') || hopText.includes('Chưa qua ải lần này')) {
                    const nextAiBtn = Array.from(hop.querySelectorAll('button')).find(b => norm(b.textContent).includes('Ải tiếp theo'));
                    const backBtn = Array.from(hop.querySelectorAll('button')).find(b => norm(b.textContent).includes('Về nông trại'));
                    const onBtn = Array.from(hop.querySelectorAll('button')).find(b => norm(b.textContent).includes('Ôn ngay'));
                    if (nextAiBtn) { godClick(nextAiBtn); ascendClickTs = Date.now(); }
                    else if (onBtn) { godClick(onBtn); ascendClickTs = Date.now(); }
                    else if (backBtn) { godClick(backBtn); ascendClickTs = Date.now(); }
                } else if (!hop.querySelector('.cau')) {
                    const startBtn = Array.from(hop.querySelectorAll('button')).find(b => norm(b.textContent) === 'Bắt đầu');
                    if (startBtn) { godClick(startBtn); ascendClickTs = Date.now(); }
                } else {
                    answerNow();
                }
            }
        }
    }

    // AUTO QUIZ
    if (cfg.autoQuiz) {
      const cauEl = $('#hop .cau, #gHoi .cau');
      if (cauEl) {
        const qText = norm(cauEl.textContent);
        if (qText && qText !== lastQuestionText) { 
            lastQuestionText = qText; 
            qCount++; 
            updateQCount(); 
        }
        if (!cfg.autoAscend) answerNow();
      }
    }

    // AUTO QUEST
    if (cfg.autoQuest && cfg.autoQuiz && Date.now() - lastQuestTs > 2000) {
        const isSheetOpen = !$('#sheet')?.classList.contains('an');
        const isCanvasOpen = $('#cv') !== null;
        if (!isSheetOpen && !isCanvasOpen) {
            const btn = Array.from($$('button')).find(b => {
                const t = norm(b.textContent);
                return t.includes('Làm nhiệm vụ') || t.includes('Góp lúa') || t.includes('Luyện tập');
            });
            if (btn) { lastQuestTs = Date.now(); godClick(btn); }
        }
    }

    // AUTO LAND
    if (cfg.autoLand) {
        if (S.soO < 9) {
            const price = window._G.getGIA_O()[S.soO];
            if (S.xu >= price && !$('#sheet')?.classList.contains('an')) {
                if (window._G.moO) window._G.moO();
            }
        }
    }

    // AUTO FARM
    if (cfg.autoFarm) {
      if (window._G.tuoiHet) window._G.tuoiHet();
      if (S.vat.length < 8) {
        const animal = window._G.getVAT()[cfg.animalId];
        if (animal && S.xu >= animal.gia && window._G.muaVat) window._G.muaVat(cfg.animalId);
      }
      S.vat.forEach((v, i) => { if (window._G.bamVat) window._G.bamVat(i); });
    }

    // AUTO SELL
    if (cfg.autoSell) {
      for (const k in S.kho) { if (S.kho[k] > 0 && window._G.banHang) window._G.banHang(k); }
    }
  }, 1000);

  /* ============================================================
     GIAO DIỆN KATSUODEVIN HUB
     ============================================================ */
  const initHub = () => {
      window.switchTab = (tabId) => {
        $$('.db-tab-content').forEach(el => el.style.display = 'none');
        $$('.db-tab-btn').forEach(el => el.classList.remove('active'));
        $('#' + tabId).style.display = 'block';
        $('#' + tabId + '-btn').classList.add('active');
      };
    
      const makeUI = () => {
        if(document.getElementById('bot-dashboard')) return; // Ngăn tạo 2 lần
        
        const p = document.createElement('div');
        p.id = 'bot-dashboard';
        
        p.style.cssText = `
          position: fixed; top: 15px; left: 15px; z-index: 999999;
          width: 310px; 
          background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.6);
          border-left: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 24px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255,255,255,0.1);
          color: #fff; font-family: 'Segoe UI', Roboto, sans-serif;
          font-size: 13px; overflow: hidden; transition: transform 0.1s;
        `;
    
        const CAY = window._G.getCAY() || {};
        const VAT = window._G.getVAT() || {};
        
        let cropOptions = Object.keys(CAY).filter(k => !CAY[k].tri).map(k => `<option value="${k}" style="background:#222; color:#fff;">${CAY[k].ic} ${CAY[k].ten}</option>`).join('');
        let animalOptions = Object.keys(VAT).map(k => `<option value="${k}" style="background:#222; color:#fff;">${VAT[k].ic} ${VAT[k].ten}</option>`).join('');
    
        p.innerHTML = `
          <div id="db-header" style="padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; cursor: grab; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); user-select: none;">
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 15px; color: #a9e34b;">KatsuoDevin Hub</span>
                <span style="font-size: 10px; color: #ccc; font-weight: 500; margin-top: 2px;">Mod by Katsuo</span>
            </div>
            <span id="db-toggle" style="font-size: 12px; opacity: 0.8; padding: 5px;">▼</span>
          </div>
          
          <div id="db-body" style="display: block;">
            <!-- STATUS -->
            <div style="background: rgba(0,0,0,0.2); padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 12px;">
              <div>🪙 Xu: <b id="st-xu" style="color:#ffd43b;">0</b></div>
              <div>💧 Nước: <b id="st-nuoc" style="color:#74c0fc;">0</b></div>
              <div>🌾 Cám: <b id="st-cam" style="color:#e9c46a;">0</b></div>
              <div>⭐ Cấp: <b id="st-cap" style="color:#b197fc;">1</b></div>
              <div style="grid-column: span 2; margin-top: 2px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                📝 Câu đã làm: <b id="st-qcount" style="color:#a9e34b; font-size: 14px;">0</b>
              </div>
            </div>
    
            <!-- TABS NAV -->
            <div style="display: flex; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.1);">
              <button id="tab-farm-btn" class="db-tab-btn active" onclick="switchTab('tab-farm')">🌱 Nông trại</button>
              <button id="tab-study-btn" class="db-tab-btn" onclick="switchTab('tab-study')">📝 Học tập</button>
            </div>
    
            <div style="padding: 12px 16px;">
              <!-- TAB 1: NÔNG TRẠI -->
              <div id="tab-farm" class="db-tab-content" style="display: block;">
                <div style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 10px; margin-bottom: 12px; font-size: 12px; display: grid; gap: 6px;">
                  <div style="font-weight: bold; color: #a9e34b; margin-bottom: 4px;">📊 Trạng thái Nông trại</div>
                  <div>🌱 Cây: <b id="st-crop-total" style="color:#fff;">0</b> / <b id="st-crop-max" style="color:#aaa;">0</b> ô</div>
                  <div style="color: #fcc419;">✅ Chín: <b id="st-crop-ready" style="color:#fff;">0</b></div>
                  <div style="color: #74c0fc;">💧 Cần tưới: <b id="st-crop-thirsty" style="color:#fff;">0</b></div>
                  <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 4px 0;"></div>
                  <div>🐔 Vật nuôi: <b id="st-animal-total" style="color:#fff;">0</b> / <b style="color:#aaa;">8</b> con</div>
                  <div style="color: #fcc419;">✅ Có SP: <b id="st-animal-ready" style="color:#fff;">0</b></div>
                  <div style="color: #ff922b;">🍽️ Đang đói: <b id="st-animal-hungry" style="color:#fff;">0</b></div>
                </div>
    
                <button id="btn-harvest" style="width: 100%; padding: 10px; margin-bottom: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.4); background: linear-gradient(135deg, rgba(47, 158, 68, 0.8), rgba(12, 166, 120, 0.8)); color: #fff; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(47, 158, 68, 0.4); transition: all 0.2s; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">🧺 Thu hoạch & Trồng lại</button>
                <button id="btn-stop" style="width: 100%; padding: 8px; margin-bottom: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.4); background: linear-gradient(135deg, rgba(224, 49, 49, 0.8), rgba(201, 42, 42, 0.8)); color: #fff; font-weight: bold; cursor: pointer; transition: all 0.2s; font-size: 12px;">🛑 Dừng Auto</button>
                
                <div style="display: grid; gap: 10px; margin-bottom: 12px;">
                  <label class="db-switch"><input type="checkbox" id="cb-farm" ${cfg.autoFarm?'checked':''}> Auto Chăn nuôi</label>
                  <label class="db-switch"><input type="checkbox" id="cb-sell" ${cfg.autoSell?'checked':''}> Auto Bán đồ</label>
                  <label class="db-switch"><input type="checkbox" id="cb-land" ${cfg.autoLand?'checked':''}> Auto Mở đất</label>
                </div>
    
                <div style="background: rgba(255,255,255,0.08); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); font-size: 12px;">
                  <div style="font-weight: 600; margin-bottom: 8px; color: #a9e34b;">🌱 Thiết lập</div>
                  <div style="margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                    <span style="opacity:0.9">Trồng:</span>
                    <select id="sel-crop" style="background: rgba(0,0,0,0.4); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 2px 6px; width: 160px; outline: none;">${cropOptions}</select>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="opacity:0.9">Nuôi:</span>
                    <select id="sel-animal" style="background: rgba(0,0,0,0.4); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 2px 6px; width: 160px; outline: none;">${animalOptions}</select>
                  </div>
                </div>
              </div>
    
              <!-- TAB 2: HỌC TẬP -->
              <div id="tab-study" class="db-tab-content" style="display: none;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                  <button id="btn-answer" style="padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.4); background: linear-gradient(135deg, rgba(28, 126, 214, 0.8), rgba(25, 113, 194, 0.8)); color: #fff; font-weight: bold; cursor: pointer; font-size: 12px;">⚡ Trả lời</button>
                  <button id="btn-next" style="padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.4); background: linear-gradient(135deg, rgba(245, 159, 0, 0.8), rgba(230, 119, 0, 0.8)); color: #fff; font-weight: bold; cursor: pointer; font-size: 12px;">⏭️ Chuyển câu</button>
                </div>
                <div style="display: grid; gap: 10px;">
                  <label class="db-switch"><input type="checkbox" id="cb-quest" ${cfg.autoQuest?'checked':''}> Treo máy Quiz</label>
                  <label class="db-switch"><input type="checkbox" id="cb-quiz" ${cfg.autoQuiz?'checked':''}> Auto Giải Quiz</label>
                  <label class="db-switch"><input type="checkbox" id="cb-next" ${cfg.autoNext?'checked':''}> Tự chuyển câu</label>
                  <label class="db-switch"><input type="checkbox" id="cb-ascend" ${cfg.autoAscend?'checked':''}> Auto Vượt ải</label>
                </div>
    
                <div style="font-weight: 700; color: #fcc419; margin: 16px 0 8px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">⚙️ Chức năng phụ</div>
                <div style="display: grid; gap: 10px;">
                  <label class="db-switch">
                    <input type="checkbox" id="cb-replay" ${cfg.autoReplay?'checked':''}> 
                    <span style="color: #fcc419; font-weight: bold;">Tự động chơi lại</span>
                  </label>
                  <label class="db-switch">
                    <input type="checkbox" id="cb-background" ${cfg.autoBackground?'checked':''}> 
                    <span style="color: #fcc419; font-weight: bold;">Chạy ngoài nền (Out Tab)</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; padding: 8px; font-size: 10px; color: rgba(255,255,255,0.4); border-top: 1px solid rgba(255,255,255,0.1);">
                Mod by Katsuo
            </div>
    
          </div>
          
          <style>
            .db-tab-btn { flex: 1; padding: 10px 0; background: none; border: none; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.6); font-weight: bold; font-size: 12px; cursor: pointer; transition: all 0.2s; }
            .db-tab-btn:hover { color: #fff; }
            .db-tab-btn.active { color: #a9e34b; border-bottom-color: #a9e34b; background: rgba(255,255,255,0.05); }
    
            .db-switch { display: flex; align-items: center; cursor: pointer; user-select: none; font-weight: 500; transition: color 0.2s; font-size: 12px; }
            .db-switch input { appearance: none; width: 32px; height: 18px; background: rgba(0,0,0,0.4); border-radius: 20px; position: relative; outline: none; cursor: pointer; transition: background 0.3s; margin-right: 8px; flex-shrink: 0; border: none; }
            .db-switch input::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: transform 0.3s; border: none; box-shadow: none; }
            .db-switch input:checked { background: #0ca678; }
            .db-switch input:checked::after { transform: translateX(14px); }
            .db-switch:hover { color: #74c0fc; }
            
            #btn-harvest:hover, #btn-answer:hover, #btn-stop:hover, #btn-next:hover { filter: brightness(1.2); transform: translateY(-1px); }
            #btn-harvest:active, #btn-answer:active, #btn-stop:active, #btn-next:active { transform: translateY(1px); }
          </style>
        `;
        document.body.appendChild(p);
    
        $('#sel-crop').value = cfg.plantId;
        $('#sel-animal').value = cfg.animalId;
    
        const bindToggle = (id, key) => { $('#'+id).onchange = e => { cfg[key] = e.target.checked; saveCfg(); }; };
        bindToggle('cb-quest', 'autoQuest');
        bindToggle('cb-quiz', 'autoQuiz');
        bindToggle('cb-next', 'autoNext');
        bindToggle('cb-ascend', 'autoAscend');
        bindToggle('cb-land', 'autoLand');
        bindToggle('cb-replay', 'autoReplay');
        bindToggle('cb-farm', 'autoFarm');
        bindToggle('cb-sell', 'autoSell');
        
        $('#cb-background').onchange = e => { 
            cfg.autoBackground = e.target.checked; 
            saveCfg(); 
            toggleBackground(cfg.autoBackground);
        };
        if (cfg.autoBackground) toggleBackground(true);
    
        $('#sel-crop').onchange = e => { cfg.plantId = e.target.value; saveCfg(); };
        $('#sel-animal').onchange = e => { cfg.animalId = e.target.value; saveCfg(); };
    
        $('#btn-answer').onclick = () => {
            if (!cfg.autoQuiz) {
                qCount++;
                updateQCount();
            }
            answerNow();
        };
        
        $('#btn-next').onclick = () => actionNext();
        $('#btn-stop').onclick = () => stopAll();
        $('#btn-harvest').onclick = () => harvestAndReplant();
    
        let isOpen = true;
        $('#db-toggle').onclick = (e) => {
          e.stopPropagation();
          isOpen = !isOpen;
          $('#db-body').style.display = isOpen ? 'block' : 'none';
          $('#db-toggle').textContent = isOpen ? '▼' : '▲';
        };
    
        const header = $('#db-header');
        let isDragging = false, startX, startY, startLeft, startTop;
    
        header.onpointerdown = (e) => {
          if (e.target.id === 'db-toggle') return;
          isDragging = true;
          startX = e.clientX; startY = e.clientY;
          const rect = p.getBoundingClientRect();
          startLeft = rect.left; startTop = rect.top;
          header.style.cursor = 'grabbing';
          p.style.transition = 'none';
          header.setPointerCapture(e.pointerId);
        };
    
        header.onpointermove = (e) => {
          if (!isDragging) return;
          p.style.left = (startLeft + e.clientX - startX) + 'px';
          p.style.top = (startTop + e.clientY - startY) + 'px';
        };
    
        header.onpointerup = (e) => {
          isDragging = false;
          header.style.cursor = 'grab';
          p.style.transition = 'all 0.3s ease';
          header.releasePointerCapture(e.pointerId);
        };
    
        setInterval(() => {
          const S = window._G.getS();
          if (S) {
            $('#st-xu').textContent = Math.floor(S.xu);
            $('#st-nuoc').textContent = S.nuoc;
            $('#st-cam').textContent = S.cam;
            $('#st-cap').textContent = window._G.getCap();
          }
        }, 1000);
        
        updateQCount();
        updateFarmStatus();
      };
      
      makeUI();
  };

  // BẮT ĐẦU KIỂM TRA KEY
  window.addEventListener('load', () => {
    buildMaps();
    
    // Nếu đã có key hợp lệ trong máy thì vào thẳng, không thì hiện bảng nhập
    if (checkAuth()) {
        setTimeout(initHub, 1000);
    } else {
        showAuthModal();
    }
  });

})();
