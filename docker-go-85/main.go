package main
import (
"encoding/json"
    "errors"
    "fmt"
    "log"
    "net/http"
    "regexp" // Добавлено для normalizeSdpForCodec
    "strings" // Добавлено для normalizeSdpForCodec
    "sync"
    "time"
    "github.com/gorilla/websocket"
    "github.com/pion/webrtc/v3"
)

var upgrader = websocket.Upgrader{
CheckOrigin: func(r *http.Request) bool { return true },
}

type Peer struct {
conn     *websocket.Conn
pc       *webrtc.PeerConnection
username string
room     string
isLeader bool
mu       sync.Mutex
}

type RoomInfo struct {
Users    []string `json:"users"`
Leader   string   `json:"leader"`
Follower string   `json:"follower"`
}

var (
    peers     = make(map[string]*Peer)
    rooms     = make(map[string]map[string]*Peer)
    mu        sync.Mutex
    // letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") // Не используется, но оставлено для вашего сведения
    webrtcAPI *webrtc.API // Глобальный API с настроенным MediaEngine
)

func isConnAlive(conn *websocket.Conn) bool {
    if conn == nil {
        return false
    }
    err := conn.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(2*time.Second))
    return err == nil
}

func normalizeSdpForCodec(sdp, preferredCodec string) string {
    log.Printf("Normalizing SDP for codec: %s", preferredCodec)
    lines := strings.Split(sdp, "\r\n")
    var newLines []string
    targetPayloadTypes := []string{}
    targetCodec := preferredCodec
    if targetCodec != "H264" && targetCodec != "VP8" {
        targetCodec = "H264"
        log.Printf("Invalid codec %s, defaulting to H264", preferredCodec)
    }

    // Найти payload types для целевого кодека
    codecRegex := regexp.MustCompile(fmt.Sprintf(`a=rtpmap:(\d+) %s/\d+`, targetCodec))
    for _, line := range lines {
        matches := codecRegex.FindStringSubmatch(line)
        if matches != nil {
            targetPayloadTypes = append(targetPayloadTypes, matches[1])
            log.Printf("Found %s payload type: %s", targetCodec, matches[1])
        }
    }

    // Добавить H.264, если отсутствует
    if len(targetPayloadTypes) == 0 && targetCodec == "H264" {
        log.Printf("No H264 payload types found, adding manually")
        targetPayloadTypes = []string{"126"}
        h264Lines := []string{
            "a=rtpmap:126 H264/90000",
            "a=fmtp:126 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1",
            "a=rtcp-fb:126 ccm fir",
            "a=rtcp-fb:126 nack",
            "a=rtcp-fb:126 nack pli",
        }
        videoSectionFound := false
        for i, line := range lines {
            if strings.HasPrefix(line, "m=video") {
                videoSectionFound = true
                newLines = append(lines[:i+1], append(h264Lines, lines[i+1:]...)...)
                newLines[i] = "m=video 9 UDP/TLS/RTP/SAVPF 126"
                break
            }
        }
        if !videoSectionFound {
            log.Printf("No m=video section found, returning original SDP")
            return sdp
        }
    } else {
        newLines = lines
    }

    // Удалить другие кодеки
    otherCodecs := []string{"VP8", "VP9", "AV1"}
    if targetCodec == "VP8" {
        otherCodecs = []string{"H264", "VP9", "AV1"}
    }
    filteredLines := []string{}
    for _, line := range newLines {
        skip := false
        for _, codec := range otherCodecs {
            codecRegex := regexp.MustCompile(fmt.Sprintf(`a=rtpmap:(\d+) %s/\d+`, codec))
            if codecRegex.MatchString(line) || strings.Contains(line, fmt.Sprintf("apt=%s", codec)) {
                log.Printf("Skipping line with codec %s: %s", codec, line)
                skip = true
                break
            }
        }
        if !skip {
            filteredLines = append(filteredLines, line)
        }
    }
    newLines = filteredLines

    // Убедиться, что m=video содержит только целевой payload type
    for i, line := range newLines {
        if strings.HasPrefix(line, "m=video") {
            newLines[i] = fmt.Sprintf("m=video 9 UDP/TLS/RTP/SAVPF %s", targetPayloadTypes[0])
            log.Printf("Updated m=video to use only %s payload type: %s", targetCodec, targetPayloadTypes[0])
            break
        }
    }

    // Установить битрейт
    for i, line := range newLines {
        if strings.HasPrefix(line, "a=mid:video") {
            newLines = append(newLines[:i+1], append([]string{"b=AS:300"}, newLines[i+1:]...)...)
            break
        }
    }

    newSdp := strings.Join(newLines, "\r\n")
    log.Printf("Normalized SDP for %s:\n%s", targetCodec, newSdp)
    return newSdp
}

