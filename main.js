let gameState = {
    totalPoints: 0, firstVisitTime: null, lastVisitTime: null, lastDate: null, lastLoginDayStart: null,
    stats: {
        activePointsToday: 0, inactivePointsToday: 0, activePointsTotal: 0, inactivePointsTotal: 0,
        coinsClickedToday: 0, coinPointsToday: 0, coinsClickedTotal: 0, coinsShownTotal: 0, coinPointsTotal: 0,
        highestMilestoneIndex: 0, manualClicksTotal: 0, manualPointsTotal: 0,
        currentStreak: 0, maxStreak: 0, prestigeLevel: 0, coinRainsTotal: 0,
        manualClicksToday: 0, activeSecondsToday: 0, questsClaimedToday: false
    },
    settings: { themeIndex: 0 }
};

let currentSessionStartTime = null;
let coinTimeout = null;
let currentLang = localStorage.getItem('bngu_lang') || 'de';
let titleClicks = 0; let titleClickTimer = null; 
const themes = ['', 'theme-matrix', 'theme-ice'];

const milestones = [
    { threshold: 0,        de: "Beobachter",        en: "Observer",           activeMulti: 1, inactiveMulti: 1, coinBonus: 0,  glow: false },
    { threshold: 1000,     de: "Sammler",           en: "Collector",          activeMulti: 1, inactiveMulti: 1, coinBonus: 2,  glow: false },
    { threshold: 50000,    de: "Archivar",          en: "Archivist",          activeMulti: 1, inactiveMulti: 2, coinBonus: 2,  glow: false },
    { threshold: 1000000,  de: "Chronist",          en: "Chronicler",         activeMulti: 2, inactiveMulti: 2, coinBonus: 5,  glow: false },
    { threshold: 10000000, de: "Hüter der Zeit",    en: "Guardian of Time",   activeMulti: 2, inactiveMulti: 2, coinBonus: 10, glow: false },
    { threshold: 50000000, de: "Meister der Ewigkeit", en: "Master of Eternity", activeMulti: 3, inactiveMulti: 3, coinBonus: 15, glow: true }
];

