//
//  YeetVideoView.swift
//  yeet
//
//  Created by Jarred WSumner on 9/29/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation

@objc class YeetVideoView: UIView, TrackableMediaSourceDelegate {
  func onChangeStatus(status: TrackableMediaSource.Status, oldStatus: TrackableMediaSource.Status, mediaSource: TrackableMediaSource) {
    if status == .loaded || status == .playing {

    }

    if mediaSource.mediaSource.isVideo {
      guard let trackableVideo = mediaSource as? TrackableVideoSource else {
        return
      }
      self.mediaSource = mediaSource.mediaSource
    } else {

    }
  }

  weak var mediaSource: MediaSource? = nil {
    didSet {
      if coverView.mediaSource != mediaSource?.coverMediaSource {
        self.coverView.mediaSource = mediaSource?.coverMediaSource
      }

      if oldValue != mediaSource {
        observer?.invalidate()
      }
    }
  }

  func onMediaProgress(elapsed: Double, mediaSource: TrackableMediaSource) {
  }

  @objc(videoSize) var videoSize : CGSize {
    if showCover {
      return coverView.imageSize
    } else {
      return mediaSource?.asset?.resolution ?? .zero
    }
  }

  var showCover: Bool = false {
    didSet {
      DispatchQueue.main.async {
        if oldValue != self.showCover {
          if self.showCover && self.coverView.image == nil && self.coverView.mediaSource != nil && !self.coverView.isLoadingImage {
            self.coverView.loadImage(async: true)
          }

          let hideCover = !self.showCover
          if hideCover != self.coverView.isHidden {
            self.coverView.isHidden = hideCover
          }

        }
      }
    }
  }
  var coverView: YeetImageView
  var playerView: VideoPlayerView
  var playerLayer: AVPlayerLayer {
    get {
      return playerView.playerLayer
    }
  }

  var observer: NSKeyValueObservation? = nil

  var isReadyForDisplay: Bool {
    return self.playerView.playerLayer.isReadyForDisplay
  }

  func configurePlayer(player: AVPlayer) {
    if playerView.superview != self {
      self.insertSubview(playerView, at: max(subviews.firstIndex(of: coverView) ?? 1 - 1, 0))
    }

    self.playerView.player = player

    observer?.invalidate()
    observer = self.playerView.playerLayer.observe(\AVPlayerLayer.isReadyForDisplay, options: [.new, .initial]) { [weak self] player, _ in
      if player.isReadyForDisplay ?? false && (self?.showCover ?? false) {
        self?.showCover = false
        self?.observer?.invalidate()
        self?.observer = nil
      }
    }
  }

  override init(frame: CGRect) {
    let playerView = VideoPlayerView(frame: frame)
    let coverView = YeetImageView()

    self.playerView = playerView
    self.coverView = coverView

    super.init(frame: frame)

//    layer.needsDisplayOnBoundsChange = true
//    playerView.layer.needsDisplayOnBoundsChange = true
//    coverView.layer.needsDisplayOnBoundsChange = true
    playerView.bounds = frame
    playerView.isOpaque = false
    playerView.backgroundColor = UIColor.clear
    coverView.bounds = frame
    playerView.frame = bounds
    coverView.frame = bounds
    coverView.isOpaque = false

    self.addSubview(playerView)
    self.addSubview(coverView)

  }

  required init?(coder: NSCoder) {
    fatalError()
  }

  override func layoutSubviews() {
    super.layoutSubviews()

    if playerView.player != nil {
      let shouldAntiAlias = frame.size.width < UIScreen.main.bounds.size.width
      playerView.layer.edgeAntialiasingMask = shouldAntiAlias ? [.layerBottomEdge, .layerTopEdge, .layerLeftEdge, .layerRightEdge] : []

      if playerView.bounds != bounds {
        CATransaction.begin()
        CATransaction.setAnimationDuration(.zero)
        playerView.frame = bounds
        playerView.bounds = bounds
        CATransaction.commit()
      }
    }

    if coverView.bounds != bounds {
      coverView.frame = bounds
      coverView.bounds = frame
    }
  }

  func reset() {
    coverView.isHidden = true
    observer?.invalidate()
    playerView.player?.pause()
    playerView.player?.cancelPendingPrerolls()
    playerView.player = nil
    playerView.isHidden = true
  }


  deinit {
    self.reset()
    print("DEINIT VIDEO")

//    if playerLayer?.superlayer != nil {
//      playerLayer?.removeFromSuperlayer()
//    }
  }
}

//
//import UIKit
//import AVKit
//import AVFoundation
//
//class YeetVideoView: UIView {
//    var player: AVPlayer? {
//        get {
//            return playerLayer.player
//        }
//        set {
//            playerLayer.player = newValue
//          playerLayer.videoGravity = .resizeAspectFill
//        }
//    }
//
//
//
//    var playerLayer: AVPlayerLayer {
//        return layer as! AVPlayerLayer
//    }
//
//    // Override UIView property
//    override static var layerClass: AnyClass {
//        return AVPlayerLayer.self
//    }
//}

extension AVAsset {
  var resolution : CGSize {
    guard let videoTrack = self.tracks(withMediaType: .video).first else {
      return .zero
    }

    return CGRect(origin: .zero, size: videoTrack.naturalSize.applying(videoTrack.preferredTransform)).standardized.size
  }
}

extension AVLayerVideoGravity {
  var contentsGravity: CALayerContentsGravity {
//    return .center
    switch self {
      case .resize: return .resize
      case .resizeAspect: return .resizeAspect
      case .resizeAspectFill: return  .resizeAspectFill
    default:
      return .resizeAspect
    }
  }
}
