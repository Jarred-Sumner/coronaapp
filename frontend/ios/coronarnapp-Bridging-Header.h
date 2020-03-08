//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//

#pragma once

#import <UIKit/UIKit.h>

#import <React/RCTBridgeModule.h>
//#import <React/RCTBridge.h
#import <React/RCTTouchHandler.h>
#import <React/RCTModalHostViewController.h>
#import <React/RCTModalHostView.h>
#import <React/RCTComponent.h>

#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

//#import <React/RCTMultilineTextInputView.h>
#import <React/RCTMultilineTextInputViewManager.h>
#import <React/RCTScrollView.h>
//#import <React/UIView+React.h>
//#import <React/RCTUITextView.h>
#import <React/RCTTextView.h>
//#import <React/RCTTextSelection.h>
#import <React/RCTConvert+Transform.h>

//#import <React/RCTBridge+Private.h>
#import <React/RCTUIManagerObserverCoordinator.h>
//#import <React/RCTSurfacePresenterStub.h>
#import <React/RCTUITextView.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTInvalidating.h>
//#import <FFFastImageView.h>

#import "NSNumber+CGFloat.h"


//#import <React/RCTInputAccessoryView.h>
//#import <React/RCTInputAccessoryViewContent.h>
#import <React/RCTTextAttributes.h>


#import "KVCacheComplete-Swift.h"

#import "MediaPlayerJSIModuleInstaller.h"

#import <DVURLAsset.h>
#import <DVAssetLoaderDelegate/DVAssetLoaderDelegate.h>

#import <PINRemoteImage/PINAnimatedImageView.h>
#import <PINRemoteImage/PINDisplayLink.h>
#import "NSData+ContentType.h"





#import "PINRemoteImageMacros.h"

typedef void (^RCTPendingCall)();

@interface RCTBridge (ext)
- (void)_runAfterLoad:(RCTPendingCall)block;
@end

@interface RCTUIManager (ext)
  - (UIView *)unsafeViewForReactTag:(NSNumber *)reactTag;
  - (NSMutableDictionary<NSNumber *, UIView *> *)viewRegistry;
    - (NSMutableDictionary<NSNumber *, RCTShadowView *> *)shadowViewRegistry;
@end

@implementation RCTUIManager (ext)
- (UIView *)unsafeViewForReactTag:(NSNumber *)reactTag {
  return self.viewRegistry[reactTag];
}
@end

@interface RCTScrollView (ext)
- (void)refreshContentInset;
@end


@interface PINAnimatedImageView (Private)

- (void)coverImageCompleted:(PINImage *)coverImage;

@end


@interface RCTBridge (otherPrivate)
- (void)dispatchBlock:(dispatch_block_t)block queue:(dispatch_queue_t)queue;
@end


@interface UIView(PrivateMtehods)
  @property BOOL reactIsFocusNeeded;
  - (void)dirtyLayout;
  - (void)clearLayout;
  - (void)didSetProps:(__unused NSArray<NSString *> *)changedProps;
@end




@interface PINAnimatedImageView(PrivateMethods)

@property (nonatomic, assign) CGImageRef frameImage;
@property (nonatomic, strong) PINDisplayLink *displayLink;

@property (nonatomic, assign) CFTimeInterval lastDisplayLinkFire;

- (void)stopAnimating;


- (void)coverImageCompleted:(PINImage *)coverImage;
- (void)setCoverImage:(PINImage *)coverImage;
- (void)checkIfShouldAnimate;
- (void)displayLinkFired:(CADisplayLink *)displayLink;
- (CGImageRef)imageRef;

@end