const translations = {
    de: {
        subText: "Long-term browsergame (c) 2026 by", statA: "Aktuelle Sitzungsdauer:", statG: "Gesamtspielzeit (seit Start):",
        statStreak: "Aktueller Streak:", statMaxStreak: "Längster Streak:", statB: "Heute aktiv erzielte Punkte:", statE: "Gesamt aktiv erzielte Punkte:",
        statC: "Heute inaktiv erzielte Punkte:", statF: "Gesamt inaktiv erzielte Punkte:", statClicks: "Manuelle Klicks auf die Zahl:", statClickPts: "Punkte durch manuelle Klicks:",
        statI: "Heute angeklickte Münzen:", statK: "Gesamt angeklickte Münzen:", statJ: "Heute durch Münzen erzielte Punkte:", statL: "Gesamt durch Münzen erzielte Punkte:",
        statH: "Münzen (Geklickt / Gezeigt / %):", statRain: "Münz-Regen Events:", statRank: "Aktueller Status:", statPrestige: "Prestige-Level:",
        toggleBtn: "EN", btnReset: "Zurücksetzen", btnGuide: "Anleitung", btnYouTube: "YouTube", btnImprint: "Impressum", btnPrestige: "Prestige", btnTheme: "Design", btnQuests: "Missionen",
        questsTitle: "Tages-Missionen", quest1: "1. Klicke 15 Münzen an:", quest2: "2. Klicke 500 Mal auf die Zahl:", quest3: "3. Spiele 10 Minuten aktiv:",
        resetTitle: "Spiel zurücksetzen?", resetText: "Möchten Sie Ihren gesamten Spielstand und alle Statistiken wirklich löschen?", btnResetYes: "Ja, zurücksetzen", btnResetNo: "Nein, abbrechen",
        guideModalTitle: "Anleitung", guideH1: "Ziel des Spiels", guideP1: "Sammle so viele Punkte wie möglich und steige in den Rängen auf!",
        guideH2: "Punkte sammeln", guideP2: "Die Zahl wächst von ganz allein – jede Sekunde. Wenn du offline bist, sammelst du ab einer Stunde inaktive Punkte. Du kannst aber auch aktiv auf die große Zahl klicken, um direkt Punkte zu generieren!",
        guideH3: "Münzen", guideP3: "Halte die Augen offen! Ab und zu tauchen Münzen auf. Klicke sie schnell an, bevor sie verschwinden, um dir einen dicken Bonus zu sichern.",
        guideH4: "Missionen & Boni", guideP4: "Schau täglich vorbei, um deinen Streak-Bonus zu kassieren, und erfülle die Tages-Missionen für Extra-Punkte.",
        btnClose: "Schließen", statVisitorsText: "Spieler seit", btnSnowShovel: "Schneeschieber",
        impVisSince: "Besucher seit (Datum):", impVisOnline: "Aktuell online:", impVisToday: "Besucher heute:", impVisYest: "Besucher gestern:", impVisTotal: "Besucher gesamt:"
    },
    en: {
        subText: "Long-term browsergame (c) 2026 by", statA: "Current Session:", statG: "Total Playtime:",
        statStreak: "Current Streak:", statMaxStreak: "Longest Streak:", statB: "Active Points Today:", statE: "Total Active Points:",
        statC: "Inactive Points Today:", statF: "Total Inactive Points:", statClicks: "Manual Clicks on Number:", statClickPts: "Points from Manual Clicks:",
        statI: "Coins Clicked Today:", statK: "Total Coins Clicked:", statJ: "Coin Points Today:", statL: "Total Coin Points:",
        statH: "Coins (Clicked / Shown / %):", statRain: "Coin Rain Events:", statRank: "Current Status:", statPrestige: "Prestige Level:",
        toggleBtn: "DE", btnReset: "Reset", btnGuide: "Guide", btnYouTube: "YouTube", btnImprint: "Imprint", btnPrestige: "Prestige", btnTheme: "Theme", btnQuests: "Quests",
        questsTitle: "Daily Quests", quest1: "1. Click 15 Coins:", quest2: "2. Click the number 500 times:", quest3: "3. Play actively for 10 minutes:",
        resetTitle: "Reset Game?", resetText: "Do you really want to delete your entire game progress and all statistics?", btnResetYes: "Yes, reset", btnResetNo: "No, cancel",
        guideModalTitle: "Guide", guideH1: "Goal of the game", guideP1: "Collect as many points as possible and climb the ranks!",
        guideH2: "Earning points", guideP2: "The number grows automatically – every second. If you are offline, you will earn inactive points after at least an hour. You can also actively click the big number to generate points directly!",
        guideH3: "Coins", guideP3: "Keep your eyes peeled! Coins appear from time to time. Click them quickly before they disappear to secure a nice bonus.",
        guideH4: "Missions & Bonuses", guideP4: "Check back daily to collect your streak bonus, and complete the daily quests for extra points.",
        btnClose: "Close", statVisitorsText: "players since", btnSnowShovel: "Snow Shovel",
        impVisSince: "Visitors since (Date):", impVisOnline: "Currently online:", impVisToday: "Visitors today:", impVisYest: "Visitors yesterday:", impVisTotal: "Total visitors:"
    }
};

