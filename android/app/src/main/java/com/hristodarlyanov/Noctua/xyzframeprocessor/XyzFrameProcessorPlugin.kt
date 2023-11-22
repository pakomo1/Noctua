package com.hristodarlyanov.Noctua.xyzframeprocessor

import com.mrousavy.camera.frameprocessor.Frame
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin

import android.media.Image
import android.util.Base64
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import java.io.ByteArrayOutputStream
import okhttp3.RequestBody.Companion.toRequestBody
import android.graphics.Bitmap
import android.os.AsyncTask
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import java.nio.ByteBuffer
import kotlin.math.roundToInt
import android.util.Log
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.graphics.BitmapFactory

class XyzFrameProcessorPlugin(options: Map<String, Any>?): FrameProcessorPlugin(options) {
  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
    val image = frame.getImage()
    val byteArray = NV21toJPEG(YUV420toNV21(image), image.getWidth(), image.getHeight(), 100)

    val requestBody: RequestBody = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("file", "image.jpg", RequestBody.create("image/*".toMediaTypeOrNull(), byteArray))
            .build()

        val request: Request = Request.Builder()
            .url("http://192.168.1.5:5000/json")
            .post(requestBody)
            .build()

        val client = OkHttpClient()

        client.newCall(request).execute()

    
    return image.getFormat()
  }
}

private fun NV21toJPEG(nv21: ByteArray, width: Int, height: Int, quality: Int): ByteArray {
    val out = ByteArrayOutputStream()
    val yuv = YuvImage(nv21, ImageFormat.NV21, width, height, null)
    yuv.compressToJpeg(Rect(0, 0, width, height), quality, out)
    return out.toByteArray()
}

private fun YUV420toNV21(image: Image): ByteArray {
    val crop = image.cropRect
    val format = image.format
    val width = crop.width()
    val height = crop.height()
    val planes = image.planes
    val data = ByteArray(width * height * ImageFormat.getBitsPerPixel(format) / 8)
    val rowData = ByteArray(planes[0].rowStride)

    var channelOffset: Int
    var outputStride: Int
    for (i in planes.indices) {
        when (i) {
            0 -> {
                channelOffset = 0
                outputStride = 1
            }
            1 -> {
                channelOffset = width * height + 1
                outputStride = 2
            }
            2 -> {
                channelOffset = width * height
                outputStride = 2
            }
            else -> {
                channelOffset = 0
                outputStride = 1
            }
        }

        val buffer: ByteBuffer = planes[i].buffer
        val rowStride = planes[i].rowStride
        val pixelStride = planes[i].pixelStride

        val shift = if (i == 0) 0 else 1
        val w = width shr shift
        val h = height shr shift
        buffer.position(rowStride * (crop.top shr shift) + pixelStride * (crop.left shr shift))
        for (row in 0 until h) {
            val length: Int
            length = if (pixelStride == 1 && outputStride == 1) {
                w
            } else {
                (w - 1) * pixelStride + 1
            }
            if (pixelStride == 1 && outputStride == 1) {
                buffer.get(data, channelOffset, length)
                channelOffset += length
            } else {
                buffer.get(rowData, 0, length)
                for (col in 0 until w) {
                    data[channelOffset] = rowData[col * pixelStride]
                    channelOffset += outputStride
                }
            }
            if (row < h - 1) {
                buffer.position(buffer.position() + rowStride - length)
            }
        }
    }
    return data
}