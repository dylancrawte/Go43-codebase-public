import { Gesture } from "react-native-gesture-handler";
import { useRef, useCallback } from 'react';
import { runOnJS } from 'react-native-reanimated';

interface GestureProps {
    onClose: () => void;
    additionalActions?: (() => void)[];
    threshold?: number;
    debounceMs?: number;
}

export const usePanGesure = ({
    onClose,
    threshold = 50,
    debounceMs = 100,
}: GestureProps) => {
    const isClosing = useRef(false);
    const timeoutRef = useRef<number | null>(null);

    const resetClose = useCallback(() => {
        isClosing.current = false;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const handleClose = useCallback(() => {
        if (isClosing.current) return;

        isClosing.current = true;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            onClose();
            isClosing.current = false;
            timeoutRef.current = null;
        }, debounceMs);
    }, [onClose, debounceMs]);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            // Worklet → JS hop
            runOnJS(resetClose)();
        })
        .onEnd((event) => {
            const { translationX, translationY } = event;
            if (Math.abs(translationY) > Math.abs(translationX) && translationY > threshold) {
                // Worklet → JS hop
                runOnJS(handleClose)();
            }
        });

    return panGesture;
};