window.onload = function() {
    applyLanguage();
    document.getElementById('langToggle').addEventListener('click', function() {
        currentLang = currentLang === 'de' ? 'en' : 'de';
        localStorage.setItem('bngu_lang', currentLang);
        applyLanguage(); updateUI(); updateTitle();
    });

    document.getElementById('scoreDisplay').addEventListener('click', handleManualClick);
    document.getElementById('btnPrestige').addEventListener('click', doPrestige);
    
    document.getElementById('btnTheme').addEventListener('click', function() {
        gameState.settings.themeIndex = (gameState.settings.themeIndex + 1) % themes.length;
        applyTheme(); saveState();
    });

    document.getElementById('btnReset').addEventListener('click', function() {
        document.getElementById('resetModal').classList.remove('hidden');
    });
    document.getElementById('btnResetNo').addEventListener('click', function() {
        document.getElementById('resetModal').classList.add('hidden');
    });
    document.getElementById('btnResetYes').addEventListener('click', function() {
        localStorage.removeItem('bngu_save');
        document.getElementById('resetModal').classList.add('hidden');
        location.reload();
    });

    document.getElementById('btnSnowShovel').addEventListener('click', function() {
        location.reload();
    });

    document.getElementById('btnYouTube').addEventListener('click', function() {
        window.open('http://www.youtube.com/@Datenschrauber', '_blank');
    });

    document.getElementById('btnGuide').addEventListener('click', function() {
        document.getElementById('guideModal').classList.remove('hidden');
    });
    document.getElementById('closeGuideBtn').addEventListener('click', function() {
        document.getElementById('guideModal').classList.add('hidden');
    });

    document.getElementById('btnQuests').addEventListener('click', openQuests);
    document.getElementById('closeQuestsBtn').addEventListener('click', () => document.getElementById('questsModal').classList.add('hidden'));
    document.getElementById('btnClaimQuests').addEventListener('click', claimQuests);

    document.getElementById('btnImprint').addEventListener('click', function() {
        const now = new Date();
        if(now.getHours() === 12 && now.getMinutes() === 0) {
            let secretBonus = 10000 * getPrestigeMulti();
            gameState.totalPoints += secretBonus;
            showFloatingText(window.innerWidth / 2, window.innerHeight / 2, "HIGH NOON BONUS! +" + formatNumber(secretBonus), "var(--color-main)");
            updateUI(); saveState();
        }
        document.getElementById('impressumModal').classList.remove('hidden');
    });
    document.getElementById('closeImpressumBtn').addEventListener('click', function() {
        document.getElementById('impressumModal').classList.add('hidden');
    });

    document.getElementById('gameTitle').addEventListener('click', function(e) {
        titleClicks++;
        clearTimeout(titleClickTimer);
        titleClickTimer = setTimeout(() => titleClicks = 0, 1000);
        if(titleClicks >= 10) {
            titleClicks = 0; triggerCoinEvent(true); 
            showFloatingText(e.clientX, e.clientY + 30, "MÜNZ-REGEN!", "var(--color-main)");
        }
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") updateTitle();
    });

    checkCookies();
    initSnow(); 
};

