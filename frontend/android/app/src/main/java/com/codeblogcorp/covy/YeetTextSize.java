package com.codeblogcorp.covy;

import com.facebook.react.bridge.PromiseImpl;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;


import java.lang.reflect.*;


public class YeetTextSize {
    private Object textSizeModule;

    YeetTextSize(Object textSizeModule) {
        this.textSizeModule = textSizeModule;
    }

    Object nextMap = null;

    public WritableMap measure(ReadableMap specs) {

        PromiseImpl promise = new PromiseImpl((value) -> {
            this.nextMap = value[0];
        }, (err) -> {
            System.out.println("ERROR");
        });

        // measure(@Nullable final ReadableMap specs, final Promise promise) {
        try {
            Method m = this.textSizeModule.getClass().getDeclaredMethod("measure");
            m.setAccessible(true);
            m.invoke(this.textSizeModule
                    , specs, promise);
        } catch (Exception exception) {

            exception.printStackTrace();
            return null;
        }


        return (WritableMap)this.nextMap;

    }


}
