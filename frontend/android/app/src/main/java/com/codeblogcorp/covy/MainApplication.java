package com.codeblogcorp.covy;

import android.content.Context;

import com.codeblogcorp.covy.BuildConfig;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import io.sentry.RNSentryPackage;
import com.github.amarcruz.rntextsize.RNTextSizePackage;
import com.rnnestedscrollview.RNNestedScrollViewPackage;
import com.bottomsheetbehavior.BottomSheetBehaviorPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.github.reactnativecommunity.location.RNLocationPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import androidx.multidex.MultiDexApplication;
import com.tencent.mmkv.MMKV;
import com.microsoft.codepush.react.CodePush;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; // <-- Add this line



public class MainApplication extends MultiDexApplication implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
           packages.add(new YeetPackage());
            packages.add(new RNFirebaseAnalyticsPackage()); // <-- Add this line
            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);

    String rootDir = MMKV.initialize(this);
    System.out.println("mmkv root: " + rootDir);
  }

  /**
   * Loads Flipper in React Native templates.
   *
   * @param context
   */
  private static void initializeFlipper(Context context) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
        aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