// contains проверяет, есть ли элемент в срезе
func contains(slice []string, item string) bool {
    for _, s := range slice {
        if s == item {
            return true
        }
    }
    return false
}


// createMediaEngine создает MediaEngine с учетом preferredCodec
func createMediaEngine(preferredCodec string) *webrtc.MediaEngine {
    mediaEngine := &webrtc.MediaEngine{}

    if preferredCodec == "H264" {
        // Регистрируем только H.264
        if err := mediaEngine.RegisterCodec(webrtc.RTPCodecParameters{
            RTPCodecCapability: webrtc.RTPCodecCapability{
                MimeType:    webrtc.MimeTypeH264,
                ClockRate:   90000,
                SDPFmtpLine: "level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f",
                RTCPFeedback: []webrtc.RTCPFeedback{
                    {Type: "nack"},
                    {Type: "nack", Parameter: "pli"},
                    {Type: "ccm", Parameter: "fir"},
                    {Type: "goog-remb"},
                },
            },
            PayloadType: 126,
        }, webrtc.RTPCodecTypeVideo); err != nil {
            log.Printf("H264 codec registration error: %v", err)
        }
        log.Printf("MediaEngine configured with H.264 (PT: 126) only")
    } else if preferredCodec == "VP8" {
        // Регистрируем только VP8
        if err := mediaEngine.RegisterCodec(webrtc.RTPCodecParameters{
            RTPCodecCapability: webrtc.RTPCodecCapability{
                MimeType:    webrtc.MimeTypeVP8,
                ClockRate:   90000,
                RTCPFeedback: []webrtc.RTCPFeedback{
                    {Type: "nack"},
                    {Type: "nack", Parameter: "pli"},
                    {Type: "ccm", Parameter: "fir"},
                    {Type: "goog-remb"},
                },
            },
            PayloadType: 96,
        }, webrtc.RTPCodecTypeVideo); err != nil {
            log.Printf("VP8 codec registration error: %v", err)
        }
        log.Printf("MediaEngine configured with VP8 (PT: 96) only")
    } else {
        // По умолчанию H.264
        if err := mediaEngine.RegisterCodec(webrtc.RTPCodecParameters{
            RTPCodecCapability: webrtc.RTPCodecCapability{
                MimeType:    webrtc.MimeTypeH264,
                ClockRate:   90000,
                SDPFmtpLine: "level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f",
                RTCPFeedback: []webrtc.RTCPFeedback{
                    {Type: "nack"},
                    {Type: "nack", Parameter: "pli"},
                    {Type: "ccm", Parameter: "fir"},
                    {Type: "goog-remb"},
                },
            },
            PayloadType: 126,
        }, webrtc.RTPCodecTypeVideo); err != nil {
            log.Printf("H264 codec registration error: %v", err)
        }
        log.Printf("MediaEngine configured with default H.264 (PT: 126)")
    }

    // Регистрируем Opus аудио
    if err := mediaEngine.RegisterCodec(webrtc.RTPCodecParameters{
        RTPCodecCapability: webrtc.RTPCodecCapability{
            MimeType:     webrtc.MimeTypeOpus,
            ClockRate:    48000,
            Channels:     2,
            SDPFmtpLine:  "minptime=10;useinbandfec=1",
            RTCPFeedback: []webrtc.RTCPFeedback{},
        },
        PayloadType: 111,
    }, webrtc.RTPCodecTypeAudio); err != nil {
        log.Printf("Opus codec registration error: %v", err)
    }

    return mediaEngine
}

func init() {
    // rand.Seed(time.Now().UnixNano()) // Закомментировано, т.к. randSeq не используется. Если будете использовать math/rand, раскомментируйте.
    initializeMediaAPI() // Инициализируем MediaEngine при старте
}

