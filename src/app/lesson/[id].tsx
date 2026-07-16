import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';

import { LESSONS } from '@/data/lessons';
import { images } from '@/constants/images';
import { useLanguageStore } from '@/store/languageStore';
import { useStreamCall } from '@/hooks/useStreamCall';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { selectedLanguage } = useLanguageStore();

  const lesson = LESSONS.find((l) => l.id === id);

  const { callStatus, agentStatus, isMuted, errorMessage, toggleMute, endCall, retryJoin } = useStreamCall({
    userId: user?.id ?? 'anonymous',
    userName: user?.fullName ?? user?.firstName ?? undefined,
    userImageUrl: user?.imageUrl ?? undefined,
    lessonId: id ?? 'unknown',
    languageCode: selectedLanguage?.code ?? 'en',
  });

  const handleEndCall = async () => {
    await endCall();
    router.back();
  };

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Lesson not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const introMessage = lesson.aiTeacherPrompt.introMessage;
  const isConnecting = callStatus === 'connecting';
  const isJoined = callStatus === 'joined';
  const isError = callStatus === 'error';
  const isEnded = callStatus === 'ended';

  const statusLabel = isConnecting
    ? 'Connecting...'
    : isError
    ? 'Connection failed'
    : isEnded
    ? 'Session ended'
    : agentStatus === 'connecting'
    ? 'Teacher joining...'
    : agentStatus === 'connected'
    ? 'In session'
    : agentStatus === 'failed'
    ? 'Teacher unavailable'
    : 'Waiting for teacher...';

  const statusDotColor = isConnecting
    ? '#FFC800'
    : isError
    ? '#E8534E'
    : isEnded
    ? '#9CA3AF'
    : agentStatus === 'connected'
    ? '#21C16B'
    : agentStatus === 'failed'
    ? '#E8534E'
    : '#FFC800';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Header ───────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#0D132B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Teacher</Text>
          <View style={styles.onlineRow}>
            <View style={[styles.onlineDot, { backgroundColor: statusDotColor }]} />
            <Text style={[styles.onlineText, { color: statusDotColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Ionicons name="videocam-outline" size={20} color="#0D132B" />
          <Text style={styles.xpBadge}>{lesson.xpReward}</Text>
          <Ionicons name="notifications-outline" size={20} color="#0D132B" />
        </View>
      </View>

      {/* ── Teacher Area ──────────────────────────── */}
      <View style={styles.teacherArea}>
        {/* User preview — top-right corner */}
        <View style={styles.userPreview}>
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={styles.userImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.userFallback}>
              <Ionicons name="person" size={26} color="#fff" />
            </View>
          )}
          {/* Muted badge on user preview */}
          {isMuted && (
            <View style={styles.mutedBadge}>
              <Ionicons name="mic-off" size={10} color="#fff" />
            </View>
          )}
        </View>

        {/* AI Teacher mascot */}
        <Image
          source={images.mascotWelcome}
          style={styles.mascot}
          resizeMode="contain"
        />

        {/* Connecting overlay */}
        {isConnecting && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#6C4EF5" />
            <Text style={styles.overlayText}>Connecting to your lesson…</Text>
          </View>
        )}

        {/* Error overlay */}
        {isError && (
          <View style={styles.overlay}>
            <Ionicons name="wifi-outline" size={40} color="#E8534E" />
            <Text style={styles.overlayErrorText}>
              {errorMessage ?? 'Something went wrong.'}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={retryJoin} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ended overlay */}
        {isEnded && (
          <View style={styles.overlay}>
            <Ionicons name="checkmark-circle-outline" size={44} color="#21C16B" />
            <Text style={styles.overlayText}>Session complete!</Text>
          </View>
        )}
      </View>

      {/* ── Speech Bubble ────────────────────────── */}
      <View style={styles.bubbleWrap}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText} numberOfLines={3}>
            {introMessage}
          </Text>
          <TouchableOpacity style={styles.audioIconBtn} activeOpacity={0.7}>
            <Ionicons name="volume-high" size={20} color="#FFC800" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Controls ─────────────────────────────── */}
      <View style={styles.controls}>
        {/* Camera — disabled (audio-only) */}
        <View style={styles.controlItem}>
          <View style={[styles.controlBtn, styles.controlBtnDisabled]}>
            <Ionicons name="videocam-outline" size={22} color="#C4C9D4" />
          </View>
          <Text style={[styles.controlLabel, styles.controlLabelDisabled]}>Camera</Text>
        </View>

        {/* Mic */}
        <TouchableOpacity
          style={styles.controlItem}
          onPress={toggleMute}
          activeOpacity={0.8}
          disabled={!isJoined}
        >
          <View
            style={[
              styles.controlBtn,
              isMuted && styles.controlBtnMuted,
              !isJoined && styles.controlBtnDisabled,
            ]}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic-outline'}
              size={22}
              color={!isJoined ? '#C4C9D4' : isMuted ? '#E8534E' : '#0D132B'}
            />
          </View>
          <Text style={[styles.controlLabel, !isJoined && styles.controlLabelDisabled]}>
            {isMuted ? 'Unmute' : 'Mic'}
          </Text>
        </TouchableOpacity>

        {/* Subtitles */}
        <View style={styles.controlItem}>
          <View style={[styles.controlBtn, styles.controlBtnActive]}>
            <Ionicons name="text" size={22} color="#6C4EF5" />
          </View>
          <Text style={styles.controlLabel}>Subtitles</Text>
        </View>

        {/* End Call */}
        <TouchableOpacity
          style={styles.controlItem}
          onPress={handleEndCall}
          activeOpacity={0.8}
        >
          <View style={styles.endCallBtn}>
            <Ionicons
              name="call"
              size={24}
              color="#fff"
              style={{ transform: [{ rotate: '135deg' }] }}
            />
          </View>
          <Text style={[styles.controlLabel, styles.endCallLabel]}>End Call</Text>
        </TouchableOpacity>
      </View>

      {/* ── Session Metrics ───────────────────────── */}
      <View style={styles.metrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Speaking</Text>
          <Text style={[styles.metricValue, { color: '#21C16B' }]}>Excellent</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Pronunciation</Text>
          <Text style={[styles.metricValue, { color: '#4D8BFF' }]}>Great</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Grammar</Text>
          <Text style={[styles.metricValue, { color: '#FF8A00' }]}>Good</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6B7280',
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 2,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#0D132B',
    lineHeight: 22,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#21C16B',
  },
  onlineText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#21C16B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpBadge: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#0D132B',
    marginRight: 4,
  },

  // ── Teacher Area
  teacherArea: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#F0EDFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  userPreview: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 72,
    height: 88,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  userImage: {
    width: '100%',
    height: '100%',
  },
  userFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6C4EF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E8534E',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
  },
  mascot: {
    width: '78%',
    height: '92%',
  },

  // ── Connecting / Error / Ended overlays
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(240, 237, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    zIndex: 20,
    borderRadius: 24,
  },
  overlayText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#0D132B',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  overlayErrorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#E8534E',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: '#6C4EF5',
    borderRadius: 20,
  },
  retryBtnText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // ── Speech Bubble
  bubbleWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F1F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#0D132B',
    lineHeight: 21,
  },
  audioIconBtn: {
    marginTop: 2,
    padding: 2,
  },

  // ── Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },
  controlItem: {
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlBtnDisabled: {
    backgroundColor: '#F0F1F5',
    shadowOpacity: 0,
    elevation: 0,
  },
  controlBtnActive: {
    backgroundColor: '#EDE8FF',
  },
  controlBtnMuted: {
    backgroundColor: '#FFF0F0',
  },
  endCallBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#E8534E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E8534E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  controlLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  controlLabelDisabled: {
    color: '#C4C9D4',
  },
  endCallLabel: {
    color: '#E8534E',
    fontFamily: 'Poppins-Medium',
  },

  // ── Metrics
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
  },
  metricLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#0D132B',
  },
  metricValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
});
