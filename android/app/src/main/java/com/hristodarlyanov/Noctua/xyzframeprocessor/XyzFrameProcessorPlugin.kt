package com.hristodarlyanov.Noctua.xyzframeprocessor

import com.mrousavy.camera.frameprocessor.Frame
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin

class XyzFrameProcessorPlugin(options: Map<String, Any>?): FrameProcessorPlugin(options) {
  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
    // code goes here
    return "hello"
  }
}