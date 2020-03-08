#pragma once

#include <fb/fbjni.h>
#include <fb/log.h>
#include <jsi/jsi.h>
#include <jni.h>

using namespace facebook;

extern "C" {
    JNIEXPORT void JNICALL
    Java_com_codeblogcorp_covy_YeetBinder_install(
      JNIEnv *env,
      jobject thiz,
      jlong runtimePtr
    );
}


class YeetJSI : public jsi::HostObject {
private:
  jclass _moduleClass;
  jobject _moduleObject;
  jmethodID _measureText;
  // jmethodID _getItem;
  // jmethodID _setItem;

public:
  YeetJSI(
    jclass moduleClass,
    jobject moduleObject,
    jmethodID measureText
    // jmethodID getItem,
    // jmethodID setItem
  );

  static void install(
  jsi::Runtime &runtime,
    const std::shared_ptr<YeetJSI> module
  );

  jsi::Value get(jsi::Runtime &runtime, const jsi::PropNameID &name) override;
};