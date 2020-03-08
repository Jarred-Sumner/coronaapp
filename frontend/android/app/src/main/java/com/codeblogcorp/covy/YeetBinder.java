package com.codeblogcorp.covy;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Parcelable;
import android.view.View;

import androidx.core.app.ActivityCompat;

import com.airbnb.android.react.maps.AirMapModule;
import com.airbnb.android.react.maps.AirMapView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIImplementation;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.UIViewOperationQueue;
import com.tencent.mmkv.MMKV;
import com.google.android.gms.maps.MapView;

import java.lang.annotation.Native;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.List;


@ReactModule(name = YeetBinder.NAME)
public class YeetBinder extends ReactContextBaseJavaModule implements
        LifecycleEventListener {

    public static final String NAME = "YeetBinder";

    public native void install(long javaScriptContextHolder);


    @Override
    public void initialize() {
        ReactApplicationContext reactCtx = getReactApplicationContext();
        UIManagerModule uiManager = reactCtx.getNativeModule(UIManagerModule.class);
        reactCtx.addLifecycleEventListener(this);

        try {
            Class clazz = Class.forName("com.github.amarcruz.rntextsize.RNTextSizeModule");

            Object moduleClass = reactCtx.getNativeModule(clazz);

            YeetBinder.textSize = new YeetTextSize(moduleClass);
            System.out.println("React Context loaded.");
        } catch (Exception e) {
            System.out.println("No such class");
        }

         this.mmkv = MMKV.defaultMMKV();

        if (!this.mmkv.containsKey("SHOW_FOLLOW_BUTTON")) {
            this.mmkv.putLong("SHOW_FOLLOW_BUTTON", this.isTwitterInstalled() ? 1 : 0);
        }
    }


    public static YeetTextSize textSize = null;


    private WritableMap packageInstalledMap = Arguments.createMap();

    @ReactMethod(isBlockingSynchronousMethod = true)
    public boolean isPackageInstalled(String bundleId) {
        if (packageInstalledMap.hasKey(bundleId)) {
            return packageInstalledMap.getBoolean(bundleId);
        }

        Boolean isInstalled = false;
        try {
            PackageInfo packageInfo = this.getReactApplicationContext().getApplicationContext().getPackageManager().getPackageInfo(bundleId, 0);
            String getPackageName = packageInfo.toString();
            isInstalled = getPackageName == bundleId;
        } catch (PackageManager.NameNotFoundException e) {
        }

        packageInstalledMap.putBoolean(bundleId, isInstalled);
        return isInstalled;
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public boolean isTwitterInstalled() {
        return this.isPackageInstalled("com.twitter.android");
    }


    public static double measureText(double fontSize, String text, String weight, double width)
    {
        WritableMap map = Arguments.createMap();
        map.putDouble("width", width);
        map.putDouble("fontSize", fontSize);
        map.putString("text", text);
        map.putString("fontWeight", weight);

        return YeetBinder.textSize.measure(map).getDouble("height");
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public double syncMeasureText(double fontSize, String text, String weight, double width) {
        return YeetBinder.measureText(fontSize, text, weight, width);
    }

    public MMKV mmkv;

    @ReactMethod(isBlockingSynchronousMethod = true)
    public void setItem(String key, String type, ReadableMap value) {
        if (type == "number") {
            this.mmkv.putLong(key, (long)value.getDouble("value"));
        } else if (type == "string") {
            this.mmkv.putString(key, value.getString("value"));
        } else if (type == "bool") {
            this.mmkv.putBoolean(key, value.getBoolean("value"));
        } else if (type == "object") {
            Bundle bundle = Arguments.toBundle((ReadableMap)value.getMap("value"));
            this.mmkv.encode(key, bundle);
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public void removeItem(String key) {
        this.mmkv.remove(key);
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String checkLocationPermission() {
        Context context = this.getReactApplicationContext().getApplicationContext();
        int permission = ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION);
        if (permission == PackageManager.PERMISSION_GRANTED) {
            return "authorizedFine";
        } else {
            return "notDetermined";
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableArray getMapBounds(Integer id) {
        UIManagerModule uiManager = this.getReactApplicationContext().getNativeModule(UIManagerModule.class);

        AirMapView view = (AirMapView) dangerouslyResolveView(id);
        if (view == null) {
            return Arguments.createArray();
        }


        return Arguments.fromArray(view.getMapBoundaries());
    }

    private Geocoder geocoder = null;

    @ReactMethod
    public void geocode(ReadableMap opts, Promise promise) {
        if (!Geocoder.isPresent()) {
            promise.resolve(Arguments.createArray());
            return;
        }

        if (!opts.hasKey("longitude")) {
            promise.reject("NO_LONGITUDE", "missing longitude");
            return;
        }


        if (!opts.hasKey("latitude")) {
            promise.reject("NO_LATITUDE", "missing latitude");
            return;
        }

        final double latitude = opts.getDouble("latitude");
        final double longitude = opts.getDouble("longitude");
        int _maxResults = 5;

        if (opts.hasKey("maxResults")) {
            _maxResults = opts.getInt("maxResults");
        }


        final int maxResults = _maxResults;

        if (this.geocoder == null) {
            this.geocoder = new Geocoder(this.getReactApplicationContext().getApplicationContext());
        }

        final Geocoder geocoder = this.geocoder;

        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    List<Address> locations = geocoder.getFromLocation(latitude, longitude, maxResults);
                    WritableArray results = Arguments.createArray();

                    for (Address location: locations) {
                        WritableMap result = Arguments.createMap();
                        result.putString("country_code", location.getCountryCode());
                        result.putString("country_name", location.getCountryName());
                        result.putString("address", location.getAddressLine(0));
                        result.putString("address2", location.getAddressLine(1));
                        result.putString("feature_name", location.getFeatureName());
                        result.putDouble("latitude", location.getLatitude());
                        result.putString("locality", location.getLocality());
                        result.putString("city", location.getLocality());
                        result.putDouble("longitude", location.getLongitude());
                        result.putString("phone", location.getPhone());
                        result.putString("postal_code", location.getPostalCode());
                        result.putString("premises", location.getPremises());
                        result.putString("sub_admin_area", location.getSubAdminArea());
                        result.putString("sub_locality", location.getSubLocality());
                        result.putString("sub_thoroughfare", location.getSubThoroughfare());
                        result.putString("thoroughfare", location.getThoroughfare());
                        result.putString("url", location.getUrl());
                        results.pushMap(result);
                    }

                    promise.resolve(results);
                } catch (Exception e) {
                    e.printStackTrace();
                    promise.reject(e);
                }

            }
        });


    }





    private View dangerouslyResolveView(Integer id) {
        try {
            UIManagerModule uiManager = this.getReactApplicationContext().getNativeModule(UIManagerModule.class);

            Method getUIViewOperationQueue = UIImplementation.class.
                    getDeclaredMethod("getUIViewOperationQueue", null);

            getUIViewOperationQueue.setAccessible(true);

            UIViewOperationQueue queue = (UIViewOperationQueue)getUIViewOperationQueue.invoke(uiManager.getUIImplementation(), null);

            Method getNativeViewHierarchyManager = UIViewOperationQueue.class.
                    getDeclaredMethod("getNativeViewHierarchyManager", null);

            getNativeViewHierarchyManager.setAccessible(true);

            NativeViewHierarchyManager manager = (NativeViewHierarchyManager)getNativeViewHierarchyManager.invoke(queue);


            return manager
                    .resolveView(id);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }


    @ReactMethod(isBlockingSynchronousMethod = true)
    public Double getDouble(String key) {
        return (double)this.mmkv.getLong(key, 0);
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getString(String key) {
        return this.mmkv.getString(key, null);
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap getObject(String key) {
        Bundle bundle = this.mmkv.decodeParcelable(key, Bundle.class, null);

        if (bundle != null) {
            return Arguments.fromBundle(bundle);
        } else {
            return Arguments.createMap();
        }
    }

    public YeetBinder(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    public void onHostPause() {
//        if (mNodesManager != null) {
//            mNodesManager.onHostPause();
//        }
    }

    @Override
    public void onHostResume() {
//        if (mNodesManager != null) {
//            mNodesManager.onHostResume();
//        }
    }

    @Override
    public void onHostDestroy() {
        // do nothing
    }

}