// --- Optimierte Schnee Physik Engine ---
function initSnow() {
    const canvas = document.getElementById('snowCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    let snowTimer = null;
    let isSnowing = false;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    let baseLevels = new Float32Array(0);
    let snowHeights = new Float32Array(0);

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        baseLevels = new Float32Array(canvas.width);
        snowHeights = new Float32Array(canvas.width);
        particles = [];
        
        // Der Boden ist nun einfach der absolute Bildschirmrand
        for(let i=0; i<canvas.width; i++) {
            baseLevels[i] = canvas.height - 2;
        }
    }
    window.addEventListener('resize', resize);

    window.addEventListener('mousedown', (e) => {
        if(e.button === 0) {
            snowTimer = setTimeout(() => { isSnowing = true; }, 1000);
        }
    });
    window.addEventListener('mouseup', () => {
        clearTimeout(snowTimer);
        isSnowing = false;
    });
    window.addEventListener('mouseleave', () => {
        clearTimeout(snowTimer);
        isSnowing = false;
    });
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function renderSnow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Flocken generieren
        if (isSnowing && particles.length < 3000) {
            for (let i = 0; i < 4; i++) {
                particles.push({
                    x: mouseX + (Math.random() * 20 - 10),
                    y: mouseY + (Math.random() * 20 - 10),
                    vx: (Math.random() * 1.5 - 0.75),
                    vy: Math.random() * 1 + 0.5
                });
            }
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        
        ctx.beginPath();
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.vy += 0.05; // Schwerkraft
            
            let nextX = p.x + p.vx;
            let nextY = p.y + p.vy;
            
            let ix = Math.floor(nextX);
            if (ix < 0) ix = 0;
            if (ix >= canvas.width) ix = canvas.width - 1;

            let currentFloor = baseLevels[ix] - snowHeights[ix];

            if (nextY >= currentFloor) {
                // Haufenbildung am Boden
                let floorLeft = ix > 0 ? baseLevels[ix-1] - snowHeights[ix-1] : currentFloor;
                let floorRight = ix < canvas.width-1 ? baseLevels[ix+1] - snowHeights[ix+1] : currentFloor;

                let slideLeft = floorLeft > currentFloor + 2;
                let slideRight = floorRight > currentFloor + 2;

                if (slideLeft && slideRight) {
                    p.x += Math.random() < 0.5 ? -1 : 1;
                    p.y += p.vy; 
                } else if (slideLeft) {
                    p.x -= 1;
                    p.y += p.vy;
                } else if (slideRight) {
                    p.x += 1;
                    p.y += p.vy;
                } else {
                    snowHeights[ix] += 1; 
                    if(ix > 0 && snowHeights[ix-1] < snowHeights[ix]) snowHeights[ix-1] += 0.3; 
                    if(ix < canvas.width-1 && snowHeights[ix+1] < snowHeights[ix]) snowHeights[ix+1] += 0.3;
                    particles.splice(i, 1); 
                }
            } else {
                p.x = nextX;
                p.y = nextY;
                ctx.rect(p.x, p.y, 2, 2); 
            }
        }
        ctx.fill();

        // Zeichnen des liegenden Schnees 
        for(let x = 0; x < canvas.width; x++) {
            if (snowHeights[x] > 0.5) {
                ctx.fillRect(x, baseLevels[x] - snowHeights[x], 1, snowHeights[x]);
            }
        }

        requestAnimationFrame(renderSnow);
    }
    
    resize(); 
    renderSnow();
}
// --- Ende Schnee ---

function isHappyHour() {
    const d = new Date();
    const day = d.getDay(); const hour = d.getHours();
    return day === 0 || day === 6 || (day === 5 && hour >= 18); 
}

function getPrestigeMulti() { return 1 + (gameState.stats.prestigeLevel || 0); }

function applyTheme() { document.body.className = themes[gameState.settings.themeIndex || 0]; }

function openQuests() {
    updateQuestsUI();
    document.getElementById('questsModal').classList.remove('hidden');
}

function updateQuestsUI() {
    const coinsDone = Math.min(gameState.stats.coinsClickedToday || 0, 15);
    const clicksDone = Math.min(gameState.stats.manualClicksToday || 0, 500);
    const minsDone = Math.min(Math.floor((gameState.stats.activeSecondsToday || 0) / 60), 10);
    
    document.getElementById('qCoins').innerText = `${coinsDone}/15`;
    document.getElementById('qClicks').innerText = `${clicksDone}/500`;
    document.getElementById('qTime').innerText = `${minsDone}/10 Min`;
    
    const allDone = (coinsDone >= 15 && clicksDone >= 500 && minsDone >= 10);
    const btnClaim = document.getElementById('btnClaimQuests');
    
    if (gameState.stats.questsClaimedToday) {
        btnClaim.innerText = currentLang === 'de' ? "Bereits eingesammelt!" : "Already claimed!";
        btnClaim.disabled = true;
    } else if (allDone) {
        btnClaim.innerText = currentLang === 'de' ? "Belohnung (500 Pkt) einsammeln" : "Claim Reward (500 Pts)";
        btnClaim.disabled = false;
    } else {
        btnClaim.innerText = currentLang === 'de' ? "Noch nicht erfüllt" : "Not yet completed";
        btnClaim.disabled = true;
    }
}

