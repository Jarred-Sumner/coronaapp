//
//  YeetJSIModule.m
//  yeet
//
//  Created by Jarred WSumner on 1/29/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "YeetJSIModule.h"
#import "MediaPlayerViewManager.h"
#import "YeetJSIUTils.h"
#import "RCTConvert+PHotos.h"
#import <MMKV/MMKV.h>
#import "YeetSplashScreen.h"
#import <React/RCTShadowView.h>
//#import "PanViewManager.h"
//#import "EnableWebpDecoder.h"
#import <React/RCTUIManagerUtils.h>
#import "YeetTextSize.h"
#import <react-native-maps/AIRMap.h>
#import <react-native-location/RNLocation.h>
#import <CoreLocation/CoreLocation.h>


@interface RNLocation (ext)

- (CLLocationManager*)locationManager;
- (NSString *)nameForAuthorizationStatus:(CLAuthorizationStatus)authorizationStatus;

@end


YeetJSIModule::YeetJSIModule(RCTCxxBridge *bridge)
: bridge_(bridge) {
  std::shared_ptr<facebook::react::JSCallInvoker> _jsInvoker = std::make_shared<react::BridgeJSCallInvoker>(bridge.reactInstance);
}


void YeetJSIModule::install(RCTCxxBridge *bridge) {
  if (bridge.runtime == nullptr) {
    return;
  }

 jsi::Runtime &runtime = *(jsi::Runtime *)bridge.runtime;

 auto reaModuleName = "YeetJSI";
 auto reaJsiModule = std::make_shared<YeetJSIModule>(std::move(bridge));
 auto object = jsi::Object::createFromHostObject(runtime, reaJsiModule);
 runtime.global().setProperty(runtime, reaModuleName, std::move(object));
}

int __hasTwitterInstalled = -1;

void setHasTwitterInstalled(int isinstalled) {
  __hasTwitterInstalled = isinstalled ? 1 : 0;
}

