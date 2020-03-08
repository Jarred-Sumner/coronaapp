//
//  PullyViewContainer.swift
//  coronarnapp
//
//  Created by Jarred WSumner on 3/1/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import UIKit
import UBottomSheet

@objc(PullyViewContainer)
class PullyViewContainer: UIView, UIGestureRecognizerDelegate {
  var pullupViewController: DrawerViewController? = nil
  weak var backgroundView : UIView? = nil

  override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    super.insertReactSubview(subview, at: atIndex)

    self.pullupViewController = DrawerViewController(view: subview)
  }

  weak var parentVC: UIViewController? = nil


  var bridge: RCTBridge? = nil

  init(bridge: RCTBridge) {
    self.bridge = bridge
    super.init(frame: .zero)

    self.isUserInteractionEnabled = false
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  @objc(invalidate) func invalidate() {
//    removePully()
  }

  override func removeReactSubview(_ subview: UIView!) {
    super.removeReactSubview(subview)
    removePully()
  }

  func removePully() {
    guard hasAddedPullUpController else {
      return
    }
    
    pullupViewController?.detach()
    pullupViewController = nil
    hasAddedPullUpController = false
  }

  override func didSetProps(_ changedProps: [String]!) {
    super.didSetProps(changedProps)

    if changedProps.contains("scrollViewTag") {
      RCTExecuteOnMainQueue {
        guard let scrollViewTag = self.scrollViewTag else {
          return
        }
        guard let uiManager = self.bridge?.uiManager else {
          return
        }

        let rctScrollView = uiManager.view(forReactTag: scrollViewTag) as! RCTScrollView

        self.pullupViewController?.scrollView = rctScrollView.scrollView
      }
    }

    if changedProps.contains("onChangePosition") {
      pullupViewController?.onChangePosition = onChangePosition
    }
  }

  @objc (initialStickyPointOffset) var initialStickyPointOffset = CGFloat(350)

  override func didUpdateReactSubviews() {
    super.didUpdateReactSubviews()
//    addPullUpControllerIfNeeded()
    self.isUserInteractionEnabled = false
  }

  override var intrinsicContentSize: CGSize {
    return UIScreen.main.bounds.size
  }

  var isDisabled = false

  func addPullUpControllerIfNeeded() {
    guard !hasAddedPullUpController && !isDisabled  else {
      return
    }

    guard let pullupViewController = self.pullupViewController else {
      return
    }
    guard let parentVC = reactViewController() else {
      return
    }

    self.parentVC = parentVC

    pullupViewController.attach(to: parentVC)
    pullupViewController.onChangePosition = onChangePosition
    self.hasAddedPullUpController = true
  }

  var hasAddedPullUpController = false

  @objc(scrollViewTag) var scrollViewTag: NSNumber? = nil

  override func didMoveToSuperview() {
    super.didMoveToSuperview()

    if superview != nil && self.backgroundView == nil && !hasAddedPullUpController && pullupViewController != nil  {
      let backgroundView = UIView(frame: UIScreen.main.bounds)
      backgroundView.backgroundColor = UIColor.black
      backgroundView.isUserInteractionEnabled = false
      backgroundView.alpha = 0

      superview?.insertSubview(backgroundView, belowSubview: self)
      self.backgroundView = backgroundView
      pullupViewController?.backgroundView = backgroundView
    }
  }

  override func willMove(toSuperview newSuperview: UIView?) {
    super.willMove(toSuperview: newSuperview)

    if newSuperview == nil {
      isDisabled = true
       removePully()
    }
  }

 

  override func layoutSubviews() {
    UIView.setAnimationsEnabled(false)
    super.layoutSubviews()
    UIView.setAnimationsEnabled(true)


  }

  @objc (onChangePosition) var onChangePosition: RCTDirectEventBlock? = nil

  @objc(animateOpen) var animateOpen = false

  func setupViewControllers() {

    

  }


  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    return true
  }

  deinit {
//    NSLog("DEINIT")
//    removePully()
  }

  
}