function claimQuests() {
    if(!gameState.stats.questsClaimedToday) {
        gameState.stats.questsClaimedToday = true;
        const reward = 500 * getPrestigeMulti();
        gameState.totalPoints += reward;
        showFloatingText(window.innerWidth / 2, window.innerHeight / 2, "+" + formatNumber(reward) + " Missionen!", "var(--color-main)");
        updateQuestsUI(); updateUI(); saveState();
    }
}

function handleManualClick(e) {
    const pMulti = getPrestigeMulti();
    const points = 1 * getCurrentMilestone().activeMulti * pMulti;
    
    gameState.totalPoints += points;
    gameState.stats.manualClicksTotal = (gameState.stats.manualClicksTotal || 0) + 1;
    gameState.stats.manualClicksToday = (gameState.stats.manualClicksToday || 0) + 1; 
    gameState.stats.manualPointsTotal = (gameState.stats.manualPointsTotal || 0) + points;
    gameState.stats.activePointsToday += points;
    gameState.stats.activePointsTotal += points;

    showFloatingText(e.clientX, e.clientY - 20, "+" + formatNumber(points), "var(--color-text)");
    checkMilestoneUp(); updateUI(); saveState();
}

function doPrestige() {
    const msg = currentLang === 'de' 
        ? "Möchten Sie Prestige aktivieren? Punkte und Ränge werden zurückgesetzt, aber Sie erhalten dauerhaft +1 Multiplikator!"
        : "Activate Prestige? Points and ranks will reset, but you permanently gain +1 multiplier!";
    if (confirm(msg)) {
        gameState.totalPoints = 0;
        gameState.stats.highestMilestoneIndex = 0;
        gameState.stats.prestigeLevel = (gameState.stats.prestigeLevel || 0) + 1;
        updateUI(); saveState();
    }
}

function checkDailyBonus() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (!gameState.stats.currentStreak) gameState.stats.currentStreak = 0;
    if (!gameState.stats.maxStreak) gameState.stats.maxStreak = 0;

    if (gameState.lastLoginDayStart) {
        const diffDays = Math.round((todayStart - gameState.lastLoginDayStart) / 86400000);
        if (diffDays === 1) {
            gameState.stats.currentStreak += 1;
            gameState.stats.maxStreak = Math.max(gameState.stats.currentStreak, gameState.stats.maxStreak);
            let bonus = gameState.stats.currentStreak * 50 * getPrestigeMulti(); 
            gameState.totalPoints += bonus;
            showDailyModal(bonus, gameState.stats.currentStreak);
        } else if (diffDays > 1) {
            gameState.stats.currentStreak = 1;
            let bonus = 50 * getPrestigeMulti(); 
            gameState.totalPoints += bonus;
            showDailyModal(bonus, 1);
        }
    } else {
        gameState.stats.currentStreak = 1; gameState.stats.maxStreak = 1;
    }
    gameState.lastLoginDayStart = todayStart;
    saveState();
}

function showDailyModal(bonusAmount, streakDays) {
    const title = currentLang === 'de' ? "Täglicher Bonus!" : "Daily Bonus!";
    const text = currentLang === 'de' 
        ? `Streak: ${streakDays} Tag(e). Du erhältst +${formatNumber(bonusAmount)} Punkte.`
        : `Streak: ${streakDays} Day(s). You receive +${formatNumber(bonusAmount)} points.`;
    document.getElementById('dailyTitle').innerText = title;
    document.getElementById('dailyText').innerText = text;
    document.getElementById('dailyModal').classList.remove('hidden');
    document.getElementById('dailyBtn').onclick = () => document.getElementById('dailyModal').classList.add('hidden');
}

function getCurrentMilestone() {
    let current = milestones[0];
    for (let i = 0; i < milestones.length; i++) {
        if (gameState.totalPoints >= milestones[i].threshold) current = milestones[i];
    }
    return current;
}

