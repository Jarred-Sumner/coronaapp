//
//  MediaPlayerViewManager.swift
//  yeet
//
//  Created by Jarred WSumner on 9/29/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import Vision

@objc(MediaPlayerViewManager)
class MediaPlayerViewManager: RCTViewManager, RCTInvalidating {

  @objc(invalidate) func invalidate() {
    RCTExecuteOnMainQueue {
      self.views.allObjects.forEach { player in
        player.invalidate()
      }
    }

  }

  override static func moduleName() -> String! {
    return "MediaPlayerView";
  }

  var views = NSHashTable<MediaPlayer>(options: .weakMemory)
  override func view() -> MediaPlayer? {
   let _view = MediaPlayer(bridge: self.bridge)
    views.add(_view)
    return _view
  }

  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  func withView(tag: NSNumber, block: @escaping (_ mediaPlayer: MediaPlayer) -> Void) {
    DispatchQueue.main.async { [weak self] in
      if let _view = (self?.bridge.uiManager.view(forReactTag: tag) as! MediaPlayer?) {
        block(_view)
      }
    }
  }


  override var bridge: RCTBridge! {
    get {
      return super.bridge
    }

    set (newValue) {
      super.bridge = newValue


      newValue?._run(afterLoad: { [weak self] in
        guard let this = self else {
          return
        }


        MediaPlayerJSIModuleInstaller.install(this)
      })

    }
  }

  @objc(batchPause:IDs:)
  func batchPause(_ tag: NSNumber, _ IDs: Array<NSNumber>) {
    DispatchQueue.main.async {

      var players: Array<MediaPlayer>? = IDs.compactMap { id -> MediaPlayer? in
        if let player = self.bridge.uiManager.view(forReactTag: id) {
          return MediaPlayerViewManager.findMediaPlayer(player)
        } else {
          return nil
        }
      }

      players?.forEach { player in
        guard let current = player.source else {
          return
        }

        player.halted = true
        player.haltContent()
      }

      DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {

        players?.forEach { player in
          guard player.halted else {
            return
          }

          if let videoView = player.videoView {
            player.videoView?.showCover = true
            player.videoView?.playerView.player = nil
          }
        }

        players = nil
      }
    }



  }

  @objc(mediaSize:)
  func mediaSize(_ tag: NSNumber) -> NSDictionary {
    guard let mediaPlayer = bridge.uiManager.unsafeView(forReactTag: tag) as? MediaPlayer else {
      return [:]
    }

    return mediaPlayer.mediaSize.dictionaryValue() as NSDictionary
  }

  static func findMediaPlayer(_ view: UIView) -> MediaPlayer? {
    if type(of: view) == MediaPlayer.self {
      return view as! MediaPlayer;
    } else if (view.subviews.count > 0) {
      for subview in view.subviews {
        if (type(of: subview) == MediaPlayer.self) {
          return subview as! MediaPlayer
        } else if (subview.subviews.count > 0) {
          if let player = findMediaPlayer(subview) {
            return player
          }
        }

      }
      return nil

    } else {
      return nil;
    }
  }

  @objc(batchPlay:IDs:)
  func batchPlay(_ tag: NSNumber, _ IDs: Array<NSNumber>) {
    DispatchQueue.main.async {
       let players = IDs.compactMap { id -> MediaPlayer? in
         if let player = self.bridge.uiManager.view(forReactTag: id) {
           return MediaPlayerViewManager.findMediaPlayer(player)
         } else {
           return nil
         }
       }

      players.forEach { player in
        guard let current = player.source else {
          return
        }

        if player.halted {
          player.halted = false

          if !player.paused {
            player.play()
          }

        }

      }
    }
  }


  @objc (startCachingMediaSources:bounds:contentMode:)
  func startCaching(mediaSources: AnyObject, bounds: CGRect, contentMode: UIView.ContentMode) {
    let _mediaSources = RCTConvert.mediaSourceArray(json: mediaSources)
    YeetImageView.startCaching(mediaSources: _mediaSources, bounds: bounds, contentMode: contentMode)
  }

  @objc (stopCachingMediaSources:bounds:contentMode:)
  func stopCaching(mediaSources: AnyObject, bounds: CGRect, contentMode: UIView.ContentMode) {
    let _mediaSources = RCTConvert.mediaSourceArray(json: mediaSources)
    YeetImageView.stopCaching(mediaSources: _mediaSources, bounds: bounds, contentMode: contentMode)
  }

