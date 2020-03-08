#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTAccessibilityManager.h>
#else
#import "React/RCTBridgeModule.h"
#import "React/RCTAccessibilityManager.h"
#endif

@interface YeetTextSize : NSObject <RCTBridgeModule>
- (NSDictionary* _Nullable)measure:(NSDictionary * _Nullable)options;
@end