function checkMilestoneUp() {
    const currentMilestone = getCurrentMilestone();
    const currentIndex = milestones.indexOf(currentMilestone);
    if (typeof gameState.stats.highestMilestoneIndex === 'undefined') gameState.stats.highestMilestoneIndex = 0;
    if (currentIndex > gameState.stats.highestMilestoneIndex) {
        gameState.stats.highestMilestoneIndex = currentIndex;
        triggerFirework();
    }
}

function triggerFirework() {
    const centerX = window.innerWidth / 2; const centerY = window.innerHeight / 2;
    for (let i = 0; i < 50; i++) {
        let p = document.createElement('div'); p.classList.add('particle');
        p.style.left = centerX + 'px'; p.style.top = centerY + 'px';
        p.style.setProperty('--tx', (Math.random() * 600 - 300) + 'px');
        p.style.setProperty('--ty', (Math.random() * 600 - 300) + 'px');
        p.style.backgroundColor = Math.random() > 0.5 ? 'var(--color-main)' : 'var(--color-accent)';
        document.body.appendChild(p); setTimeout(() => p.remove(), 1500);
    }
}

function showFloatingText(x, y, text, color) {
    const el = document.createElement('div'); el.innerText = text; el.className = 'floating-text';
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.color = color;
    document.body.appendChild(el); setTimeout(() => el.remove(), 1000);
}

function applyLanguage() {
    const t = translations[currentLang];
    document.getElementById('langToggle').innerText = t.toggleBtn;
    document.getElementById('subTextContent').innerText = t.subText + " ";
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n'); if (t[key]) el.innerHTML = t[key];
    });
    if(!document.getElementById('questsModal').classList.contains('hidden')) updateQuestsUI();
}

function formatNumber(num) {
    return new Intl.NumberFormat(currentLang === 'de' ? 'de-DE' : 'en-US').format(num);
}

function checkCookies() {
    if (localStorage.getItem('bngu_cookie_accepted') === 'true') startGame();
    else {
        document.getElementById('cookieBanner').classList.remove('hidden');
        document.getElementById('acceptCookies').addEventListener('click', function() {
            localStorage.setItem('bngu_cookie_accepted', 'true');
            document.getElementById('cookieBanner').classList.add('hidden');
            startGame();
        });
    }
}

function startGame() {
    loadState(); applyTheme(); calculateOfflineProgress(); checkDailyBonus();
    currentSessionStartTime = Date.now();
    updateUI(); document.getElementById('gameContainer').classList.remove('hidden');
    
    updateTitle(); setInterval(updateTitle, 15000);
    setInterval(gameLoop, 1000); scheduleNextCoinEvent();
}

function updateTitle() {
    document.title = formatNumber(Math.floor(gameState.totalPoints)) + " - Big Number Go Up!";
}

function loadState() {
    const saved = localStorage.getItem('bngu_save');
    if (saved) {
        gameState = JSON.parse(saved);
        if (typeof gameState.stats.highestMilestoneIndex === 'undefined') gameState.stats.highestMilestoneIndex = 0;
        
        gameState.stats.manualClicksTotal = gameState.stats.manualClicksTotal || 0;
        gameState.stats.manualClicksToday = gameState.stats.manualClicksToday || 0;
        gameState.stats.activeSecondsToday = gameState.stats.activeSecondsToday || 0;
        gameState.stats.questsClaimedToday = gameState.stats.questsClaimedToday || false;
        
        gameState.stats.manualPointsTotal = gameState.stats.manualPointsTotal || 0;
        gameState.stats.coinRainsTotal = gameState.stats.coinRainsTotal || 0;
        gameState.stats.prestigeLevel = gameState.stats.prestigeLevel || 0;
        gameState.settings = gameState.settings || { themeIndex: 0 };
    } else {
        gameState.firstVisitTime = Date.now();
    }
    
    const today = new Date().toDateString();
    if (gameState.lastDate !== today) {
        gameState.stats.activePointsToday = 0; gameState.stats.inactivePointsToday = 0;
        gameState.stats.coinsClickedToday = 0; gameState.stats.coinPointsToday = 0;
        gameState.stats.manualClicksToday = 0; gameState.stats.activeSecondsToday = 0;
        gameState.stats.questsClaimedToday = false;
        gameState.lastDate = today;
    }
}

