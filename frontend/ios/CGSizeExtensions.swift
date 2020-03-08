//
//  CGSize+Extensions.swift
//  yeet
//
//  Created by Jarred WSumner on 12/27/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import UIKit

extension CGSize {


  func dictionaryValue() -> [String: Any] {
    return [
      "width": width,
      "height": height
    ]
  }

}