// initializeMediaAPI настраивает MediaEngine только с H.264 и Opus
func initializeMediaAPI() {
    mediaEngine := createMediaEngine("H264")
    webrtcAPI = webrtc.NewAPI(
        webrtc.WithMediaEngine(mediaEngine),
    )
    log.Println("Global MediaEngine initialized with H.264 (PT: 126) and Opus (PT: 111)")
}

// getWebRTCConfig осталась вашей функцией
func getWebRTCConfig() webrtc.Configuration {
    return webrtc.Configuration{
        ICEServers: []webrtc.ICEServer{
        {URLs: []string{"stun:stun.l.google.com:19302"}},
        {URLs: []string{"stun:ardua.site:3478"}},
        {URLs: []string{"turn:ardua.site:3478"}, Username: "user1", Credential: "pass1"},
        },
        ICETransportPolicy: webrtc.ICETransportPolicyAll,
        BundlePolicy:       webrtc.BundlePolicyMaxBundle,
        RTCPMuxPolicy:      webrtc.RTCPMuxPolicyRequire,
        SDPSemantics:       webrtc.SDPSemanticsUnifiedPlan,
    }
}

// logStatus осталась вашей функцией
func logStatus() {
mu.Lock()
defer mu.Unlock()
log.Printf("--- Server Status ---")
log.Printf("Total Connections: %d", len(peers))
log.Printf("Active Rooms: %d", len(rooms))
for room, roomPeers := range rooms {
var leader, follower string
users := []string{}
for username, p := range roomPeers {
users = append(users, username)
if p.isLeader {
leader = p.username
} else {
follower = p.username
}
}
log.Printf("  Room '%s' (%d users: %v) - Leader: [%s], Follower: [%s]",
room, len(roomPeers), users, leader, follower)
}
log.Printf("---------------------")
}

// sendRoomInfo осталась вашей функцией
func sendRoomInfo(room string) {
    mu.Lock()
    defer mu.Unlock()

    roomPeers, exists := rooms[room]
    if !exists || roomPeers == nil {
        return
    }

    var leader, follower string
    users := make([]string, 0, len(roomPeers))
    for _, peer := range roomPeers {
        users = append(users, peer.username)
        if peer.isLeader {
            leader = peer.username
        } else {
            follower = peer.username
        }
    }

    roomInfo := RoomInfo{Users: users, Leader: leader, Follower: follower}
    for _, peer := range roomPeers {
        peer.mu.Lock()
        conn := peer.conn
        if conn != nil {
            err := conn.WriteJSON(map[string]interface{}{"type": "room_info", "data": roomInfo})
            if err != nil {
                log.Printf("Error sending room info to %s (user: %s): %v", conn.RemoteAddr(), peer.username, err)
            }
        }
        peer.mu.Unlock()
    }
}

// closePeerResources - унифицированная функция для закрытия ресурсов пира
func closePeerResources(peer *Peer, reason string) {
if peer == nil {
return
}
peer.mu.Lock() // Блокируем конкретного пира

    // Сначала закрываем WebRTC соединение
    if peer.pc != nil {
        log.Printf("Closing PeerConnection for %s (Reason: %s)", peer.username, reason)
        // Небольшая задержка может иногда помочь отправить последние данные, но обычно не нужна
        // time.Sleep(100 * time.Millisecond)
        if err := peer.pc.Close(); err != nil {
            // Ошибки типа "invalid PeerConnection state" ожидаемы, если соединение уже закрывается
            // log.Printf("Error closing peer connection for %s: %v", peer.username, err)
        }
        peer.pc = nil // Помечаем как закрытое
    }

    // Затем закрываем WebSocket соединение
    if peer.conn != nil {
        log.Printf("Closing WebSocket connection for %s (Reason: %s)", peer.username, reason)
        // Отправляем управляющее сообщение о закрытии, если возможно
        _ = peer.conn.WriteControl(websocket.CloseMessage,
            websocket.FormatCloseMessage(websocket.CloseNormalClosure, reason),
            time.Now().Add(time.Second)) // Даем немного времени на отправку
        peer.conn.Close()
        peer.conn = nil // Помечаем как закрытое
    }
    peer.mu.Unlock()
}