  @objc (stopCachingAll)
  func stopCachingAll() {
    YeetImageView.stopCaching()
  }

  @objc(save: cb:)
  func save(_ tag: NSNumber, _ cb: @escaping RCTResponseSenderBlock) {
    withView(tag: tag) { view in
      view.saveToCameraRoll().then { result in
        cb([nil, result])
      }.catch { error in
        cb([error, nil])
      }
    }
  }

  @objc(editVideo: cb:)
  func editVideo(_ tag: NSNumber, _ cb: @escaping RCTResponseSenderBlock) {
    withView(tag: tag) { view in
      let didOpen = view.editVideo()
      guard didOpen else {
        cb([nil, ["success": false]])
        return
      }

      let _originalEditVideo = view.onEditVideo
      view.onEditVideo = { [weak view] value in
        cb([nil, value])
        view?.onEditVideo = _originalEditVideo
      }
    }
  }

  @objc(isRegistered:)
  func isRegistered(_ id: NSString) -> Bool {
    return MediaSource.cached(uri: id as String) != nil
  }



  @objc(pause:)
  func pause(tag: NSNumber) {
    withView(tag: tag) { view in
      view.pause()
    }
  }

  @objc(play:)
  func play(tag: NSNumber) {
    withView(tag: tag) { [weak self] view in
      view.play()
    }
  }

  @objc(reset:)
  func reset(tag: NSNumber) {
    withView(tag: tag) { [weak self] view in
      view.reset()
    }
  }

  @objc(goNext::)
  func goNext(tag: NSNumber, cb: @escaping RCTResponseSenderBlock) {
    withView(tag: tag) { [weak self] view in
      view.goNext { tracker in
        cb([nil, tracker])
      }
    }
  }

  @objc(goNextWithResolver:::)
  func goNextWithResolver(tag: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    withView(tag: tag) { [weak self] view in
      view.goNext { tracker in
        resolver(tracker)
      }
    }
  }

  @objc(goBack::)
  func goBack(tag: NSNumber, cb: @escaping RCTResponseSenderBlock) {
    withView(tag: tag) { [weak self] view in
      view.goBack { tracker in
        cb([nil, tracker])
      }
    }
  }

  @objc(goBackWithResolver:::)
  func goBackWithResolver(tag: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    withView(tag: tag) { [weak self] view in
      view.goBack { tracker in
        resolver(tracker)
      }
    }
  }

  @objc(advance:index:callback:)
  func advance(_ tag: NSNumber, _ index: NSNumber, _ cb: @escaping RCTResponseSenderBlock) {
    withView(tag: tag) { view in
      view.advance(to: index.intValue) { tracker in
        cb([nil, tracker])
      }
    }
  }

  @objc(advance:index:resolve:rejecter:)
  func advance(_ tag: NSNumber, _ index: NSNumber, _ resolve: @escaping RCTPromiseResolveBlock, _ rejecter: @escaping RCTPromiseRejectBlock) {
     withView(tag: tag) { view in
       view.advance(to: index.intValue) { tracker in
         resolve(tracker)
       }
     }
   }

  @objc(advanceWithFrame:index:resolve:rejecter:)
  func advanceWithFrame(_ tag: NSNumber, _ index: NSNumber, _ resolve: @escaping RCTPromiseResolveBlock, _ rejecter: @escaping RCTPromiseRejectBlock) {
     withView(tag: tag) { view in
      view.advance(to: index.intValue, withFrame: true) { tracker in
         resolve(tracker)
       }
     }
   }


  static let cacheDelegate = MediaPlayerCacheDelegate()
 
}

class MediaPlayerCacheDelegate : NSObject, NSCacheDelegate {
  func cache(_ cache: NSCache<AnyObject, AnyObject>, willEvictObject obj: Any) {
    let mediaSource = obj as! MediaSource

    print("WILL EVICT \(mediaSource.id)")
  }
}

extension CGImagePropertyOrientation {
  init(_ uiOrientation: UIImage.Orientation) {
        switch uiOrientation {
            case .up: self = .up
            case .upMirrored: self = .upMirrored
            case .down: self = .down
            case .downMirrored: self = .downMirrored
            case .left: self = .left
            case .leftMirrored: self = .leftMirrored
            case .right: self = .right
            case .rightMirrored: self = .rightMirrored
        }
    }
}
