import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from 'expo-audio';
import { saveRecording } from './databaseService';
import { Alert, Platform } from 'react-native';

// ─── expo-audio SDK 56 Services ──────────────────────────────────────────────────

// Warsh reciter audio from EveryAyah.com (Yassin Al-Jazaery, 64kbps)
const WARSH_BASE_URL = 'https://everyayah.com/data/warsh/warsh_yassin_al_jazaery_64kbps';

class AudioService {
  private playbackInstance: AudioPlayer | null = null;
  private onPlaybackFinished: (() => void) | null = null;
  private isSequenceCancelled = false;

  // Initialize audio session for playback
  async init() {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      });
    } catch (error) {
      console.warn('[AudioService] Failed to set audio mode:', error);
    }
  }

  // ─── Playback ─────────────────────────────────────────────────────────────

  // Play a single ayah and resolve when it finishes
  private playSingleAyah(surahId: number, ayahNumber: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Clean up previous player
        if (this.playbackInstance) {
          try {
            this.playbackInstance.remove();
          } catch {
            // Player may already be removed
          }
          this.playbackInstance = null;
        }

        const surahStr = String(surahId).padStart(3, '0');
        const ayahStr = String(ayahNumber).padStart(3, '0');
        const url = `${WARSH_BASE_URL}/${surahStr}${ayahStr}.mp3`;

        console.log(`[AudioService] Playing ayah ${ayahNumber}: ${url}`);

        this.playbackInstance = createAudioPlayer(url);
        
        this.playbackInstance.addListener('playbackStatusUpdate', (status) => {
          if ((status as any).error) {
            console.error('[AudioService] Playback status error:', (status as any).error);
            reject(new Error((status as any).error));
          }
          if (status.didJustFinish) {
            console.log(`[AudioService] Ayah ${ayahNumber} finished`);
            resolve();
          }
        });

        this.playbackInstance.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Play a single ayah (legacy, kept for other uses)
  async playWarshAudio(
    surahId: number, 
    ayahNumber: number,
    onFinished?: () => void
  ) {
    try {
      await this.init();
      this.isSequenceCancelled = false;
      this.onPlaybackFinished = onFinished ?? null;

      await this.playSingleAyah(surahId, ayahNumber);

      if (this.onPlaybackFinished) {
        this.onPlaybackFinished();
        this.onPlaybackFinished = null;
      }
    } catch (error) {
      console.error('[AudioService] Error playing audio:', error);
      Alert.alert(
        'Audio Error', 
        'Could not play the audio. Please check your internet connection and try again.'
      );
      if (onFinished) onFinished();
    }
  }

  // ─── Sequential Range Playback (Thumn) ────────────────────────────────────
  // Plays all ayahs from startAyah to endAyah sequentially with minimal gap

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async playAyahRange(
    surahId: number,
    startAyah: number,
    endAyah: number,
    onFinished?: () => void
  ) {
    try {
      await this.init();
      this.isSequenceCancelled = false;

      console.log(`[AudioService] Playing range: Surah ${surahId}, Ayah ${startAyah} to ${endAyah}`);

      for (let ayah = startAyah; ayah <= endAyah; ayah++) {
        if (this.isSequenceCancelled) {
          console.log('[AudioService] Sequence cancelled by user');
          break;
        }

        await this.playSingleAyah(surahId, ayah);

        // Very short pause between ayahs (just enough to swap players cleanly)
        if (ayah < endAyah && !this.isSequenceCancelled) {
          await this.delay(100);
        }
      }

      if (onFinished) onFinished();
    } catch (error) {
      if (!this.isSequenceCancelled) {
        console.error('[AudioService] Error playing ayah range:', error);
        Alert.alert(
          'Audio Error',
          'Could not play the audio. Please check your internet connection and try again.'
        );
      }
      if (onFinished) onFinished();
    }
  }

  async stopPlayback() {
    try {
      this.isSequenceCancelled = true;
      if (this.playbackInstance) {
        this.playbackInstance.pause();
        try { this.playbackInstance.remove(); } catch { /* already removed */ }
        this.playbackInstance = null;
      }
    } catch (error) {
      console.warn('[AudioService] Error stopping playback:', error);
    }
  }

  // ─── Recording ────────────────────────────────────────────────────────────

  async startRecording(): Promise<boolean> {
    try {
      // Recording requires a physical device with a microphone
      // Expo Go on simulators/emulators will fail
      Alert.alert(
        'Practice Mode',
        'Recording your recitation requires a physical device with microphone access.\n\nFor now, listen to the Warsh recitation and practice along!',
        [{ text: 'OK', style: 'default' }]
      );
      console.log('[AudioService] Recording requested — showing info alert');
      return false;
    } catch (error) {
      console.error('[AudioService] Failed to start recording', error);
      return false;
    }
  }

  async stopRecording(ayahId: number): Promise<string | null> {
    // Recording is not active in this version
    return null;
  }
}

export const audioService = new AudioService();
