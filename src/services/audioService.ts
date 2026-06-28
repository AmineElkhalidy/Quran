import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from 'expo-audio';
import { saveRecording } from './databaseService';
import { Alert, Platform } from 'react-native';

// ─── expo-audio SDK 56 Services ──────────────────────────────────────────────────

// Warsh reciter audio from EveryAyah.com (Yassin Al-Jazaery, 64kbps)
const WARSH_BASE_URL = 'https://everyayah.com/data/Warsh_Yassin_Al_Jazaery_64kbps';

class AudioService {
  private playbackInstance: AudioPlayer | null = null;
  private onPlaybackFinished: (() => void) | null = null;

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

  async playWarshAudio(
    surahId: number, 
    ayahNumber: number,
    onFinished?: () => void
  ) {
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

      await this.init();

      // Format: 001001.mp3 (Surah 1, Ayah 1) for EveryAyah naming convention
      const surahStr = String(surahId).padStart(3, '0');
      const ayahStr = String(ayahNumber).padStart(3, '0');
      const url = `${WARSH_BASE_URL}/${surahStr}${ayahStr}.mp3`;

      console.log(`[AudioService] Playing: ${url}`);

      this.onPlaybackFinished = onFinished ?? null;
      this.playbackInstance = createAudioPlayer(url);
      
      // Listen for playback completion
      this.playbackInstance.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          console.log('[AudioService] Playback finished');
          if (this.onPlaybackFinished) {
            this.onPlaybackFinished();
            this.onPlaybackFinished = null;
          }
        }
      });

      this.playbackInstance.play();
    } catch (error) {
      console.error('[AudioService] Error playing audio:', error);
      Alert.alert(
        'Audio Error', 
        'Could not play the audio. Please check your internet connection and try again.'
      );
      if (onFinished) onFinished();
    }
  }

  async stopPlayback() {
    try {
      if (this.playbackInstance) {
        this.playbackInstance.pause();
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
