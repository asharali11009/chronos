// A simple ambient drone generator using Web Audio API
// avoiding external mp3 dependencies

let audioCtx: AudioContext | null = null;
let oscillators: OscillatorNode[] = [];
let gainNode: GainNode | null = null;

export const toggleAmbientSound = (isPlaying: boolean) => {
  if (isPlaying) {
    startSound();
  } else {
    stopSound();
  }
};

const startSound = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  // Create a master gain node for volume control
  gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 2); // Fade in
  gainNode.connect(audioCtx.destination);

  // Create a few oscillators for a chord (C major 7 suspended feel)
  const freqs = [130.81, 196.00, 261.63, 329.63]; // C3, G3, C4, E4
  
  oscillators = freqs.map(freq => {
    if (!audioCtx) return null;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Add slight detune for richness
    osc.detune.setValueAtTime(Math.random() * 10 - 5, audioCtx.currentTime);
    
    osc.connect(gainNode!);
    osc.start();
    return osc;
  }).filter(Boolean) as OscillatorNode[];
};

const stopSound = () => {
  if (gainNode && audioCtx) {
    // Fade out
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
    setTimeout(() => {
      oscillators.forEach(osc => osc.stop());
      oscillators = [];
      if (audioCtx?.state !== 'closed') {
        // audioCtx.close(); // Optional: keep context alive for re-use or close it
        // Keeping it open is often better for toggle performance, but suspending is good practice.
        audioCtx?.suspend();
      }
    }, 1000);
  }
};

export const initAudioContext = () => {
    // Just to initialize on user interaction if needed
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}