jsi::Value YeetJSIModule::get(jsi::Runtime &runtime, const jsi::PropNameID &name) {
  auto methodName = name.utf8(runtime);

  RCTCxxBridge* _bridge = bridge_;
  std::shared_ptr<facebook::react::JSCallInvoker> jsInvoker = _jsInvoker;

  if (methodName == "photosAuthorizationStatus") {
    NSString *value = [RCTConvert PHAuthorizationStatusValuesReversed][@([PHPhotoLibrary authorizationStatus])];

    if (value != nil) {
      return convertNSStringToJSIString(runtime, value);
    } else {
      return convertNSStringToJSIString(runtime, [RCTConvert PHAuthorizationStatusValuesReversed][@(PHAuthorizationStatusNotDetermined)]);
    }

  } else if (methodName == "locationAuthorizationStatus") {
    RNLocation *rnLocation = [_bridge moduleForClass:[RNLocation class]];
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];

    return convertNSStringToJSIString(runtime, [rnLocation nameForAuthorizationStatus:status]);
  } else if (methodName == "hasTwitterInstalled") {
    return jsi::Value(__hasTwitterInstalled == 1);
  }  else if (methodName == "lastLocation") {
     RNLocation *rnLocation = [_bridge moduleForClass:[RNLocation class]];
    CLLocation *location = [[rnLocation locationManager] location];

    if (location == nil) {
      return jsi::Value::null();
    }

    NSDictionary *_location = @ {
      @"latitude": @(location.coordinate.latitude),
      @"longitude": @(location.coordinate.longitude),
      @"altitude": @(location.altitude),
      @"accuracy": @(location.horizontalAccuracy),
      @"altitudeAccuracy": @(location.verticalAccuracy),
      @"course": @(location.course),
      @"speed": @(location.speed),
      @"floor": @(location.floor.level),
      @"timestamp": @([location.timestamp timeIntervalSince1970] * 1000) // in ms
    };

    return convertNSDictionaryToJSIObject(runtime, _location);
   }  else if (methodName == "getMapBounds") {

      return jsi::Function::createFromHostFunction(runtime, name, 1, [_bridge, jsInvoker](
            jsi::Runtime &runtime,
            const jsi::Value &thisValue,
            const jsi::Value *arguments,
            size_t count) -> jsi::Value {

        double doubleTag = arguments[0].asNumber();
        NSNumber *tag = [NSNumber numberWithDouble:doubleTag];

        if (tag == nil) {
          return jsi::Value::null();
        }

        AIRMap *map = (AIRMap*)[_bridge.uiManager unsafeViewForReactTag:tag];
        if (map) {
          NSArray *bounds = [map getMapBoundaries];
          NSArray<NSNumber*> *min = [bounds objectAtIndex:0];
          NSArray<NSNumber*> *max = [bounds objectAtIndex:1];
          NSNumber *minLat = min[0];
          NSNumber *minLong = min[1];
          NSNumber *maxLat = max[0];
          NSNumber *maxLong = max[1];
          return convertNSArrayToJSIArray(runtime, @[minLat, minLong, maxLat, maxLong]);
        } else {
          return jsi::Value::null();
        }
      });
  } else if (methodName == "snapSheetToPosition") {
    PullyViewManager *pully = [_bridge moduleForClass:[PullyViewManager class]];

     return jsi::Function::createFromHostFunction(runtime, name, 2, [_bridge, jsInvoker, pully](
           jsi::Runtime &runtime,
           const jsi::Value &thisValue,
           const jsi::Value *arguments,
           size_t count) -> jsi::Value {
       NSNumber *tag = @(arguments[0].asNumber());
       NSString *size =  convertJSIStringToNSString(runtime, arguments[1].asString(runtime));
       NSLog(@"PULLY?? %@", pully);
       [pully snapTo:tag position:size];

       return jsi::Value(true);
    });
  } else if (methodName == "triggerScrollEvent") {
    RCTCxxBridge* _bridge = bridge_;
    std::shared_ptr<facebook::react::JSCallInvoker> jsInvoker = _jsInvoker;
     return jsi::Function::createFromHostFunction(runtime, name, 1, [_bridge, jsInvoker](
           jsi::Runtime &runtime,
           const jsi::Value &thisValue,
           const jsi::Value *arguments,
           size_t count) -> jsi::Value {

//       double tag = arguments[0].asNumber();
//
//       if (!tag) {
//         return jsi::Value::null();
//       }
//
//       __block NSNumber *scrollViewTag = @(tag);
//
//       RCTExecuteOnMainQueue(^{
//         RCTScrollView *scrollView = [_bridge.uiManager viewForReactTag:scrollViewTag];
//         if (scrollView != nil) {
//           [scrollView scrollViewDidZoom:scrollView.scrollView];
//         }
//       });

       return jsi::Value(true);
   });

    } else if (methodName == "measureText") {
        RCTCxxBridge* _bridge = bridge_;
      YeetTextSize* textSize = [bridge_ moduleForClass:[YeetTextSize class]];
        std::shared_ptr<facebook::react::JSCallInvoker> jsInvoker = _jsInvoker;
         return jsi::Function::createFromHostFunction(runtime, name, 1, [_bridge, jsInvoker, textSize](
               jsi::Runtime &runtime,
               const jsi::Value &thisValue,
               const jsi::Value *arguments,
               size_t count) -> jsi::Value {

           NSDictionary *options = convertJSIObjectToNSDictionary(runtime, arguments[0].getObject(runtime), jsInvoker);

           return convertNSDictionaryToJSIObject(runtime, [textSize measure:options]);
       });


//  }
  } else if (methodName == "removeItem") {
    MMKV *mmkv = [MMKV defaultMMKV];
    return jsi::Function::createFromHostFunction(runtime, name, 1, [mmkv](
          jsi::Runtime &runtime,
          const jsi::Value &thisValue,
          const jsi::Value *arguments,
          size_t count) -> jsi::Value {


      NSString *key = convertJSIStringToNSString(runtime, arguments[0].asString(runtime));

      if (key && key.length > 0) {
        [mmkv removeValueForKey:key];
        return jsi::Value(true);
      } else {
        return jsi::Value(false);
      }
    });
  } else if (methodName == "getItem") {
    MMKV *mmkv = [MMKV defaultMMKV];
    return jsi::Function::createFromHostFunction(runtime, name, 2, [mmkv](
          jsi::Runtime &runtime,
          const jsi::Value &thisValue,
          const jsi::Value *arguments,
          size_t count) -> jsi::Value {

      NSString *type =  convertJSIStringToNSString(runtime, arguments[1].asString(runtime));
      NSString *key =   convertJSIStringToNSString(runtime, arguments[0].asString(runtime));

      if (!key || ![key length]) {
        return jsi::Value::null();
      }

      if ([type isEqualToString:@"string"]) {
        NSString *value = [mmkv getStringForKey:key];

        if (value) {
          return convertNSStringToJSIString(runtime, value);
        } else {
          return jsi::Value::null();
        }
      } else if ([type isEqualToString:@"number"]) {
        double value = [mmkv getDoubleForKey:key];

        if (value) {
          return jsi::Value(value);
        } else {
          return jsi::Value::null();
        }
      } else if ([type isEqualToString:@"bool"]) {
        BOOL value = [mmkv getBoolForKey:key defaultValue:NO];

        return jsi::Value(value == YES ? 1 : 0);
      } else if ([type isEqualToString:@"object"]) {
        NSDictionary *value = [mmkv getObjectOfClass:[NSDictionary class] forKey:key];

        return convertNSDictionaryToJSIObject(runtime, value);
      } else {
        return jsi::Value::null();
      }
    });
  } else if (methodName == "setItem") {
    MMKV *mmkv = [MMKV defaultMMKV];
    return jsi::Function::createFromHostFunction(runtime, name, 3, [mmkv, jsInvoker](
             jsi::Runtime &runtime,
             const jsi::Value &thisValue,
             const jsi::Value *arguments,
             size_t count) -> jsi::Value {
      NSString *type =  convertJSIStringToNSString(runtime, arguments[2].asString(runtime));
      NSString *key =   convertJSIStringToNSString(runtime, arguments[0].asString(runtime));

      if (!key || ![key length]) {
        return jsi::Value::null();
      }

      if ([type isEqualToString:@"string"]) {
        NSString *value = convertJSIStringToNSString(runtime, arguments[1].asString(runtime));

        if ([value length] > 0) {
          return jsi::Value([mmkv setString:value forKey:key]);
        } else {
          return jsi::Value(false);
        }
      } else if ([type isEqualToString:@"number"]) {
        double value = arguments[1].asNumber();

        return jsi::Value([mmkv setDouble:value forKey:key]);
      }  else if ([type isEqualToString:@"object"]) {
             NSDictionary *value = convertJSIObjectToNSDictionary(runtime, arguments[1].asObject(runtime), jsInvoker);


         return jsi::Value([mmkv setObject:value forKey:key]);
     } else if ([type isEqualToString:@"bool"]) {
        BOOL value = arguments[2].asNumber();

        return jsi::Value([mmkv setBool:value forKey:key]);
      } else {
        return jsi::Value::null();
      }
    });

  } else if (methodName == "hideSplashScreen") {
    return jsi::Function::createFromHostFunction(runtime, name, 0, [](
             jsi::Runtime &runtime,
             const jsi::Value &thisValue,
             const jsi::Value *arguments,
             size_t count) -> jsi::Value {

      [YeetSplashScreen hide];

      return jsi::Value(true);
    });

  } else if (methodName == "hapticFeedback") {
    RCTBridge *rctBridge = _bridge;
    RNReactNativeHapticFeedback *haptic = [rctBridge moduleForClass:[RNReactNativeHapticFeedback class]];


    return jsi::Function::createFromHostFunction(runtime, name, 2, [haptic, jsInvoker](
             jsi::Runtime &runtime,
             const jsi::Value &thisValue,
             const jsi::Value *arguments,
             size_t count) -> jsi::Value {

      NSDictionary *options = convertJSIObjectToNSDictionary(runtime, arguments[1].asObject(runtime), jsInvoker);
      NSString *type = convertJSIStringToNSString(runtime, arguments[0].asString(runtime));

      [haptic trigger:type options:options];


      return jsi::Value(true);
    });
  } else if (methodName == "hapticFeedback") {
    RCTBridge *rctBridge = _bridge;
    RNReactNativeHapticFeedback *haptic = [rctBridge moduleForClass:[RNReactNativeHapticFeedback class]];


    return jsi::Function::createFromHostFunction(runtime, name, 2, [haptic, jsInvoker](
             jsi::Runtime &runtime,
             const jsi::Value &thisValue,
             const jsi::Value *arguments,
             size_t count) -> jsi::Value {

      NSDictionary *options = convertJSIObjectToNSDictionary(runtime, arguments[1].asObject(runtime), jsInvoker);
      NSString *type = convertJSIStringToNSString(runtime, arguments[0].asString(runtime));

      [haptic trigger:type options:options];


      return jsi::Value(true);
    });
  }