function saveState() {
    gameState.lastVisitTime = Date.now();
    localStorage.setItem('bngu_save', JSON.stringify(gameState));
}

function calculateOfflineProgress() {
    if (!gameState.lastVisitTime) return;
    const now = Date.now();
    const offlineMs = now - gameState.lastVisitTime;
    const offlineHours = Math.floor(offlineMs / (1000 * 60 * 60)); 

    if (offlineHours > 0) {
        const earnedPoints = offlineHours * getCurrentMilestone().inactiveMulti * getPrestigeMulti();
        gameState.totalPoints += earnedPoints;
        gameState.stats.inactivePointsToday += earnedPoints;
        gameState.stats.inactivePointsTotal += earnedPoints;
        checkMilestoneUp();
    }
}

function gameLoop() {
    const today = new Date().toDateString();
    if (gameState.lastDate !== today) {
        gameState.stats.activePointsToday = 0; gameState.stats.inactivePointsToday = 0;
        gameState.stats.coinsClickedToday = 0; gameState.stats.coinPointsToday = 0;
        gameState.stats.manualClicksToday = 0; gameState.stats.activeSecondsToday = 0;
        gameState.stats.questsClaimedToday = false;
        gameState.lastDate = today;
    }

    gameState.stats.activeSecondsToday = (gameState.stats.activeSecondsToday || 0) + 1;

    const pointsToGive = getCurrentMilestone().activeMulti * getPrestigeMulti();

    gameState.totalPoints += pointsToGive;
    gameState.stats.activePointsToday += pointsToGive;
    gameState.stats.activePointsTotal += pointsToGive;

    checkMilestoneUp(); updateUI(); saveState();
}

function scheduleNextCoinEvent() {
    let delay = Math.floor(Math.random() * (180000 - 60000 + 1)) + 60000;
    if (isHappyHour()) delay = Math.floor(delay / 2);
    coinTimeout = setTimeout(triggerCoinEvent, delay);
}

function triggerCoinEvent(forceFrenzy = false) {
    const isFrenzy = forceFrenzy || Math.random() < 0.02; 
    if (isFrenzy) {
        gameState.stats.coinRainsTotal = (gameState.stats.coinRainsTotal || 0) + 1;
        const dropCount = Math.floor(Math.random() * 6) + 5; 
        for(let i=0; i<dropCount; i++) setTimeout(() => spawnSingleCoin(true), i * 150);
    } else {
        spawnSingleCoin(false);
    }
    scheduleNextCoinEvent();
}

function spawnSingleCoin(fromFrenzy) {
    const coin = document.createElement('div'); coin.classList.add('coin');
    const isEpic = Math.random() < 0.10;
    if (isEpic) coin.classList.add('epic');

    let value = (Math.floor(Math.random() * 10) + 1 + getCurrentMilestone().coinBonus) * getPrestigeMulti();
    if (isEpic) value *= 5;
    coin.innerText = formatNumber(value);

    coin.style.left = Math.floor(Math.random() * (window.innerWidth - 50)) + 'px';
    coin.style.top = Math.floor(Math.random() * (window.innerHeight - 50)) + 'px';
    document.body.appendChild(coin);
    gameState.stats.coinsShownTotal += 1;

    let clicked = false;
    coin.addEventListener('click', function(event) {
        if(clicked) return; clicked = true;
        gameState.totalPoints += value;
        gameState.stats.coinsClickedToday += 1; gameState.stats.coinsClickedTotal += 1;
        gameState.stats.coinPointsToday += value; gameState.stats.coinPointsTotal += value;
        
        showFloatingText(event.clientX, event.clientY - 20, "+" + formatNumber(value), isEpic ? "var(--color-accent)" : "var(--color-main)");
        coin.remove(); checkMilestoneUp(); updateUI(); saveState();
    });

    const lifespan = fromFrenzy ? 3000 : Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
    setTimeout(() => { if (document.body.contains(coin)) coin.remove(); }, lifespan);
}

