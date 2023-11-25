import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import { Camera, runAtTargetFps, useCameraDevice, useCameraFormat, useCameraPermission, useCodeScanner, useFrameProcessor } from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-worklets-core';
import { xyz } from './XYZFrame';
import VoiceInputScreen from './components/Voice';
import PlaySoundComponent from './components/SoundPlayer';

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice('back')!
  const format = useCameraFormat(device, [
    { videoResolution: { width: 640, height: 480 } },
    { fps: 24 },
    { photoHdr: false },
    { videoHdr: false },

  ])
  const debugTyped = useSharedValue(false)
  const cFrame = useSharedValue(new Uint8Array)

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    //cFrame.value = frame.toArrayBuffer()
    runAtTargetFps(18, () => {
      'worklet'
      //const result = xyz(frame)

      //console.log(result)
    })
  }, [])

  if (hasPermission === false) {
    requestPermission()
    return <View style={{ backgroundColor: 'grey' }}></View>
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Camera
        style={{ flex: 1, width: '100%', height: '100%' }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        format={format}
        pixelFormat='yuv'
        enableZoomGesture={true}
      />
      <VoiceInputScreen/>
      <PlaySoundComponent/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
