import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { SittingPhoto } from '@/lib/sitting-api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

type Props = {
  visible: boolean;
  photos: SittingPhoto[];
  initialIndex: number;
  onClose: () => void;
};

type CellProps = {
  uri: string;
  onZoomChange: (zoomed: boolean) => void;
  resetSignal: number;
};

function ZoomableCell({ uri, onZoomChange, resetSignal }: CellProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const reset = useCallback(() => {
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    onZoomChange(false);
  }, [onZoomChange, savedScale, savedTranslateX, savedTranslateY, scale, translateX, translateY]);

  // 다른 페이지로 이동 시 이 셀의 zoom 초기화
  useEffect(() => {
    reset();
  }, [resetSignal, reset]);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(1, next));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1.01) {
        runOnJS(reset)();
      } else {
        runOnJS(onZoomChange)(true);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      if (scale.value > 1.01) {
        runOnJS(reset)();
      } else {
        scale.value = withTiming(DOUBLE_TAP_SCALE);
        savedScale.value = DOUBLE_TAP_SCALE;
        runOnJS(onZoomChange)(true);
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (savedScale.value > 1.01) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.cell}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.cellInner, animatedStyle]}>
          <Image source={{ uri }} style={styles.image} contentFit="contain" transition={150} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export function PhotoLightbox({ visible, photos, initialIndex, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [pageLocked, setPageLocked] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const listRef = useRef<FlatList<SittingPhoto>>(null);

  // 모달이 열릴 때 initialIndex로 점프 + 상태 초기화
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setPageLocked(false);
      // 다음 프레임에 scrollToIndex (FlatList 마운트 후)
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      });
    }
  }, [visible, initialIndex]);

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        // 모든 셀의 zoom 상태 리셋 트리거
        setResetSignal((n) => n + 1);
      }
    },
    [currentIndex],
  );

  const renderItem = useCallback(
    ({ item }: { item: SittingPhoto }) => (
      <ZoomableCell uri={item.url} onZoomChange={setPageLocked} resetSignal={resetSignal} />
    ),
    [resetSignal],
  );

  const keyExtractor = useCallback((item: SittingPhoto) => item.id, []);
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: SCREEN_W, offset: SCREEN_W * index, index }),
    [],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <FlatList
          ref={listRef}
          data={photos}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEnabled={!pageLocked}
        />

        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        {photos.length > 1 && (
          <View style={styles.indicator} pointerEvents="none">
            <Text style={styles.indicatorText}>
              {currentIndex + 1} / {photos.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cell: {
    width: SCREEN_W,
    height: SCREEN_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInner: {
    width: SCREEN_W,
    height: SCREEN_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
