//
//  Log.swift
//  coronarnapp
//
//  Created by Jarred WSumner on 2/28/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation


class Log {

 class func debug(_ message: @autoclosure () -> Any, _
  file: String = #file, _ function: String = #function, line: Int = #line, context: Any? = nil) {
    #if DEBUG
      NSLog(message())
    #endif
  }

}
