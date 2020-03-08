//
//  VideoResizer.swift
//  yeet
//
//  Created by Jarred WSumner on 10/15/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import UIKit
import AVFoundation
import Promise
import Photos
import VideoToolbox

extension AVURLAsset {
  public static let hasHEVCHardwareEncoder: Bool = {
      let spec: [CFString: Any]
      #if os(macOS)
          spec = [ kVTVideoEncoderSpecification_RequireHardwareAcceleratedVideoEncoder: true ]
      #else
          spec = [:]
      #endif
      var outID: CFString?
      var properties: CFDictionary?
      let result = VTCopySupportedPropertyDictionaryForEncoder(width: 1920, height: 1080, codecType: kCMVideoCodecType_HEVC, encoderSpecification: spec as CFDictionary, encoderIDOut: &outID, supportedPropertiesOut: &properties)
      if result == kVTCouldNotFindVideoEncoderErr {
          return false // no hardware HEVC encoder
      }
      return result == noErr
  }()

//  static func resolveCameraURL(cameraURL: URL) -> Promise<URL> {
//    return Promise<URL>() { resolve, reject in
//      let fetchOpts = PHFetchOptions.init()
//      fetchOpts.fetchLimit = 1
//
//      var fetchResult = PHAsset.fetchAssets(withALAssetURLs: [cameraURL], options: fetchOpts)
//      guard let videoAsset = fetchResult.firstObject else {
//        reject(NSError(domain: "com.codeblogcorp.yeet", code: -807, userInfo: nil))
//        return
//      }
//
//        let options: PHVideoRequestOptions = PHVideoRequestOptions()
//        options.version = .original
//
//        PHImageManager.default().requestAVAsset(forVideo: videoAsset, options: options, resultHandler: { (asset, audioMix, info) in
//          if let urlAsset = asset as? AVURLAsset {
//            resolve(urlAsset.url)
//          } else {
//            reject(NSError(domain: "com.codeblogcorp.yeet", code: -808, userInfo: nil))
//          }
//        })
//    }
//  }
//
  func load(forKeys: Array<String> = ["playable", "tracks", "duration"]) -> Promise<AVURLAsset> {
    var _error: NSError? = nil

    let status = self.statusOfValue(forKey: "playable", error: &_error)

    if status == .loaded && self.isPlayable {
      return Promise<AVURLAsset>() { [weak self] resolve, _ in
        resolve(self!)
      }
    }

    return Promise<AVURLAsset>() { [weak self] resolve, reject in
      self?.loadValuesAsynchronously(forKeys: forKeys) { [weak self] in
        guard let this = self else {
          return
        }
        var _error: NSError? = nil
        let status = this.statusOfValue(forKey: "playable", error: &_error)

        if status == .loaded && this.isPlayable {
          resolve(this)
        } else {
          reject(_error ?? NSError(domain: "com.codeblogcorp.yeet", code: -209))
        }
      }
    }
  }


}