//  else if (methodName == "focusedTextInputTag") {
//    NSNumber *tag = YeetTextInputView.focusedReactTag;
//    if (tag == nil) {
//      return jsi::Value::null();
//    } else {
//      return jsi::Value([tag intValue]);
//    }
//  }
//  else if (methodName == "focus") {
//    RCTBridge *rctBridge = _bridge;
//
//    return jsi::Function::createFromHostFunction(runtime, name, 1, [rctBridge, jsInvoker](
//             jsi::Runtime &runtime,
//             const jsi::Value &thisValue,
//             const jsi::Value *arguments,
//             size_t count) -> jsi::Value {
//
//      __block NSNumber *tag = @(arguments[0].asNumber());
//      NSNumber *focusedTag = YeetTextInputView.focusedReactTag;
//
//      BOOL isAlreadyFocused = focusedTag != nil && [tag intValue] == focusedTag.intValue;
//
//      if (!isAlreadyFocused) {
//        RCTExecuteOnMainQueue(^{
//          UIView *view = [rctBridge.uiManager viewForReactTag:tag];
//          [view reactFocus];
//          tag = nil;
//        });
//      }
//
//      return jsi::Value::undefined();
//    });
//  } else if (methodName == "blur") {
//    RCTBridge *rctBridge = _bridge;
//
//    return jsi::Function::createFromHostFunction(runtime, name, 1, [rctBridge, jsInvoker](
//             jsi::Runtime &runtime,
//             const jsi::Value &thisValue,
//             const jsi::Value *arguments,
//             size_t count) -> jsi::Value {
//
//      __block NSNumber *tag = @(arguments[0].asNumber());
//      RCTExecuteOnMainQueue(^{
//        UIView *view = [rctBridge.uiManager viewForReactTag:tag];
//        [view reactBlur];
//        tag = nil;
//      });
//      return jsi::Value::undefined();
//    });
//  }
//  else if (methodName == "transitionPanView") {
//    RCTBridge *rctBridge = _bridge;
//    PanViewManager *panViewManager = [rctBridge moduleForClass:[PanViewManager class]];
//
//    return jsi::Function::createFromHostFunction(runtime, name, 2, [rctBridge, jsInvoker, panViewManager](
//             jsi::Runtime &runtime,
//             const jsi::Value &thisValue,
//             const jsi::Value *arguments,
//             size_t count) -> jsi::Value {
//
//      __block NSNumber *toTag = @(arguments[0].asNumber());
//
//      [panViewManager transition:toTag to:convertJSIStringToNSString(runtime, arguments[1].asString(runtime))];
//      return jsi::Value::null();
//    });
//  }
  else if (methodName == "measureRelativeTo") {
    RCTBridge *rctBridge = _bridge;


    return jsi::Function::createFromHostFunction(runtime, name, 3, [rctBridge, jsInvoker](
             jsi::Runtime &runtime,
             const jsi::Value &thisValue,
             const jsi::Value *arguments,
             size_t count) -> jsi::Value {

      __block NSNumber *containerTag = @(arguments[0].asNumber());
      __block NSArray<NSNumber*> *blocks = convertJSIArrayToNSArray(runtime, arguments[1].getObject(runtime).getArray(runtime), jsInvoker);

      __block RCTResponseSenderBlock callback = convertJSIFunctionToCallback(runtime, arguments[2].asObject(runtime).getFunction(runtime), jsInvoker);


      __block RCTBridge *bridge = rctBridge;

      RCTExecuteOnUIManagerQueue(^{


        __block NSMutableArray *measurements = [[NSMutableArray alloc] initWithCapacity: blocks.count];

        RCTShadowView *containerView = [rctBridge.uiManager shadowViewForReactTag:containerTag];

        if (!containerView) {
          __block NSDictionary *result = @{ @"measurements": measurements};
          [rctBridge dispatchBlock:^{
            callback(@[NSNull.null, result]);
            [measurements removeAllObjects];
                            measurements = nil;
            result = nil;
           } queue:RCTJSThread];
          return;
        }

        RCTShadowView *block;
        for (NSNumber *blockTag in blocks) {
          block = [rctBridge.uiManager shadowViewForReactTag:blockTag];
          if (block != nil) {
            CGRect rect = [block measureLayoutRelativeToAncestor:containerView];
            [measurements addObject:@{ @"x": @(rect.origin.x) ,@"y": @(rect.origin.y), @"width": @(rect.size.width), @"height": @(rect.size.height) }];
          }

        }

        containerView = nil;
        block = nil;

        __block NSDictionary *result = @{ @"measurements": [[NSArray alloc] initWithArray:measurements copyItems:YES]};
        [measurements removeAllObjects];
         measurements = nil;

        [bridge dispatchBlock:^{

          callback(@[NSNull.null, result]);
         result = nil;

        } queue:RCTJSThread];
      });
      return jsi::Value::null();
    });
  }

  return jsi::Value::undefined();
}
