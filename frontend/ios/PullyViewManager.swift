//
//  PullyViewManager.swift
//  coronarnapp
//
//  Created by Jarred WSumner on 3/1/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import UIKit

@objc(PullyViewManager) class PullyViewManager: RCTViewManager, RCTUIManagerObserver {

  static override func moduleName() -> String! {
    return "PullyView"
  }

  static override func requiresMainQueueSetup() -> Bool {
    return true
  }

  let views = NSHashTable<PullyViewContainer>(options: .weakMemory)
  override func view() -> UIView! {
    let _view = PullyViewContainer(bridge: bridge)
    views.add(_view)
    return _view
  }

  override var bridge: RCTBridge! {
    get {

      return super.bridge
    }

    set (newValue) {
      super.bridge = newValue


      if newValue.isValid {
        newValue.uiManager.observerCoordinator.add(self)
      }
    }
  }

  @objc (snapTo:position:) func snapTo(_ tag: NSNumber, size: String) {
    var snapPosition = SheetPosition.bottom

    if (size == "bottom") {
      snapPosition = .bottom
    } else if (size == "top") {
      snapPosition = .top
    }


    RCTExecuteOnMainQueue {
      guard let pullyView = self.bridge.uiManager.view(forReactTag: tag) as? PullyViewContainer else {
        return
      }

      pullyView.pullupViewController?.snapTo(position: snapPosition)
    }
  }

  @objc(invalidate) func invalidate() {
    views.allObjects.forEach { view in
//      view.removePully()
    }
  }


  @objc func uiManagerDidPerformMounting(_ manager: RCTUIManager!) {
    RCTExecuteOnMainQueue {
      self.views.allObjects.forEach { view in
        view.addPullUpControllerIfNeeded()
      }
    }

  }
}
