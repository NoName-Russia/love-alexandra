// ==========================================
// НАСТРОЙКИ
// ==========================================

const relationshipStart = new Date("2026-05-11T00:00:00");

let websiteOpened = false;
let currentTrack = null;
let timerStarted = false;


// ==========================================
// ПОЛУЧАЕМ ЭЛЕМЕНТЫ
// ==========================================

const intro = document.getElementById("intro");
const envelope = document.getElementById("envelope");
const site = document.getElementById("site");

const backgroundMusic =
    document.getElementById("backgroundMusic");

const musicButton =
    document.getElementById("musicButton");

const modal =
    document.getElementById("modal");

const modalImage =
    document.getElementById("modalImage");


// ==========================================
// ОТКРЫТИЕ КОНВЕРТА
// ==========================================

function openLetter(event) {

    if (event) {
        event.stopPropagation();
    }

    if (websiteOpened) {
        return;
    }

    websiteOpened = true;

    if (envelope) {
        envelope.classList.add("open");
    }

    // Пробуем запустить музыку после клика
    startBackgroundMusic();

    setTimeout(() => {

        if (intro) {
            intro.classList.add("hidden");
        }

        if (site) {
            site.classList.add("visible");
        }

        startTimer();

    }, 900);
}


// ==========================================
// ФОРМАТ ВРЕМЕНИ
// ==========================================

function formatMusicTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secondsPart =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${secondsPart}`;
}


// ==========================================
// ПОЛУЧИТЬ ЭЛЕМЕНТЫ ПЕСНИ
// ==========================================

function getTrackElements(audioId) {

    const audio =
        document.getElementById(audioId);

    if (!audio) {
        return null;
    }

    const track =
        audio.closest(".music-track");

    if (!track) {
        return null;
    }

    const button =
        track.querySelector(".track-play");

    const range =
        document.getElementById(
            audioId + "Range"
        );

    const current =
        document.getElementById(
            audioId + "Current"
        );

    const duration =
        document.getElementById(
            audioId + "Duration"
        );

    return {
        audio,
        track,
        button,
        range,
        current,
        duration
    };
}


// ==========================================
// ГЛАВНАЯ КНОПКА МУЗЫКИ
// ==========================================
// Это функция для кнопки на главной странице:
// onclick="toggleMusic()"

function toggleMusic() {

    const audio =
        document.getElementById("backgroundMusic");

    if (!audio) {
        console.error(
            "Не найден backgroundMusic"
        );
        return;
    }

    const button =
        document.getElementById("musicButton");

    if (!audio.paused) {

        audio.pause();

        if (button) {
            button.textContent = "▶";
        }

        const elements =
            getTrackElements("backgroundMusic");

        if (elements) {
            elements.track.classList.remove("playing");

            if (elements.button) {
                elements.button.textContent = "▶";
            }
        }

        currentTrack = null;

        return;
    }

    stopOtherTracks(audio);

    audio.volume = 0.3;

    audio.play()
        .then(() => {

            currentTrack = audio;

            if (button) {
                button.textContent = "❚❚";
            }

            const elements =
                getTrackElements("backgroundMusic");

            if (elements) {

                elements.track
                    .classList.add("playing");

                if (elements.button) {
                    elements.button.textContent =
                        "❚❚";
                }
            }

        })
        .catch(error => {

            console.error(
                "Ошибка запуска музыки:",
                error
            );

        });
}


// ==========================================
// ОСТАНОВИТЬ ДРУГИЕ ПЕСНИ
// ==========================================

function stopOtherTracks(exceptAudio) {

    document
        .querySelectorAll(".music-track audio")
        .forEach(audio => {

            if (audio === exceptAudio) {
                return;
            }

            audio.pause();
            audio.currentTime = 0;

            const elements =
                getTrackElements(audio.id);

            if (elements) {

                elements.track
                    .classList.remove("playing");

                if (elements.button) {
                    elements.button.textContent =
                        "▶";
                }

                if (elements.range) {
                    elements.range.value = 0;
                }

                if (elements.current) {
                    elements.current.textContent =
                        "0:00";
                }
            }
        });
}


// ==========================================
// PLAY / PAUSE ПЕСНИ
// ==========================================

function toggleTrack(audioId, button) {

    const elements =
        getTrackElements(audioId);

    if (!elements) {
        console.error(
            "Не найдена песня:",
            audioId
        );
        return;
    }

    const audio =
        elements.audio;


    // ------------------------------
    // ПАУЗА
    // ------------------------------

    if (!audio.paused) {

        audio.pause();

        if (button) {
            button.textContent = "▶";
        }

        elements.track
            .classList.remove("playing");

        if (audio === currentTrack) {
            currentTrack = null;
        }

        // Если это главная песня
        if (audioId === "backgroundMusic") {

            if (musicButton) {
                musicButton.textContent = "▶";
            }
        }

        return;
    }


    // ------------------------------
    // ОСТАНАВЛИВАЕМ ДРУГИЕ
    // ------------------------------

    stopOtherTracks(audio);


    // ------------------------------
    // ЗАПУСК
    // ------------------------------

    audio.volume = 0.3;

    audio.play()
        .then(() => {

            currentTrack = audio;

            if (button) {
                button.textContent = "❚❚";
            }

            elements.track
                .classList.add("playing");


            // Синхронизация кнопки
            // на главной странице

            if (audioId === "backgroundMusic") {

                if (musicButton) {
                    musicButton.textContent =
                        "❚❚";
                }
            }

        })
        .catch(error => {

            console.error(
                "Не удалось запустить песню:",
                error
            );

        });
}


// ==========================================
// ПЕРЕМОТКА
// ==========================================

function seekTrack(audioId, value) {

    const elements =
        getTrackElements(audioId);

    if (!elements) {
        return;
    }

    const audio =
        elements.audio;

    if (
        !Number.isFinite(audio.duration) ||
        audio.duration <= 0
    ) {
        return;
    }

    audio.currentTime =
        (Number(value) / 100) *
        audio.duration;
}


// ==========================================
// ОБНОВЛЕНИЕ ПЛЕЕРА
// ==========================================

function updateMusicTrack(audio) {

    const elements =
        getTrackElements(audio.id);

    if (!elements) {
        return;
    }

    const {
        range,
        current,
        duration
    } = elements;


    // Текущее время

    if (current) {

        current.textContent =
            formatMusicTime(
                audio.currentTime
            );
    }


    // Длительность

    if (
        duration &&
        Number.isFinite(audio.duration)
    ) {

        duration.textContent =
            formatMusicTime(
                audio.duration
            );
    }


    // Ползунок

    if (
        range &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
    ) {

        const percent =
            (audio.currentTime /
                audio.duration) *
            100;

        range.value = percent;

        range.style.background =
            `linear-gradient(
                to right,
                #ff4f9a ${percent}%,
                rgba(255,255,255,0.15) ${percent}%
            )`;
    }
}


// ==========================================
// НАСТРОЙКА АУДИО
// ==========================================

document
    .querySelectorAll(".music-track audio")
    .forEach(audio => {

        audio.volume = 0.3;


        audio.addEventListener(
            "timeupdate",
            () => {
                updateMusicTrack(audio);
            }
        );


        audio.addEventListener(
            "loadedmetadata",
            () => {
                updateMusicTrack(audio);
            }
        );


        audio.addEventListener(
            "ended",
            () => {

                const elements =
                    getTrackElements(
                        audio.id
                    );

                if (!elements) {
                    return;
                }

                if (elements.button) {
                    elements.button.textContent =
                        "▶";
                }

                elements.track
                    .classList.remove("playing");

                if (elements.range) {
                    elements.range.value = 0;
                }

                updateMusicTrack(audio);

                if (audio === currentTrack) {
                    currentTrack = null;
                }


                if (
                    audio.id ===
                    "backgroundMusic"
                ) {

                    if (musicButton) {
                        musicButton.textContent =
                            "▶";
                    }
                }

            }
        );

    });


// ==========================================
// ЗАПУСК ГЛАВНОЙ ПЕСНИ
// ==========================================

function startBackgroundMusic() {

    const audio =
        document.getElementById(
            "backgroundMusic"
        );

    if (!audio) {
        console.error(
            "Файл backgroundMusic не найден"
        );
        return;
    }

    audio.volume = 0.3;

    const elements =
        getTrackElements(
            "backgroundMusic"
        );

    if (!elements) {
        return;
    }

    audio.play()
        .then(() => {

            currentTrack = audio;

            elements.track
                .classList.add("playing");

            if (elements.button) {
                elements.button.textContent =
                    "❚❚";
            }

            if (musicButton) {
                musicButton.textContent =
                    "❚❚";
            }

        })
        .catch(error => {

            console.log(
                "Автозапуск заблокирован браузером."
            );

            console.log(error);

            if (elements.button) {
                elements.button.textContent =
                    "▶";
            }

            if (musicButton) {
                musicButton.textContent =
                    "▶";
            }
        });
}


// ==========================================
// НАВИГАЦИЯ
// ==========================================

function showSection(sectionId, button) {

    const sections =
        document.querySelectorAll(
            ".page-section"
        );

    const buttons =
        document.querySelectorAll(
            ".nav-btn"
        );

    sections.forEach(section => {
        section.classList.remove("active");
    });

    buttons.forEach(btn => {
        btn.classList.remove("active");
    });

    const target =
        document.getElementById(sectionId);

    if (target) {
        target.classList.add("active");
    }

    if (button) {
        button.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// ТАЙМЕР
// ==========================================

function updateTimer() {

    const now = new Date();

    let difference =
        now.getTime() -
        relationshipStart.getTime();

    if (difference < 0) {
        difference = 0;
    }

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days =
        Math.floor(difference / day);

    const hours =
        Math.floor(
            (difference % day) / hour
        );

    const minutes =
        Math.floor(
            (difference % hour) / minute
        );

    const seconds =
        Math.floor(
            (difference % minute) / second
        );


    const daysElement =
        document.getElementById("days");

    const hoursElement =
        document.getElementById("hours");

    const minutesElement =
        document.getElementById("minutes");

    const secondsElement =
        document.getElementById("seconds");


    if (daysElement) {
        daysElement.textContent = days;
    }

    if (hoursElement) {
        hoursElement.textContent =
            String(hours).padStart(2, "0");
    }

    if (minutesElement) {
        minutesElement.textContent =
            String(minutes).padStart(2, "0");
    }

    if (secondsElement) {
        secondsElement.textContent =
            String(seconds).padStart(2, "0");
    }
}


function startTimer() {

    if (timerStarted) {
        return;
    }

    timerStarted = true;

    updateTimer();

    setInterval(
        updateTimer,
        1000
    );
}


// ==========================================
// ФОТО
// ==========================================

function openImage(src) {

    if (!modal || !modalImage) {
        return;
    }

    modalImage.src = src;

    modal.classList.add("active");

    document.body.style.overflow =
        "hidden";
}


function closeImage() {

    if (!modal || !modalImage) {
        return;
    }

    modal.classList.remove("active");

    modalImage.src = "";

    document.body.style.overflow =
        "";
}


if (modal) {

    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {
                closeImage();
            }

        }
    );
}


document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {
            closeImage();
        }

    }
);


// ==========================================
// МЕЧТЫ
// ==========================================

function toggleDream(element) {

    if (!element) {
        return;
    }

    element.classList.toggle("done");

    const check =
        element.querySelector(
            ".dream-check"
        );

    if (!check) {
        return;
    }

    if (
        element.classList.contains("done")
    ) {

        check.textContent = "♥";

        createLoveEffect();

    } else {

        check.textContent = "○";
    }
}


// ==========================================
// КУПОНЫ
// ==========================================

function useCoupon(button) {

    if (!button) {
        return;
    }

    const coupon =
        button.closest(".coupon");

    if (!coupon) {
        return;
    }

    if (
        coupon.classList.contains("used")
    ) {
        return;
    }

    coupon.classList.add("used");

    button.textContent =
        "Использовано ♥";

    const id =
        coupon.dataset.coupon;

    if (id) {

        localStorage.setItem(
            "coupon_" + id,
            "used"
        );
    }

    createLoveEffect();
}


// ==========================================
// ЭФФЕКТ СЕРДЕЧЕК
// ==========================================

function createLoveEffect() {

    for (let i = 0; i < 15; i++) {

        const heart =
            document.createElement("div");

        heart.textContent =
            Math.random() > 0.5
                ? "♥"
                : "✦";

        heart.style.position =
            "fixed";

        heart.style.left =
            Math.random() * 100 + "vw";

        heart.style.bottom =
            "-30px";

        heart.style.fontSize =
            (15 + Math.random() * 20) + "px";

        heart.style.color =
            Math.random() > 0.5
                ? "#ff4f9a"
                : "#e6bd65";

        heart.style.pointerEvents =
            "none";

        heart.style.zIndex =
            "9999";

        document.body.appendChild(
            heart
        );

        const duration =
            1800 +
            Math.random() * 1500;

        heart.animate(
            [
                {
                    transform:
                        "translateY(0) scale(1) rotate(0deg)",
                    opacity: 1
                },
                {
                    transform:
                        `translateY(-${window.innerHeight + 100}px)
                         scale(1.5)
                         rotate(${Math.random() * 360}deg)`,
                    opacity: 0
                }
            ],
            {
                duration: duration,
                easing: "ease-out"
            }
        );

        setTimeout(
            () => heart.remove(),
            duration
        );
    }
}


// ==========================================
// ЧАСТИЦЫ
// ==========================================

const canvas =
    document.getElementById(
        "particles"
    );

if (canvas) {

    const ctx =
        canvas.getContext("2d");

    let particles = [];


    function resizeCanvas() {

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;
    }


    window.addEventListener(
        "resize",
        resizeCanvas
    );

    resizeCanvas();


    class Particle {

        constructor() {
            this.reset();
        }


        reset() {

            this.x =
                Math.random() *
                canvas.width;

            this.y =
                Math.random() *
                canvas.height;

            this.size =
                Math.random() * 2 + 0.5;

            this.speed =
                Math.random() * 0.5 + 0.15;

            this.opacity =
                Math.random() * 0.5 + 0.1;

            this.symbol =
                Math.random() > 0.5
                    ? "✦"
                    : "·";
        }


        update() {

            this.y -= this.speed;

            if (this.y < -20) {

                this.y =
                    canvas.height + 20;

                this.x =
                    Math.random() *
                    canvas.width;
            }
        }


        draw() {

            ctx.save();

            ctx.globalAlpha =
                this.opacity;

            ctx.fillStyle =
                Math.random() > 0.5
                    ? "#e6bd65"
                    : "#ff4f9a";

            ctx.font =
                `${this.size * 8}px serif`;

            ctx.fillText(
                this.symbol,
                this.x,
                this.y
            );

            ctx.restore();
        }
    }


    for (let i = 0; i < 80; i++) {

        particles.push(
            new Particle()
        );
    }


    function animateParticles() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        particles.forEach(
            particle => {

                particle.update();
                particle.draw();

            }
        );

        requestAnimationFrame(
            animateParticles
        );
    }


    animateParticles();
}


// ==========================================
// ВОССТАНОВЛЕНИЕ КУПОНОВ
// ==========================================

document
    .querySelectorAll(".coupon")
    .forEach(coupon => {

        const id =
            coupon.dataset.coupon;

        if (!id) {
            return;
        }

        if (
            localStorage.getItem(
                "coupon_" + id
            ) === "used"
        ) {

            coupon.classList.add("used");

            const button =
                coupon.querySelector(
                    "button"
                );

            if (button) {
                button.textContent =
                    "Использовано ♥";
            }
        }
    });


// ==========================================
// ДЕЛАЕМ ФУНКЦИИ ДОСТУПНЫМИ HTML
// ==========================================

window.openLetter =
    openLetter;

window.showSection =
    showSection;

window.openImage =
    openImage;

window.closeImage =
    closeImage;

window.toggleMusic =
    toggleMusic;

window.toggleTrack =
    toggleTrack;

window.seekTrack =
    seekTrack;

window.toggleDream =
    toggleDream;

window.useCoupon =
    useCoupon;