import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import * as ort from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import { useState, useEffect } from 'react';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';

let myModel: ort.InferenceSession

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
    const inputData = new Float32Array(28 * 28);
    const feeds: Record<string, ort.Tensor> = {};
    feeds[myModel.inputNames[0]] = new ort.Tensor(inputData, [1, 28, 28]);
    const fetches = await myModel.run(feeds);
    const output = fetches[myModel.outputNames[0]];
    if (!output) {
      Alert.alert('failed to get output', `${myModel.outputNames[0]}`);
    } else {
      Alert.alert(
        'model inference successfully',
        `output shape: ${output.dims}, output data: ${output.data}`);
    }
  } catch (e) {
    Alert.alert('failed to inference model', `${e}`);
    throw e;
  }
}

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice('back')!

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    if (frame.pixelFormat === 'rgb') {
      const data = frame.toArrayBuffer()
      console.log(`Pixel at 0,0: RGB(${data[0]}, ${data[1]}, ${data[2]})`)
    }
  }, [])

  if (hasPermission === false) {
    requestPermission()
    return <View style={{ backgroundColor: 'grey' }}></View>
  }

  return (
    <View style={styles.container}>
      <Text>using ONNX Runtime for React Native</Text>
      <Button title='Load model' onPress={loadModel}></Button>
      <Button title='Run' onPress={runModel}></Button>
      <StatusBar style="auto" />
      <Camera
        style={{ flex: 1, width: '100%' }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat='yuv'
      />
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
