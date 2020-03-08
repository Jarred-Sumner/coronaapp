LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := yeet_jni

LOCAL_SHARED_LIBRARIES := libreactnativejni

LOCAL_SRC_FILES := ./YeetJSI.cpp

include $(BUILD_SHARED_LIBRARY)

