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

class XyzFrameProcessorPlugin(options: Map<String, Any>?): FrameProcessorPlugin(options) {
  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
    val image = frame.getImage()
    val byteArray = convertYuvToJpeg(image)

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

fun sendImage(image: Image) {
    // Step 1: Convert Image to byte array
    val buffer: ByteBuffer = image.planes[0].buffer
    val bytes = ByteArray(buffer.remaining())
    buffer.get(bytes)

    // Step 2: Encode byte array to Base64
    val base64String = Base64.encodeToString(bytes, Base64.DEFAULT)

    // Log the Base64 string for debugging
    println("Base64 String: $base64String")

    // Step 3: Send HTTP POST request
    val url = "http://192.168.1.5:5000/json"

    // Build the JSON payload
      val json = """
        {
            "d": "$base64String"
        }
    """.trimIndent()

    // Define the media type for JSON
    val mediaType = "application/json; charset=utf-8".toMediaType()

    // Create the request body from JSON content
    val requestBody = json.toRequestBody(mediaType)

    // Set up OkHttpClient
    val client = OkHttpClient()

    // Build the request with headers and POST method
    val request = Request.Builder()
        .url(url)
        .header("Content-Type", "application/json")
        .post(requestBody)
        .build()

    // Execute the request
    val response = client.newCall(request).execute()

    // Handle the response as needed
    val responseBody = response.body?.string()
    println("Response: $responseBody")

    // Close the image after processing
    //image.close()
}
private fun convertYuvToJpeg(image: Image): ByteArray {
        val yBuffer: ByteBuffer = image.planes[0].buffer
        val uBuffer: ByteBuffer = image.planes[1].buffer
        val vBuffer: ByteBuffer = image.planes[2].buffer

        val ySize = yBuffer.remaining()
        val uSize = uBuffer.remaining()
        val vSize = vBuffer.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)

        // Copy Y-plane
        yBuffer.get(nv21, 0, ySize)

        // Copy U/V planes (interleaved)
        vBuffer.get(nv21, ySize, vSize)
        uBuffer.get(nv21, ySize + vSize, uSize)

        // Convert YUV to RGB using Android's YuvImage class
        val yuvImage = android.graphics.YuvImage(nv21, android.graphics.ImageFormat.NV21, image.width, image.height, null)
        val stream = ByteArrayOutputStream()
        yuvImage.compressToJpeg(android.graphics.Rect(0, 0, image.width, image.height), 80, stream)

        return stream.toByteArray()
    }