@interface RCT_EXTERN_MODULE(PullyViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(scrollViewTag, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(animateOpen, BOOL);
RCT_EXPORT_VIEW_PROPERTY(initialStickyPointOffset, CGFloat);
RCT_EXPORT_VIEW_PROPERTY(onChangePosition, RCTDirectEventBlock);

RCT_EXTERN_METHOD(snapTo:(nonnull NSNumber*)tag position:(NSString*)position);

//RCT_EXPORT_VIEW_PROPERTY(onEnterFullScreen, BOOL);
//RCT_EXPORT_VIEW_PROPERTY(onLeaveFullScreen, BOOL);

@end

@interface RCT_EXTERN_MODULE(MediaPlayerViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(paused, BOOL);
RCT_EXPORT_VIEW_PROPERTY(autoPlay, BOOL);
RCT_EXPORT_VIEW_PROPERTY(prefetch, BOOL);
RCT_EXPORT_VIEW_PROPERTY(opaque, BOOL);
RCT_EXPORT_VIEW_PROPERTY(thumbnail, BOOL);
RCT_EXPORT_VIEW_PROPERTY(containerTag, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(isVisible, BOOL);
RCT_EXPORT_VIEW_PROPERTY(borderRadius, CGFloat);
RCT_EXPORT_VIEW_PROPERTY(muted, BOOL);
RCT_EXPORT_VIEW_PROPERTY(cropRect, BOOL);
RCT_EXPORT_VIEW_PROPERTY(id, NSString);
RCT_EXPORT_VIEW_PROPERTY(allowSkeleton, BOOL);
RCT_EXPORT_VIEW_PROPERTY(resizeMode, NSString);
RCT_EXPORT_VIEW_PROPERTY(sources, MediaSourceArray);
RCT_EXPORT_VIEW_PROPERTY(onLoad, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onProgress, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPlay, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPause, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onEnd, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onError, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onChangeItem, RCTDirectEventBlock);

RCT_EXPORT_VIEW_PROPERTY(onEditVideo, RCTDirectEventBlock);




RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(isRegistered:);
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(mediaSize:);



RCT_EXTERN_METHOD(batchPlay:(nonnull NSNumber*)tag IDs:(nonnull NSArray*)ids);
RCT_EXTERN_METHOD(batchPause:(nonnull NSNumber*)tag IDs:(nonnull NSArray*)ids);
//RCT_EXTERN_METHOD(crop:(nonnull NSNumber*)tag bounds:(CGRect)bounds originalSize:(CGSize)originalSize resolver:(RCTPromiseResolveBlock)resolver rejecter:( RCTPromiseRejectBlock)rejecter);

RCT_EXTERN_METHOD(startCachingMediaSources:(nonnull NSArray*)mediaSources bounds:(CGRect)bounds contentMode:(UIViewContentMode)contentMode);
RCT_EXTERN_METHOD(stopCachingMediaSources:(nonnull NSArray*)mediaSources bounds:(CGRect)bounds contentMode:(UIViewContentMode)contentMode);
RCT_EXTERN_METHOD(stopCachingAll);

RCT_EXTERN_METHOD(share:(nonnull NSNumber*)tag network:(NSString*)network callback:(RCTResponseSenderBlock)callback);
RCT_EXTERN_METHOD(pause:);
RCT_EXTERN_METHOD(play:);
RCT_EXTERN_METHOD(editVideo:(nonnull NSNumber*)tag cb:(RCTResponseSenderBlock)callback);
RCT_EXTERN_METHOD(detectRectangles:(nonnull NSNumber*)tag cb:(RCTResponseSenderBlock)callback);
RCT_EXTERN_METHOD(reset:);
RCT_EXTERN_METHOD(save:(nonnull NSNumber*)tag cb:(RCTResponseSenderBlock)callback);
RCT_EXTERN_METHOD(goNext:::);
RCT_EXTERN_METHOD(goBack:::);
RCT_EXTERN_METHOD(advance:(nonnull NSNumber*)tag index:(nonnull NSNumber*)node callback:(RCTResponseSenderBlock)callback);
RCT_EXTERN_METHOD(advanceWithFrame:(nonnull NSNumber*)tag index:(nonnull NSNumber*)node resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject);

_RCT_EXTERN_REMAP_METHOD(advance, advance:(nonnull NSNumber*)tag index:(nonnull NSNumber*)node resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject, NO);
_RCT_EXTERN_REMAP_METHOD(goNextWithResolver, goNextWithResolver::::, NO);
_RCT_EXTERN_REMAP_METHOD(goBackWithResolver, goBackWithResolver::::, NO);

@end

