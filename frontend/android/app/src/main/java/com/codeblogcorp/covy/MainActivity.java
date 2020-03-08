package com.codeblogcorp.covy;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.github.amarcruz.rntextsize.RNTextSizePackage;
import com.tencent.mmkv.MMKV;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;


public class MainActivity extends ReactActivity  implements ReactInstanceManager.ReactInstanceEventListener {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "coronarnapp";
  }

  static {
//    System.loadLibrary("yeet_jni");
  }


  @Override
  public void onResume() {
    super.onResume();
    getReactInstanceManager().addReactInstanceEventListener(this);
  }

  @Override
  public void onPause() {
    super.onPause();
    getReactInstanceManager().removeReactInstanceEventListener(this);
  }

  @Override
  public void onReactContextInitialized(ReactContext reactCtx) {

  }


//  public static Object getItem(String key, String type) {
//    if (type == "number") {
//      return MainActivity.mmkv.decodeDouble(key);
//    } else if (type == "string") {
//      return MainActivity.mmkv.decodeString(key);
//    } else if (type == "bool") {
//      return MainActivity.mmkv.decodeBool(key);
//    } else if (type == "object") {
//      return MainActivity.mmkv.decodeParcelable(key);
//    } else {
//      return null;
//    }
//  }
//
//
//  public static void setItem(String key, String type, Object value) {
//    MainActivity.mmkv.encode(key, value);
//  }


    @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected ReactRootView createRootView() {
               ReactRootView rootView = new RNGestureHandlerEnabledRootView(MainActivity.this);
                rootView.setBackgroundColor(Color.parseColor("#000000"));
               return rootView;
              }
    };
      }

}

