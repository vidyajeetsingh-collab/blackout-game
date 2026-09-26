
/* =========================================================
   PROJECT: BLACKOUT
   Audio System
   Procedural sound effects using Web Audio API
   ========================================================= */

const AudioSystem = {

    context: null,
    masterGain: null,
    ambienceGain: null,

    enabled: true,
    initialized: false,
    ambienceTimer: null,

    // -----------------------------------------------------
    // INITIALIZE AUDIO
    // -----------------------------------------------------

    init() {
        if (this.initialized) {
            return;
        }

        const settings =
            typeof Settings !== "undefined" &&
            Settings.values
                ? Settings.values
                : {};

        this.enabled = settings.sound !== false;

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            console.warn(
                "Web Audio API is not supported."
            );
            return;
        }

        this.context = new AudioContextClass();

        this.masterGain =
            this.context.createGain();

        this.masterGain.gain.value =
            this.enabled ? 0.7 : 0;

        this.masterGain.connect(
            this.context.destination
        );

        this.ambienceGain =
            this.context.createGain();

        this.ambienceGain.gain.value = 0;

        this.ambienceGain.connect(
            this.masterGain
        );

        this.initialized = true;

        // Mobile browsers require a user gesture
        // before audio can play.
        const unlockAudio = () => {
            this.unlock();

            window.removeEventListener(
                "pointerdown",
                unlockAudio
            );

            window.removeEventListener(
                "keydown",
                unlockAudio
            );
        };

        window.addEventListener(
            "pointerdown",
            unlockAudio
        );

        window.addEventListener(
            "keydown",
            unlockAudio
        );

        // Connect to the existing settings system.
        window.addEventListener(
            "blackout:settings-changed",
            () => {
                const currentSettings =
                    typeof Settings !== "undefined" &&
                    Settings.values
                        ? Settings.values
                        : {};

                this.setEnabled(
                    currentSettings.sound !== false
                );
            }
        );
    },

    // -----------------------------------------------------
    // UNLOCK AUDIO
    // -----------------------------------------------------

    async unlock() {
        if (!this.context) {
            this.init();
        }

        if (!this.context) {
            return;
        }

        if (this.context.state === "suspended") {
            try {
                await this.context.resume();
            } catch (error) {
                console.warn(
                    "Could not resume audio:",
                    error
                );
            }
        }
    },

    // -----------------------------------------------------
    // ENABLE / DISABLE SOUND
    // -----------------------------------------------------

    setEnabled(value) {
        this.enabled = Boolean(value);

        if (!this.initialized) {
            return;
        }

        const now = this.context.currentTime;

        this.masterGain.gain.cancelScheduledValues(
            now
        );

        this.masterGain.gain.setTargetAtTime(
            this.enabled ? 0.7 : 0,
            now,
            0.04
        );
    },

    // -----------------------------------------------------
    // INTERNAL TONE GENERATOR
    // -----------------------------------------------------

    tone({
        frequency = 440,
        endFrequency = frequency,
        duration = 0.15,
        volume = 0.3,
        type = "sine",
        destination = null
    } = {}) {

        if (
            !this.initialized ||
            !this.enabled ||
            !this.context
        ) {
            return;
        }

        const ctx = this.context;
        const now = ctx.currentTime;

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.type = type;

        oscillator.frequency.setValueAtTime(
            Math.max(1, frequency),
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(1, endFrequency),
            now + duration
        );

        gain.gain.setValueAtTime(
            Math.max(0.0001, volume),
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        oscillator.connect(gain);

        gain.connect(
            destination || this.masterGain
        );

        oscillator.start(now);

        oscillator.stop(now + duration + 0.02);
    },

    // -----------------------------------------------------
    // NOISE GENERATOR
    // -----------------------------------------------------

    noise({
        duration = 0.12,
        volume = 0.2,
        filterFrequency = 1200
    } = {}) {

        if (
            !this.initialized ||
            !this.enabled ||
            !this.context
        ) {
            return;
        }

        const ctx = this.context;
        const sampleCount = Math.max(
            1,
            Math.floor(
                ctx.sampleRate * duration
            )
        );

        const buffer =
            ctx.createBuffer(
                1,
                sampleCount,
                ctx.sampleRate
            );

        const data =
            buffer.getChannelData(0);

        for (let i = 0; i < sampleCount; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source =
            ctx.createBufferSource();

        const filter =
            ctx.createBiquadFilter();

        const gain =
            ctx.createGain();

        source.buffer = buffer;

        filter.type = "lowpass";
        filter.frequency.value =
            filterFrequency;

        gain.gain.setValueAtTime(
            volume,
            ctx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            ctx.currentTime + duration
        );

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start();

        source.stop(
            ctx.currentTime + duration
        );
    },

    // -----------------------------------------------------
    // WEAPON SOUNDS
    // -----------------------------------------------------

    playShot(weapon = "pistol") {
        if (!this.initialized || !this.enabled) {
            return;
        }

        const sounds = {
            pistol: {
                frequency: 150,
                endFrequency: 45,
                duration: 0.11,
                volume: 0.45
            },

            smg: {
                frequency: 190,
                endFrequency: 55,
                duration: 0.08,
                volume: 0.32
            },

            rifle: {
                frequency: 125,
                endFrequency: 35,
                duration: 0.14,
                volume: 0.5
            },

            shotgun: {
                frequency: 95,
                endFrequency: 25,
                duration: 0.2,
                volume: 0.6
            },

            sniper: {
                frequency: 80,
                endFrequency: 20,
                duration: 0.24,
                volume: 0.65
            }
        };

        const sound =
            sounds[String(weapon).toLowerCase()] ||
            sounds.pistol;

        this.tone({
            ...sound,
            type: "sawtooth"
        });

        this.noise({
            duration: sound.duration,
            volume: sound.volume * 0.45,
            filterFrequency: 1800
        });
    },

    // -----------------------------------------------------
    // IMPACT SOUND
    // -----------------------------------------------------

    impact() {
        this.noise({
            duration: 0.07,
            volume: 0.22,
            filterFrequency: 700
        });

        this.tone({
            frequency: 180,
            endFrequency: 65,
            duration: 0.08,
            volume: 0.18,
            type: "triangle"
        });
    },

    // -----------------------------------------------------
    // EXPLOSION SOUND
    // -----------------------------------------------------

    explosion() {
        this.noise({
            duration: 0.65,
            volume: 0.5,
            filterFrequency: 500
        });

        this.tone({
            frequency: 75,
            endFrequency: 18,
            duration: 0.7,
            volume: 0.55,
            type: "sawtooth"
        });
    },

    // -----------------------------------------------------
    // RELOAD SOUND
    // -----------------------------------------------------

    reload() {
        this.tone({
            frequency: 650,
            endFrequency: 420,
            duration: 0.06,
            volume: 0.12,
            type: "square"
        });

        this.tone({
            frequency: 380,
            endFrequency: 250,
            duration: 0.08,
            volume: 0.16,
            type: "square"
        });

        this.tone({
            frequency: 850,
            endFrequency: 600,
            duration: 0.05,
            volume: 0.1,
            type: "square"
        });
    },

    // -----------------------------------------------------
    // PICKUP SOUND
    // -----------------------------------------------------

    pickup() {
        this.tone({
            frequency: 440,
            endFrequency: 660,
            duration: 0.12,
            volume: 0.18,
            type: "sine"
        });

        this.tone({
            frequency: 660,
            endFrequency: 880,
            duration: 0.16,
            volume: 0.15,
            type: "sine"
        });
    },

    // -----------------------------------------------------
    // PLAYER DAMAGE SOUND
    // -----------------------------------------------------

    playerDamage() {
        this.tone({
            frequency: 110,
            endFrequency: 45,
            duration: 0.28,
            volume: 0.3,
            type: "sawtooth"
        });
    },

    // -----------------------------------------------------
    // VEHICLE ENGINE SOUND
    // -----------------------------------------------------

    vehicleStart() {
        this.tone({
            frequency: 55,
            endFrequency: 115,
            duration: 0.55,
            volume: 0.25,
            type: "sawtooth"
        });
    },

    vehicleStop() {
        this.tone({
            frequency: 115,
            endFrequency: 35,
            duration: 0.4,
            volume: 0.2,
            type: "sawtooth"
        });
    },

    // -----------------------------------------------------
    // AMBIENT CITY SOUNDS
    // -----------------------------------------------------

    startAmbience() {
        if (
            !this.initialized ||
            !this.enabled ||
            this.ambienceTimer
        ) {
            return;
        }

        this.ambienceGain.gain.setTargetAtTime(
            0.12,
            this.context.currentTime,
            1
        );

        // Subtle low city rumble.
        this.tone({
            frequency: 48,
            endFrequency: 42,
            duration: 3,
            volume: 0.12,
            type: "sine",
            destination: this.ambienceGain
        });

        this.ambienceTimer = setInterval(() => {
            if (!this.enabled) {
                return;
            }

            this.tone({
                frequency: 50 + Math.random() * 20,
                endFrequency: 35 + Math.random() * 15,
                duration: 2 + Math.random() * 2,
                volume: 0.035,
                type: "sine",
                destination: this.ambienceGain
            });
        }, 3500);
    },

    stopAmbience() {
        if (this.ambienceTimer) {
            clearInterval(this.ambienceTimer);
            this.ambienceTimer = null;
        }

        if (this.initialized) {
            this.ambienceGain.gain.setTargetAtTime(
                0,
                this.context.currentTime,
                0.3
            );
        }
    },

    // -----------------------------------------------------
    // CLEANUP
    // -----------------------------------------------------

    dispose() {
        this.stopAmbience();

        if (this.context) {
            this.context.close();
        }

        this.context = null;
        this.masterGain = null;
        this.ambienceGain = null;
        this.initialized = false;
    }
};
