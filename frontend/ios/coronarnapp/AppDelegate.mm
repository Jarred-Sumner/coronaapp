/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"
#define LONG_LONG_MAX LLONG_MAX
#import "coronarnapp-Bridging-Header.h"

#import <PINRemoteImage/PINRemoteImage.h>

#import <React/RCTBridge+Private.h>
#import "YeetTextSize.h"

//
//#import <React/RCTBridge.h>
//#import <React/RCTBundleURLProvider.h>
//#import <React/RCTRootView.h>
//#import <SDWebImageWebPCoder.h>
//#import <SDWebImage/SDImageLoadersManager.h>
//#import <SDWebImagePhotosPlugin.h>
//#import "YeetWebImageDecoder.h"
//#import <RNFastImage/FFFastImageViewManager.h>
//#import "SDImageCacheConfig.h"
//#import <RCTCronetHTTPRequestHandler.h>
//#import <Cronet/Cronet.h>
//#import "EnableWebpDecoder.h"
#import <React/RCTLinkingManager.h>
//#import <AppCenterReactNativeShared/AppCenterReactNativeShared.h>
//#import <AppCenterReactNative.h>
//#import <CodePush/CodePush.h>
#import <AVFoundation/AVFoundation.h>
//#import "RNSplashScreen.h"  // here
//#import "VydiaRNFileUploader.h"
#import <PINCache/PINCache.h>
#import "NSNumber+CGFloat.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/JSCExecutorFactory.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTCxxBridgeDelegate.h>
//#import <React/RCTJavaScriptLoader.h>
//#import <React/RCTLinkingManager.h>
#import <React/RCTImageLoader.h>
#import <React/RCTLocalAssetImageLoader.h>
#import <React/RCTGIFImageDecoder.h>
#import <React/RCTNetworking.h>
#import <React/RCTHTTPRequestHandler.h>
#import <React/RCTDataRequestHandler.h>
#import <React/RCTFileRequestHandler.h>
#import <ReactCommon/RCTTurboModuleManager.h>
#import <FBReactNativeSpec/FBReactNativeSpec.h>
#import <cxxreact/JSExecutor.h>
#import "YeetSplashScreen.h"


#import <KTVHTTPCache/KTVHTTPCache.h>

//#import <React/RCTCxxBridgeDelegate.h>
//#import <ReactCommon/RCTTurboModuleManager.h>
#import <React/CoreModulesPlugins.h>
//#import <React/JSCExecutorFactory.h>
#import <MMKV/MMKV.h>
#import "YeetJSIModule.h"

@interface AppDelegate() <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate>{
  RCTTurboModuleManager *_turboModuleManager;
}
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [MMKV initializeMMKV:nil];

  [[PINRemoteImageManager sharedImageManager] setRequestConfiguration:^NSURLRequest * _Nonnull(NSURLRequest * _Nonnull request) {
    NSMutableURLRequest *mutableRequest = [request mutableCopy];
    [mutableRequest setValue:@"Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/80.0.3987.95 Mobile/15E148 Safari/605.1" forHTTPHeaderField:@"User-Agent"];
     return mutableRequest;
  }];
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"coronarnapp"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:0.0f green:0.0f blue:0.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = rootView.backgroundColor;
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];


  dispatch_async(dispatch_get_main_queue(), ^{

    if (![[MMKV defaultMMKV] containsKey:@"SHOW_FOLLOW_BUTTON"]) {
      double isTwitterInstalled = [[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"twitter://"]] ? 1.0f : 0.0f;
      [[MMKV defaultMMKV] setDouble:isTwitterInstalled forKey:@"SHOW_FOLLOW_BUTTON"];
    }

  });

  return YES;
}



- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:app openURL:url options:options];
}


# pragma mark - RCTCxxBridgeDelegate

- (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
{
  __weak __typeof(self) weakSelf = self;
  return std::make_unique<facebook::react::JSCExecutorFactory>([weakSelf, bridge](facebook::jsi::Runtime &runtime) {
    if (!bridge) {
      return;
    }


    __typeof(self) strongSelf = weakSelf;
    if (strongSelf) {
      YeetJSIModule::install(bridge);
      strongSelf->_turboModuleManager = [[RCTTurboModuleManager alloc] initWithBridge:bridge delegate:strongSelf];
      [strongSelf->_turboModuleManager installJSBindingWithRuntime:&runtime];
    }
  });
}

#pragma mark RCTTurboModuleManagerDelegate

- (Class)getModuleClassFromName:(const char *)name
{
  if (RCTCoreModulesClassProvider(name)) {
    return RCTCoreModulesClassProvider(name);
  } else {
    return nil;
  }
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::JSCallInvoker>)jsInvoker
{
  return nullptr;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                       instance:(id<RCTTurboModule>)instance
                                                      jsInvoker:(std::shared_ptr<facebook::react::JSCallInvoker>)jsInvoker
{
  return nullptr;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
  if (moduleClass == RCTImageLoader.class) {
    return [[moduleClass alloc] initWithRedirectDelegate:nil loadersProvider:^NSArray<id<RCTImageURLLoader>> *{
      return @[[RCTLocalAssetImageLoader new]];
    } decodersProvider:^NSArray<id<RCTImageDataDecoder>> *{
      return @[[RCTGIFImageDecoder new]];
    }];
  } else if (moduleClass == RCTNetworking.class) {
    return [[moduleClass alloc] initWithHandlersProvider:^NSArray<id<RCTURLRequestHandler>> *{
      return @[
        [RCTHTTPRequestHandler new],
        [RCTDataRequestHandler new],
        [RCTFileRequestHandler new],
      ];
    }];
  }
  // No custom initializer here.
  return [moduleClass new];
}


@end
