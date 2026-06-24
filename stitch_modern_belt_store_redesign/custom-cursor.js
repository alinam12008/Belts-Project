(function () {
    'use strict';

    var STORAGE_KEY = 'belts_custom_cursor';
    var MAX_PARTICLES = 5;
    var COLORS = ['#ffffff', '#dbeafe', '#93c5fd', '#003178', '#60a5fa'];

    var cursor, canvas, ctx, gearWrap;
    var mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    var prevMouseX = 0, prevMouseY = 0;
    var particles = [];
    var lastTime = 0;
    var emitTick = 0;
    var rafCursor = null;
    var rafParticles = null;
    var hasMoved = false;
    var moveTimeout = null;
    var toggleButtons = [];

    var storedPref = localStorage.getItem(STORAGE_KEY);
    var enabledByUser = storedPref === null ? true : storedPref !== '0';
    if (storedPref === null) {
        localStorage.setItem(STORAGE_KEY, '1');
    }

    function tr(key, fallback) {
        if (window.i18n && typeof window.i18n.t === 'function') {
            var val = window.i18n.t(key);
            if (val && val !== key) return val;
        }
        return fallback;
    }

    function canUseCustomCursor() {
        return window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
    }

    function isActive() {
        return enabledByUser && canUseCustomCursor();
    }

    /* 8-tooth blocky gear — flat outer faces, sharp corners (matches reference icon) */
    var GEAR_PATH = 'M 41.2 6.6 L 58.8 6.6 L 62.0 20.8 L 75.8 13.6 L 85.6 23.4 L 79.1 37.8 L 93.4 42.5 L 93.4 57.5 L 79.1 62.2 L 85.6 76.6 L 75.8 86.4 L 62.0 79.2 L 58.8 93.4 L 41.2 93.4 L 37.9 79.2 L 24.2 86.4 L 14.4 76.6 L 20.9 62.2 L 6.6 57.5 L 6.6 42.5 L 20.9 37.8 L 14.4 23.4 L 24.2 13.6 L 37.9 20.8 Z';

    function injectMarkup() {
        if (document.getElementById('custom-cursor')) return;

        var wrap = document.createElement('div');
        wrap.innerHTML =
            '<div id="custom-cursor" aria-hidden="true">' +
                '<div class="cursor-gear-wrap">' +
                    '<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<defs>' +
                            '<radialGradient id="gearMetal" cx="50%" cy="40%" r="60%">' +
                                '<stop offset="0%" stop-color="#2F4B7C"/>' +
                                '<stop offset="45%" stop-color="#1E2F57"/>' +
                                '<stop offset="100%" stop-color="#0F1A33"/>' +
                            '</radialGradient>' +
                            '<radialGradient id="hubMetal" cx="50%" cy="50%" r="60%">' +
                                '<stop offset="0%" stop-color="#FFFFFF"/>' +
                                '<stop offset="40%" stop-color="#D6DAE3"/>' +
                                '<stop offset="100%" stop-color="#8B95A6"/>' +
                            '</radialGradient>' +
                            '<linearGradient id="toothSheen" x1="30%" y1="0%" x2="70%" y2="100%">' +
                                '<stop offset="0%" stop-color="#6B8FC4" stop-opacity="0.45"/>' +
                                '<stop offset="55%" stop-color="#003178" stop-opacity="0.08"/>' +
                                '<stop offset="100%" stop-color="#0F1A33" stop-opacity="0"/>' +
                            '</linearGradient>' +
                            '<radialGradient id="specular" cx="38%" cy="32%" r="45%">' +
                                '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>' +
                                '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>' +
                            '</radialGradient>' +
                        '</defs>' +
                        '<path d="' + GEAR_PATH + '" fill="url(#gearMetal)" stroke="#4A6FA5" stroke-width="0.6" stroke-linejoin="miter"/>' +
                        '<path d="' + GEAR_PATH + '" fill="url(#toothSheen)"/>' +
                        '<circle cx="50" cy="50" r="18" fill="url(#hubMetal)" stroke="#A0AAB8" stroke-width="1.2"/>' +
                        '<circle cx="50" cy="50" r="12" fill="none" stroke="#C0C8D4" stroke-width="0.8" opacity="0.6"/>' +
                        '<circle cx="50" cy="50" r="8" fill="#003178" stroke="#0D47A1" stroke-width="1"/>' +
                        '<g transform="translate(50, 50)">' +
                            '<circle cx="0" cy="-14" r="2.5" fill="#3A4452" stroke="#1F2630" stroke-width="0.5"/>' +
                            '<circle cx="12.1" cy="-7" r="2.5" fill="#3A4452" stroke="#1F2630" stroke-width="0.5"/>' +
                            '<circle cx="12.1" cy="7" r="2.5" fill="#3A4452" stroke="#1F2630" stroke-width="0.5"/>' +
                            '<circle cx="0" cy="14" r="2.5" fill="#3A4452" stroke="#1F2630" stroke-width="0.5"/>' +
                            '<circle cx="-12.1" cy="7" r="2.5" fill="#3A4452" stroke="#1F2630" stroke-width="0.5"/>' +
                            '<circle cx="-12.1" cy="-7" r="2.5" fill="#3A4452" stroke="#1F2630" stroke-width="0.5"/>' +
                        '</g>' +
                        '<circle cx="50" cy="50" r="3" fill="#050D1F"/>' +
                        '<circle cx="50" cy="49" r="1.5" fill="#4A7ABA" opacity="0.8"/>' +
                        '<ellipse cx="42" cy="38" rx="22" ry="16" fill="url(#specular)"/>' +
                    '</svg>' +
                '</div>' +
            '</div>' +
            '<canvas id="particle-canvas" aria-hidden="true"></canvas>';

        document.body.appendChild(wrap.firstElementChild);
        document.body.appendChild(wrap.lastElementChild);

        cursor = document.getElementById('custom-cursor');
        canvas = document.getElementById('particle-canvas');
        gearWrap = cursor.querySelector('.cursor-gear-wrap');
        ctx = canvas.getContext('2d');
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function markReady() {
        if (!hasMoved) {
            hasMoved = true;
            cursorX = mouseX;
            cursorY = mouseY;
            if (cursor) {
                cursor.style.left = cursorX + 'px';
                cursor.style.top = cursorY + 'px';
                cursor.classList.add('cursor-ready');
            }
            if (canvas) canvas.classList.add('cursor-ready');
        }
    }

    function updateToggleUI() {
        var active = enabledByUser;
        var labelOn = tr('cursor_gear_on', 'Gear cursor on');
        var labelOff = tr('cursor_gear_off', 'Use default cursor');

        toggleButtons.forEach(function (btn) {
            if (!btn) return;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            btn.setAttribute('title', active ? labelOn : labelOff);
            btn.setAttribute('aria-label', active ? labelOn : labelOff);

            var icon = btn.querySelector('.material-symbols-outlined');
            if (icon && (btn.id === 'cursor-toggle-btn' || btn.id === 'cursor-toggle-mobile')) {
                icon.textContent = active ? 'precision_manufacturing' : 'mouse';
            }
        });

        var mobileLabel = document.getElementById('cursor-toggle-mobile-label');
        if (mobileLabel) {
            mobileLabel.textContent = active
                ? tr('cursor_gear_mode', 'Gear Cursor')
                : tr('cursor_default_mode', 'Default Cursor');
        }
    }

    function applyState() {
        document.body.classList.toggle('custom-cursor-active', isActive());
        updateToggleUI();

        if (isActive()) {
            startLoops();
        } else {
            stopLoops();
            hasMoved = false;
            if (cursor) {
                cursor.classList.remove('hover', 'cursor-ready', 'is-moving');
            }
            if (canvas) canvas.classList.remove('cursor-ready');
        }
    }

    function onMouseMove(e) {
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        markReady();

        if (!isActive()) return;

        var speed = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);
        if (gearWrap) {
            gearWrap.style.animationDuration = speed > 5 ? '5s' : speed > 2 ? '9s' : '14s';
        }

        if (cursor) {
            cursor.classList.add('is-moving');
            clearTimeout(moveTimeout);
            moveTimeout = setTimeout(function () {
                if (cursor) cursor.classList.remove('is-moving');
            }, 120);
        }

        emitTick++;
        if (speed > 2 && particles.length < MAX_PARTICLES && emitTick % 3 === 0) {
            particles.push(new Particle(e.clientX, e.clientY, speed));
        }
    }

    function updateCursorPosition() {
        if (!isActive() || !cursor) return;
        var easing = 0.18;
        cursorX += (mouseX - cursorX) * easing;
        cursorY += (mouseY - cursorY) * easing;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        rafCursor = requestAnimationFrame(updateCursorPosition);
    }

    function Particle(x, y, speed) {
        var angle = Math.random() * Math.PI * 2;
        var dist = Math.random() * 5;
        this.x = x + Math.cos(angle) * dist;
        this.y = y + Math.sin(angle) * dist;
        this.vx = (Math.random() - 0.5) * (0.4 + speed * 0.04);
        this.vy = (Math.random() - 0.5) * (0.4 + speed * 0.04);
        this.life = 1;
        this.maxLife = 0.55 + Math.random() * 0.45;
        this.size = 1.4 + Math.random() * (speed > 4 ? 2.2 : 1.4);
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.sparkle = Math.random() > 0.72;
    }

    Particle.prototype.update = function (dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= dt / this.maxLife;
        this.size *= 0.991;
    };

    Particle.prototype.draw = function () {
        if (this.life <= 0) return;
        var fade = Math.pow(this.life, 1.5);
        ctx.globalAlpha = fade * (this.sparkle ? 0.9 : 0.65);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.sparkle ? 5 : 3;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.sparkle) {
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x + this.size * 0.35, this.y);
            ctx.lineTo(this.x, this.y + this.size);
            ctx.lineTo(this.x - this.size * 0.35, this.y);
            ctx.closePath();
        } else {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    };

    function animateParticles(time) {
        if (!isActive() || !ctx || !canvas) return;
        var dt = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = particles.length - 1; i >= 0; i--) {
            particles[i].update(dt);
            if (particles[i].life <= 0) particles.splice(i, 1);
            else particles[i].draw();
        }
        rafParticles = requestAnimationFrame(animateParticles);
    }

    function startLoops() {
        if (rafCursor) return;
        rafCursor = requestAnimationFrame(updateCursorPosition);
        lastTime = performance.now();
        rafParticles = requestAnimationFrame(animateParticles);
    }

    function stopLoops() {
        if (rafCursor) {
            cancelAnimationFrame(rafCursor);
            rafCursor = null;
        }
        if (rafParticles) {
            cancelAnimationFrame(rafParticles);
            rafParticles = null;
        }
        particles = [];
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function bindHoverDetection() {
        var interactive = 'a, button, input, textarea, select, [role="button"], .interactive, label[for]';

        document.addEventListener('mouseover', function (e) {
            if (!isActive() || !cursor) return;
            if (e.target.closest(interactive)) cursor.classList.add('hover');
        });

        document.addEventListener('mouseout', function (e) {
            if (!cursor) return;
            if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(interactive)) {
                cursor.classList.remove('hover');
            }
        });
    }

    function setEnabled(enabled) {
        enabledByUser = !!enabled;
        localStorage.setItem(STORAGE_KEY, enabledByUser ? '1' : '0');
        applyState();
    }

    function toggle() {
        setEnabled(!enabledByUser);
    }

    function registerToggleButton(btn) {
        if (!btn || toggleButtons.indexOf(btn) !== -1) return;
        toggleButtons.push(btn);
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            toggle();
        });
        updateToggleUI();
    }

    function init() {
        if (document.body.classList.contains('admin-page') || /admin\.html/i.test(window.location.pathname)) {
            return;
        }

        injectMarkup();
        resizeCanvas();
        window.addEventListener('resize', function () {
            resizeCanvas();
            applyState();
        });
        document.addEventListener('mousemove', onMouseMove);
        bindHoverDetection();
        applyState();
        document.addEventListener('languageChanged', updateToggleUI);
    }

    window.CustomCursor = {
        isEnabledByUser: function () { return enabledByUser; },
        isActive: isActive,
        setEnabled: setEnabled,
        toggle: toggle,
        registerToggleButton: registerToggleButton,
        updateToggleUI: updateToggleUI
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
