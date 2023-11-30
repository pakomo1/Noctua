import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Camera, runAtTargetFps, useCameraDevice, useCameraFormat, useCameraPermission, useCodeScanner, useFrameProcessor } from 'react-native-vision-camera';
import { xyz } from './XYZFrame';
import Voice from '@react-native-voice/voice'
import { startBeeping, stopBeeping } from './components/SoundPlayer';
import { useSharedValue } from 'react-native-worklets-core';

const imageLeft = require('./assets/arrow_left.png')
const imageRight = require('./assets/arrow_right.png')

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [previousFrameResult, setPreviousFrameResult] = useState('');

  useEffect(() => {
    Voice.onSpeechResults = (results: any) => {
      setRecognizedText(results.value);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error(error);
    }
  };
  const { hasPermission, requestPermission } = useCameraPermission()
  const [turningWeight, setTurningWeight] = useState('0.7')
  const [turningWeightOpacityLeft, setTurningWeightOpacityLeft] = useState(1)
  const [turningWeightOpacityRight, setTurningWeightOpacityRight] = useState(1)
  const device = useCameraDevice('back')!
  const format = useCameraFormat(device, [
    { videoResolution: { width: 640, height: 480 } },
    { fps: 24 },
    { photoHdr: false },
    { videoHdr: false },
  ])

  const onFaceDetected = Worklets.createRunInJsFn((frameResult: string) => {
    if (frameResult != 'fail' && frameResult != previousFrameResult) {
      const convertedResult = parseFloat(frameResult)
      setTurningWeight(frameResult);
      startBeeping(convertedResult, 100)
      setPreviousFrameResult(frameResult);

      if (convertedResult > 0.5) {
        setTurningWeightOpacityRight((convertedResult - 0.4) * 2)
        setTurningWeightOpacityLeft(0)
      } else if (convertedResult < 0.5) {
        setTurningWeightOpacityRight(0)
        setTurningWeightOpacityLeft(((0.5 - convertedResult) + 0.1) * 2)
      } else {
        setTurningWeightOpacityRight(0)
        setTurningWeightOpacityLeft(0)
      }
    }
  })
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    runAtTargetFps(18, () => {
      'worklet'
      let previousResult: number = 0;
      const result:any = xyz(frame);
      onFaceDetected(result)
      //console.log(frameResult.value)
      //startBeeping(result, 100);      

      //console.log(result)
    })
  }, [onFaceDetected])

  if (hasPermission === false) {
    requestPermission()
    return <View style={{ backgroundColor: 'grey' }}></View>
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Camera
        style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        format={format}
        pixelFormat='yuv'
        enableZoomGesture={true}
      />
      <TouchableOpacity style={styles.startListeningButton} onPress={isListening ? stopListening : startListening}>
        <View style={{ alignSelf: 'center' }}>
          <Image source={imageLeft} style={[styles.image, {opacity: turningWeightOpacityRight}]} />
        </View>
        <View style={styles.mainComponentsWrapper}>
          <Text style={{ fontSize: 30, fontWeight: '800' }}>Turning Weight:</Text>
          <Text style={{ fontSize: 30, marginBottom: 20, fontWeight: '500' }}>{parseFloat(turningWeight).toPrecision(2)}</Text>
          <Text style={styles.voiceCommandsText}>{isListening ? 'Listening...' : 'Not listening'}</Text>
          <Text style={styles.voiceCommandsText}>Recognized Text: {recognizedText}</Text>
        </View>
        <View style={{ alignSelf: 'center' }}>
          <Image source={imageRight} style={[styles.image, {opacity: turningWeightOpacityLeft}]} />
        </View>
      </TouchableOpacity>
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
  startListeningButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-evenly',
    flexDirection: 'row'
  },
  mainComponentsWrapper: {
    alignItems: 'center',
    borderRadius: 30,
    padding: 20,
    backgroundColor: 'grey',
    width: '30%',
    alignSelf: 'center',
  },
  voiceCommandsText: {
    fontSize: 20
  },
  image: {
    width: 150,
    height: 100,
  }
});