// handlePeerJoin осталась вашей функцией с изменениями для создания PeerConnection через webrtcAPI
func handlePeerJoin(room string, username string, isLeader bool, conn *websocket.Conn, preferredCodec string) (*Peer, error) {
    mu.Lock()
    defer mu.Unlock() // Гарантируем разблокировку мьютекса при выходе из функции

    // Очистка устаревших пиров в комнате
    if roomPeers, exists := rooms[room]; exists {
        for uname, p := range roomPeers {
            p.mu.Lock()
            if p.conn == nil || p.pc == nil || p.pc.ConnectionState() == webrtc.PeerConnectionStateClosed {
                log.Printf("Removing stale peer %s from room %s", uname, room)
                delete(roomPeers, uname)
                for addr, peer := range peers {
                    if peer == p {
                        delete(peers, addr)
                        break
                    }
                }
                go closePeerResources(p, "Stale peer cleanup")
            }
            p.mu.Unlock()
        }
        if len(roomPeers) == 0 {
            delete(rooms, room)
        }
    }

    if _, exists := rooms[room]; !exists {
        if !isLeader {
            _ = conn.WriteJSON(map[string]interface{}{"type": "error", "data": "Room does not exist. Leader must join first."})
            conn.Close()
            return nil, errors.New("room does not exist for follower")
        }
        rooms[room] = make(map[string]*Peer)
    }

    roomPeers := rooms[room]

    // Логика замены ведомого
    if !isLeader {
        hasLeader := false
        for _, p := range roomPeers {
            if p.isLeader {
                hasLeader = true
                break
            }
        }
        if !hasLeader {
            _ = conn.WriteJSON(map[string]interface{}{"type": "error", "data": "No leader in room"})
            conn.Close()
            return nil, errors.New("no leader in room")
        }

        var existingFollower *Peer
        codec := preferredCodec
        if codec == "" {
            codec = "H264"
        }
        log.Printf("Follower %s prefers codec: %s in room %s", username, codec, room)

        for _, p := range roomPeers {
            if !p.isLeader {
                existingFollower = p
                break
            }
        }

        if existingFollower != nil {
            log.Printf("Replacing old follower %s with new follower %s in room %s", existingFollower.username, username, room)
            delete(roomPeers, existingFollower.username)
            for addr, pItem := range peers {
                if pItem == existingFollower {
                    delete(peers, addr)
                    break
                }
            }
            existingFollower.mu.Lock()
            if existingFollower.conn != nil {
                _ = existingFollower.conn.WriteJSON(map[string]interface{}{
                    "type": "force_disconnect",
                    "data": "You have been replaced by another viewer",
                })
            }
            existingFollower.mu.Unlock()
            go closePeerResources(existingFollower, "Replaced by new follower")
        }

        var leaderPeer *Peer
        for _, p := range roomPeers {
            if p.isLeader {
                leaderPeer = p
                break
            }
        }
        if leaderPeer != nil && isConnAlive(leaderPeer.conn) {
            log.Printf("Sending rejoin_and_offer command to leader %s for new follower %s with codec %s", leaderPeer.username, username, codec)
            leaderPeer.mu.Lock()
            err := leaderPeer.conn.WriteJSON(map[string]interface{}{
                "type":           "rejoin_and_offer",
                "room":           room,
                "preferredCodec": codec,
            })
            leaderPeer.mu.Unlock()
            if err != nil {
                log.Printf("Error sending rejoin_and_offer to leader %s: %v", leaderPeer.username, err)
            }
        }
    }

    mediaEngine := createMediaEngine(preferredCodec)
    peerAPI := webrtc.NewAPI(webrtc.WithMediaEngine(mediaEngine))
    peerConnection, err := peerAPI.NewPeerConnection(getWebRTCConfig())
    if err != nil {
        return nil, fmt.Errorf("failed to create PeerConnection: %w", err)
    }
    log.Printf("PeerConnection created for %s with preferred codec %s", username, preferredCodec)

    peerConnection.OnConnectionStateChange(func(s webrtc.PeerConnectionState) {
        log.Printf("PeerConnection state changed for %s: %s", username, s.String())
        if s == webrtc.PeerConnectionStateDisconnected || s == webrtc.PeerConnectionStateFailed {
            log.Printf("PeerConnection for %s is disconnected or failed, closing resources", username)
            tempPeer := &Peer{
                conn:     conn,
                pc:       peerConnection,
                username: username,
                room:     room,
                isLeader: isLeader,
            }
            go closePeerResources(tempPeer, "PeerConnection failed or disconnected")
            mu.Lock()
            if roomPeers, exists := rooms[room]; exists {
                log.Printf("Removing %s from room %s", username, room)
                delete(roomPeers, username)
                if len(roomPeers) == 0 {
                    log.Printf("Room %s is empty, deleting", room)
                    delete(rooms, room)
                }
            }
            log.Printf("Removing %s from peers (addr: %s)", username, conn.RemoteAddr().String())
            delete(peers, conn.RemoteAddr().String())
            mu.Unlock()
            log.Printf("Sending updated room info for %s", room)
            sendRoomInfo(room)
        }
    })

    peer := &Peer{
        conn:     conn,
        pc:       peerConnection,
        username: username,
        room:     room,
        isLeader: isLeader,
    }

    if isLeader {
        videoTransceiver, err := peerConnection.AddTransceiverFromKind(webrtc.RTPCodecTypeVideo, webrtc.RTPTransceiverInit{
            Direction: webrtc.RTPTransceiverDirectionSendonly,
        })
        if err != nil {
            log.Printf("Failed to add video transceiver for leader %s: %v", username, err)
            conn.WriteJSON(map[string]interface{}{
                "type": "error",
                "data": "Failed to add video transceiver",
            })
            conn.Close()
            return nil, fmt.Errorf("failed to add video transceiver: %w", err)
        }
        go func() {
            time.Sleep(5 * time.Second)
            peer.mu.Lock()
            defer peer.mu.Unlock()
            if videoTransceiver.Sender() == nil || videoTransceiver.Sender().Track() == nil {
                log.Printf("No video track added by leader %s in room %s", username, room)
                if peer.conn != nil {
                    peer.conn.WriteJSON(map[string]interface{}{
                        "type": "error",
                        "data": "No video track detected. Please ensure camera is active.",
                    })
                }
            } else {
                log.Printf("Video track confirmed for leader %s in room %s", username, room)
            }
        }()
    }

    if _, err := peerConnection.AddTransceiverFromKind(webrtc.RTPCodecTypeAudio, webrtc.RTPTransceiverInit{
        Direction: webrtc.RTPTransceiverDirectionSendrecv,
    }); err != nil {
        log.Printf("Failed to add audio transceiver for %s: %v", username, err)
    }

    peerConnection.OnICECandidate(func(c *webrtc.ICECandidate) {
        if c == nil {
            log.Printf("No more ICE candidates for %s", username)
            return
        }
        log.Printf("ICE candidate for %s: %s", username, c.ToJSON().Candidate)
        peer.mu.Lock()
        defer peer.mu.Unlock()
        if peer.conn != nil && isConnAlive(peer.conn) {
            err := peer.conn.WriteJSON(map[string]interface{}{"type": "ice_candidate", "ice": c.ToJSON()})
            if err != nil {
                log.Printf("Error sending ICE candidate to %s: %v", peer.username, err)
                go closePeerResources(peer, "Failed to send ICE candidate")
            }
        }
    })

    if !isLeader {
        peerConnection.OnTrack(func(track *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
            log.Printf("Track received for follower %s in room %s: Codec %s",
                username, room, track.Codec().MimeType)
        })
    }

    rooms[room][username] = peer
    peers[conn.RemoteAddr().String()] = peer

    err = conn.WriteJSON(map[string]interface{}{
        "type": "room_info",
        "data": map[string]interface{}{
            "room":     room,
            "username": username,
            "isLeader": isLeader,
        },
    })
    if err != nil {
        log.Printf("Error sending room_info to %s: %v", username, err)
    } else {
        log.Printf("Sent room_info to %s", username)
    }

    return peer, nil
}