function updateUI() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.innerText = formatNumber(Math.floor(gameState.totalPoints));
    
    const currentMilestone = getCurrentMilestone();
    const currentIndex = milestones.indexOf(currentMilestone);
    
    if (currentMilestone.glow) scoreDisplay.classList.add('glow-effect');
    else scoreDisplay.classList.remove('glow-effect');

    if(isHappyHour()) document.getElementById('happyHourBadge').classList.remove('hidden');
    else document.getElementById('happyHourBadge').classList.add('hidden');

    let nextRankInfo = "";
    if (currentIndex < milestones.length - 1) {
        const pointsNeeded = milestones[currentIndex + 1].threshold - Math.floor(gameState.totalPoints);
        nextRankInfo = ` <span style="color: var(--color-text); font-weight: normal;">(${formatNumber(pointsNeeded)})</span>`;
    } else {
        nextRankInfo = ` <span style="color: var(--color-text); font-weight: normal;">(Max)</span>`;
        document.getElementById('btnPrestige').classList.remove('hidden'); 
    }
    
    if (gameState.stats.prestigeLevel > 0) document.getElementById('btnTheme').classList.remove('hidden');

    document.getElementById('statFutureVal').innerHTML = (currentLang === 'de' ? currentMilestone.de : currentMilestone.en) + nextRankInfo;

    const sessionMs = Date.now() - currentSessionStartTime;
    const totalGameMs = Date.now() - gameState.firstVisitTime;
    let coinPercent = gameState.stats.coinsShownTotal > 0 ? (gameState.stats.coinsClickedTotal / gameState.stats.coinsShownTotal) * 100 : 0;

    document.getElementById('statA').innerText = formatHMS(sessionMs);
    document.getElementById('statG').innerText = formatDHMS(totalGameMs);
    document.getElementById('statStreak').innerText = `${formatNumber(gameState.stats.currentStreak)} Tag(e)`;
    document.getElementById('statMaxStreak').innerText = `${formatNumber(gameState.stats.maxStreak)} Tag(e)`;
    document.getElementById('statB').innerText = formatNumber(gameState.stats.activePointsToday);
    document.getElementById('statE').innerText = formatNumber(gameState.stats.activePointsTotal);
    document.getElementById('statC').innerText = formatNumber(gameState.stats.inactivePointsToday);
    document.getElementById('statF').innerText = formatNumber(gameState.stats.inactivePointsTotal);
    document.getElementById('statClicks').innerText = formatNumber(gameState.stats.manualClicksTotal || 0);
    document.getElementById('statClickPts').innerText = formatNumber(gameState.stats.manualPointsTotal || 0);
    document.getElementById('statI').innerText = formatNumber(gameState.stats.coinsClickedToday);
    document.getElementById('statK').innerText = formatNumber(gameState.stats.coinsClickedTotal);
    document.getElementById('statJ').innerText = formatNumber(gameState.stats.coinPointsToday);
    document.getElementById('statL').innerText = formatNumber(gameState.stats.coinPointsTotal);
    document.getElementById('statH').innerText = `${formatNumber(gameState.stats.coinsClickedTotal)} / ${formatNumber(gameState.stats.coinsShownTotal)} / ${coinPercent.toFixed(1)}%`;
    document.getElementById('statRain').innerText = formatNumber(gameState.stats.coinRainsTotal || 0);
    document.getElementById('statPrestige').innerText = formatNumber(gameState.stats.prestigeLevel || 0);
    
    if(!document.getElementById('questsModal').classList.contains('hidden')) updateQuestsUI();
}

function formatHMS(ms) {
    let t = Math.floor(ms / 1000); let h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatDHMS(ms) {
    let t = Math.floor(ms / 1000); let d = Math.floor(t / 86400), h = Math.floor((t % 86400) / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return `${formatNumber(d)}:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
