import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import * as ort from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import { useState, useEffect } from 'react';
import { Camera, runAtTargetFps, useCameraDevice, useCameraFormat, useCameraPermission, useCodeScanner, useFrameProcessor } from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-worklets-core';
import { xyz } from './XYZFrame';
import VoiceInputScreen from './components/Voice';

let myModel: ort.InferenceSession

async function api(array: Uint8Array): Promise<string> {
  return fetch('http://192.168.1.5:5000/json?d=' + array)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json() as Promise<string>
    })
}

async function GetData(array: Uint8Array) {
  const response = await api(array)

  console.log(response)
}

async function loadModel() {

  try {
    const assets = await Asset.loadAsync(require('./assets/best.ort'));
    const modelUri = assets[0].localUri;
    if (!modelUri) {
      Alert.alert('failed to get model URI', `${assets[0]}`);
    } else {
      myModel = await ort.InferenceSession.create(modelUri);
      Alert.alert(
        'model loaded successfully',
        `input names: ${myModel.inputNames}, output names: ${myModel.outputNames}`);
    }
  } catch (e) {
    Alert.alert('failed to load model', `${e}`);
    throw e;
  }
}

async function runModel() {
  try {
    const inputData = new Float32Array(3 * 640 * 640);
    const feeds: Record<string, ort.Tensor> = {};
    feeds[myModel.inputNames[0]] = new ort.Tensor(inputData, [1, 3, 640, 640]);
    const fetches = await myModel.run(feeds);
    const output = fetches[myModel.outputNames[0]];
    if (!output) {
      Alert.alert('failed to get output', `${myModel.outputNames[0]}`);
    } else {
      Alert.alert(
        'model inference successfully',
        `output shape: ${output.dims}`);
      console.log(output.data)
    }
  } catch (e) {
    Alert.alert('failed to inference model', `${e}`);
    throw e;
  }
}

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice('back')!
  const format = useCameraFormat(device, [
    { videoResolution: { width: 640, height: 720 } },
    { fps: 24 }
  ])
  const debugTyped = useSharedValue(false)
  const cFrame = useSharedValue(new Uint8Array)

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
      //cFrame.value = frame.toArrayBuffer()
      runAtTargetFps(30, () => {
        'worklet'
        const result = xyz(frame)

        console.log(result)
      })
  }, [])

  if (hasPermission === false) {
    requestPermission()
    return <View style={{ backgroundColor: 'grey' }}></View>
  }

  return (
    <View style={styles.container}>
      <Text>using ONNX Runtime for React Native</Text>
      <Button title='Load model' onPress={loadModel}></Button>
      <Button title='Run'></Button>
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
