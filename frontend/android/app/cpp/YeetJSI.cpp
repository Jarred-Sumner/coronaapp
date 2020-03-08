// put this file to node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/jscexecutor

#include "./YeetJSI.h"

#include <jsi/jsi.h>
#include <fb/log.h>
#include <jni.h>
#include <android/log.h>
#include <jni/LocalString.h>

#define APPNAME "covy"

using namespace facebook;
using namespace facebook::jni;


JNIEnv *__env;

void JNICALL Java_com_codeblogcorp_covy_YeetBinder_install(
  JNIEnv *env,
  jobject thiz,
  jlong runtimePtr
) {
  auto &runtime = *(facebook::jsi::Runtime *)runtimePtr;
  __env = env;
  auto clazz = env->FindClass("com/codeblogcorp/covy/YeetBinder");
  auto measureText = env->GetStaticMethodID(clazz, "measureText", "(DLjava/lang/String;Ljava/lang/String;D)D");
  // auto getItem = env->GetStaticMethodID(clazz, "getItem", "(SS)O");
  // auto setItem = env->GetStaticMethodID(clazz, "setItem", "(SSO)V");

  auto module = std::make_shared<YeetJSI>(
    clazz,
    thiz,
    measureText
    // getItem,
    // setItem
  );

  YeetJSI::install(runtime, module);
}



YeetJSI::YeetJSI(
  jclass moduleClass,
  jobject moduleObject,
  jmethodID measureText
  // jmethodID getItem,
  // jmethodID setItem
):
  _moduleClass(moduleClass),
  _moduleObject(moduleObject),
  _measureText(measureText)
  // _getItem(getItem),
  // _setItem(setItem)
{

}

void YeetJSI::install(
  jsi::Runtime &runtime,
  const std::shared_ptr<YeetJSI> module
) {
  auto name = "YeetJSI";
  auto object = jsi::Object::createFromHostObject(runtime, module);

  runtime.global().setProperty(runtime, name, std::move(object));
}

jstring make_jstring(const char* utf8) {
  if (!utf8) {
    return {};
  }
  return __env->NewStringUTF(utf8);
}



jsi::Value YeetJSI::get(
  jsi::Runtime &runtime,
  const jsi::PropNameID &name
) {
  auto methodName = name.utf8(runtime);

  if (methodName == "measureText") {
    auto &method = _measureText;

    auto &moduleClass = _moduleClass;
    auto env = __env;
    if (_moduleObject) {

    }

    auto callback = [moduleClass, method, env](
      jsi::Runtime &runtime,
      const jsi::Value &thisValue,
      const jsi::Value *arguments,
      size_t count
    ) -> jsi::Value {

      auto fontSize = arguments[0].asNumber();
      printf("fontSize: %lf", fontSize);
      fflush(stdout);
      auto text = make_jstring(arguments[1].getString(runtime).utf8(runtime).c_str());
      // printf("fontSize: %s", text);
      auto fontWeight = make_jstring(arguments[2].getString(runtime).utf8(runtime).c_str());
      // printf("fontWeight: %s", fontWeight);
      auto width =arguments[3].asNumber();
      printf("width: %lf", width);
      fflush(stdout);

      auto val = (jdouble)env->CallStaticDoubleMethod(moduleClass, method, fontSize,
text,
fontWeight,
width);

      return jsi::Value(val);
    };
    return jsi::Function::createFromHostFunction(runtime, name, 4, callback);
  }

  // else if (methodName == "getItem") {
  //   auto &method = _getItem;
  //   auto &moduleObject = _moduleObject;
  //   auto &moduleClass = _moduleClass;

  //   return jsi::Function::createFromHostFunction(runtime, name, 3, [_getItem, _moduleObject, _moduleClass](
  //         jsi::Runtime &runtime,
  //         const jsi::Value &thisValue,
  //         const jsi::Value *arguments,
  //         size_t count) -> jsi::Value {

  //     auto type = (jstring)arguments[1].asString(runtime);
  //     auto key = (jstring)arguments[0].asString(runtime);

  //     if (!key || ![key length]) {
  //       return jsi::Value::null();
  //     }

  //     const auto env = Environment::current();

  //     auto val = (jdouble)env->CallStaticDoubleMethod(moduleClass, method, size, width);

  //   });
  // } else if (methodName == "setItem") {

  //   return jsi::Function::createFromHostFunction(runtime, name, 3, [mmkv, jsInvoker](
  //            jsi::Runtime &runtime,
  //            const jsi::Value &thisValue,
  //            const jsi::Value *arguments,
  //            size_t count) -> jsi::Value {
  //     NSString *type =  convertJSIStringToNSString(runtime, arguments[2].asString(runtime));
  //     NSString *key =   convertJSIStringToNSString(runtime, arguments[0].asString(runtime));

  //     if (!key || ![key length]) {
  //       return jsi::Value::null();
  //     }

  //     if ([type isEqualToString:@"string"]) {
  //       NSString *value = convertJSIStringToNSString(runtime, arguments[1].asString(runtime));

  //       if ([value length] > 0) {
  //         return jsi::Value([mmkv setString:value forKey:key]);
  //       } else {
  //         return jsi::Value(false);
  //       }
  //     } else if ([type isEqualToString:@"number"]) {
  //       double value = arguments[1].asNumber();

  //       return jsi::Value([mmkv setDouble:value forKey:key]);
  //     }  else if ([type isEqualToString:@"object"]) {
  //            NSDictionary *value = convertJSIObjectToNSDictionary(runtime, arguments[1].asObject(runtime), jsInvoker);


  //        return jsi::Value([mmkv setObject:value forKey:key]);
  //    } else if ([type isEqualToString:@"bool"]) {
  //       BOOL value = arguments[2].asNumber();

  //       return jsi::Value([mmkv setBool:value forKey:key]);
  //     } else {
  //       return jsi::Value::null();
  //     }
    // });

  return jsi::Value::undefined();
}