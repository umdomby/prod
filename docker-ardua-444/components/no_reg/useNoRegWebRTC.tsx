"use client";
import { useEffect, useState, useRef } from "react";
import { VideoPlayer } from "@/components/webrtc/components/VideoPlayer";
import { joinRoomViaProxy } from "@/app/actions";

interface NoRegWebRTCProps {
    roomId: string;
}

export default function UseNoRegWebRTC({ roomId }: NoRegWebRTCProps) {

    let remoteStream;
    let videoRef;

    return (
        <div className="relative w-full h-full">
            <VideoPlayer stream={remoteStream} videoRef={videoRef} muted={false} className="w-full h-full" />
        </div>
    )
}