// main осталась вашей функцией
func main() {

    cleanupPeers()
    initializeMediaAPI()
    http.HandleFunc("/wsgo", handleWebSocket)
    http.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
        logStatus()
        w.WriteHeader(http.StatusOK)
        if _, err := w.Write([]byte("Status logged to console")); err != nil {
            log.Printf("Error writing /status response: %v", err)
        }
    })

    log.Println("Server starting on :8085 (Logic: Leader Re-joins on Follower connect)")
    log.Println("WebRTC MediaEngine configured for H.264 (video) and Opus (audio).")
    logStatus() // Логируем статус при запуске
    if err := http.ListenAndServe(":8085", nil); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}

func cleanupPeers() {
    mu.Lock()
    defer mu.Unlock()

    for _, peer := range peers {
        go closePeerResources(peer, "Server cleanup on restart")
    }
    peers = make(map[string]*Peer)
    rooms = make(map[string]map[string]*Peer)
    log.Println("All peers and rooms have been cleaned up")
}

// handleWebSocket осталась вашей функцией с минимальными изменениями для очистки
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("WebSocket upgrade error:", err)
        return
    }
    remoteAddr := conn.RemoteAddr().String()
    log.Printf("New WebSocket connection attempt from: %s", remoteAddr)

    var initData struct {
        Room           string `json:"room"`
        Username       string `json:"username"`
        IsLeader       bool   `json:"isLeader"`
        PreferredCodec string `json:"preferredCodec"`
    }
    conn.SetReadDeadline(time.Now().Add(10 * time.Second))
    err = conn.ReadJSON(&initData)
    conn.SetReadDeadline(time.Time{})

    if err != nil {
        log.Printf("Read init data error from %s: %v. Closing.", remoteAddr, err)
        conn.Close()
        return
    }
    if initData.Room == "" || initData.Username == "" {
        log.Printf("Invalid init data from %s: Room or Username is empty. Closing.", remoteAddr)
        _ = conn.WriteJSON(map[string]interface{}{"type": "error", "data": "Room and Username cannot be empty"})
        conn.Close()
        return
    }

    log.Printf("User '%s' (isLeader: %v, preferredCodec: %s) attempting to join room '%s' from %s",
        initData.Username, initData.IsLeader, initData.PreferredCodec, initData.Room, remoteAddr)

    currentPeer, err := handlePeerJoin(initData.Room, initData.Username, initData.IsLeader, conn, initData.PreferredCodec)
    if err != nil {
        log.Printf("Error handling peer join for %s: %v", initData.Username, err)
        return
    }
    if currentPeer == nil {
        log.Printf("Peer %s was not created. Connection likely closed by handlePeerJoin.", initData.Username)
        return
    }

    log.Printf("User '%s' successfully joined room '%s' as %s", currentPeer.username, currentPeer.room, map[bool]string{true: "leader", false: "follower"}[currentPeer.isLeader])
    logStatus()
    sendRoomInfo(currentPeer.room)

    // Цикл чтения сообщений от клиента
    for {
        msgType, msgBytes, err := conn.ReadMessage()
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure, websocket.CloseNormalClosure, websocket.CloseNoStatusReceived) {
                log.Printf("Unexpected WebSocket close error for %s (%s): %v", currentPeer.username, remoteAddr, err)
            } else {
                log.Printf("WebSocket connection closed/read error for %s (%s): %v", currentPeer.username, remoteAddr, err)
            }
            break
        }

        if msgType != websocket.TextMessage {
            log.Printf("Received non-text message type (%d) from %s. Ignoring.", msgType, currentPeer.username)
            continue
        }
        if len(msgBytes) == 0 {
            continue
        }

        var data map[string]interface{}
        if err := json.Unmarshal(msgBytes, &data); err != nil {
            log.Printf("JSON unmarshal error (for logging type) from %s: %v. Message: %s. Forwarding raw.", currentPeer.username, err, string(msgBytes))
        }
        dataType, _ := data["type"].(string)

        mu.Lock()
        roomPeers := rooms[currentPeer.room]
        var targetPeer *Peer
        if roomPeers != nil {
            for _, p := range roomPeers {
                if p.username != currentPeer.username {
                    targetPeer = p
                    break
                }
            }
        }
        mu.Unlock()

        if targetPeer == nil && (dataType == "offer" || dataType == "answer" || dataType == "ice_candidate") {
            continue
        }

        switch dataType {
        case "offer":
            log.Printf("Received offer from %s: %s", currentPeer.username, string(msgBytes))
            if currentPeer.isLeader && targetPeer != nil && !targetPeer.isLeader {
                log.Printf(">>> Forwarding Offer from %s to %s", currentPeer.username, targetPeer.username)
                preferredCodec, _ := data["preferredCodec"].(string)
                if preferredCodec == "" {
                    preferredCodec = initData.PreferredCodec
                    if preferredCodec == "" {
                        preferredCodec = "H264"
                    }
                }
                if sdp, ok := data["sdp"].(string); ok {
                    data["sdp"] = normalizeSdpForCodec(sdp, preferredCodec)
                    msgBytes, _ = json.Marshal(data)
                }
                targetPeer.mu.Lock()
                targetWsConn := targetPeer.conn
                targetPeer.mu.Unlock()
                if targetWsConn != nil && isConnAlive(targetWsConn) {
                    if err := targetWsConn.WriteMessage(websocket.TextMessage, msgBytes); err != nil {
                        log.Printf("!!! Error forwarding offer to %s: %v", targetPeer.username, err)
                        go closePeerResources(targetPeer, "Failed to forward offer")
                    }
                } else {
                    log.Printf("Target WebSocket connection for %s is not alive, skipping offer forwarding", targetPeer.username)
                }
            } else {
                log.Printf("WARN: Received 'offer' from non-leader or no target.")
            }

        case "answer":
            if targetPeer != nil && !currentPeer.isLeader && targetPeer.isLeader {
                log.Printf("<<< Forwarding Answer from %s to %s", currentPeer.username, targetPeer.username)
                // Нормализуем SDP
                preferredCodec, _ := data["preferredCodec"].(string)
                if preferredCodec == "" {
                    preferredCodec = initData.PreferredCodec
                    if preferredCodec == "" {
                        preferredCodec = "H264"
                    }
                }
                if sdp, ok := data["sdp"].(string); ok {
                    data["sdp"] = normalizeSdpForCodec(sdp, preferredCodec)
                    msgBytes, _ = json.Marshal(data)
                }
                targetPeer.mu.Lock()
                targetWsConn := targetPeer.conn
                targetPeer.mu.Unlock()
                if targetWsConn != nil {
                    if err := targetWsConn.WriteMessage(websocket.TextMessage, msgBytes); err != nil {
                        log.Printf("!!! Error forwarding answer to %s: %v", targetPeer.username, err)
                    }
                }
            } else {
                log.Printf("WARN: Received 'answer' from non-follower or no target leader.")
            }

        case "ice_candidate":
            if targetPeer != nil {
                log.Printf("... Forwarding ICE candidate from %s to %s", currentPeer.username, targetPeer.username)
                targetPeer.mu.Lock()
                targetWsConn := targetPeer.conn
                targetPeer.mu.Unlock()
                if targetWsConn != nil {
                    if err := targetWsConn.WriteMessage(websocket.TextMessage, msgBytes); err != nil {
                        log.Printf("Error forwarding ICE candidate to %s: %v", targetPeer.username, err)
                    }
                }
            }

        case "switch_camera":
            if targetPeer != nil {
                log.Printf("Forwarding '%s' message from %s to %s", dataType, currentPeer.username, targetPeer.username)
                targetPeer.mu.Lock()
                targetWsConn := targetPeer.conn
                targetPeer.mu.Unlock()
                if targetWsConn != nil {
                    if err := targetWsConn.WriteMessage(websocket.TextMessage, msgBytes); err != nil {
                        log.Printf("Error forwarding '%s' to %s: %v", dataType, targetPeer.username, err)
                    }
                }
            }
        default:
            log.Printf("Ignoring message with type '%s' from %s", dataType, currentPeer.username)
        }
    }

    log.Printf("Cleaning up for %s (Addr: %s) in room %s after WebSocket loop ended.", currentPeer.username, remoteAddr, currentPeer.room)
    go closePeerResources(currentPeer, "WebSocket read loop ended")

    mu.Lock()
    roomName := currentPeer.room
    if currentRoomPeers, roomExists := rooms[roomName]; roomExists {
        delete(currentRoomPeers, currentPeer.username)
        if len(currentRoomPeers) == 0 {
            delete(rooms, roomName)
            log.Printf("Room %s is now empty and has been deleted.", roomName)
            roomName = ""
        }
    }
    delete(peers, remoteAddr)
    mu.Unlock()

    logStatus()
    if roomName != "" {
        sendRoomInfo(roomName)
    }
    log.Printf("Cleanup complete for WebSocket connection %s (User: %s)", remoteAddr, currentPeer.username)
}