//
//  DrawerViewController.swift
//  coronarnapp
//
//  Created by Jarred WSumner on 3/1/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import UIKit
import UBottomSheet

class DrawerViewController: CustomBottomSheetController, UIScrollViewDelegate {
  var subview: UIView
  weak var backgroundView: UIView? = nil

  init(view: UIView) {
    subview = view
    super.init(nibName: nil, bundle: nil)
  }

  override func loadView() {
    super.loadView()
    self.view.backgroundColor = .clear
    self.view.isUserInteractionEnabled = true
    self.view.addSubview(subview)
  }


  


  var isAttachedScrollView = false

  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    if scrollView == nil {
      scrollView = firstScrollView
    }
//    attachScrollView()
  }

  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillAppear(animated)
//    detachScrollView()
  }

  override var middleYPercentage: CGFloat {
     return bottomYPercentage
   }

  


   override var bottomYPercentage: CGFloat {
     return 350 / (UIScreen.main.bounds.size.height - topInset - bottomInset)
   }


//  func detachScrollView() {
//    scrollView?.detach(from: self)
//    isAttachedScrollView = false
//  }
//
//  func attachScrollView() {
//     scrollView?.attach(to: self)
//     isAttachedScrollView = true
//   }

  var firstScrollView: UIScrollView? {
    var scrollView: RCTScrollView? = nil
    var _view: UIView? = subview
    var remainingAttempts = 10
    while (scrollView == nil && remainingAttempts > 0) {
      if _view is RCTScrollView {
        scrollView = _view as! RCTScrollView
        break
      }
      scrollView = _view?.reactSubviews()?.first { view in
        return view is RCTScrollView
      } as? RCTScrollView
      if (scrollView == nil) {
        _view = _view?.reactSubviews()?.first
      }
      remainingAttempts -= 1
    }

    return scrollView?.scrollView
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

//  override var pullUpControllerBounceOffset: CGFloat {
//       return 40
//   }




  func setAlpha() {
//     let minOffset = pullUpControllerAllStickyPoints.min()!
//        let maxOffset = pullUpControllerAllStickyPoints.max()!
//
//    self.backgroundView?.alpha = max(min((point - minOffset) / (maxOffset - minOffset), 0.75), 0)
  }


  
    override func viewDidLoad() {
        super.viewDidLoad()
      
        // Do any additional setup after loading the view.
    }


}
