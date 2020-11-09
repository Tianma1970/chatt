//anonym function
;(function () {
  let dataConnection = null

  let mediaConnection = null

  //our querySelectors
  const peers = document.querySelector(".peers")
  const sendButtonEl = document.querySelector(".send-new-message-button")
  const messagesEl = document.querySelector(".messages")
  const newMessageEl = document.querySelector(".new-message")
  const theirVideoContainer = document.querySelector(".video-container.them")
  const videoOfThemEl = document.querySelector(".video-container.them video")
  const videoOfMeEl = document.querySelector(".video-container.me video")
  const start = theirVideoContainer.querySelector(".start")
  const stop = theirVideoContainer.querySelector(".stop")

  navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(stream => {
    videoOfMeEl.muted = true
    videoOfMeEl.srcObject = stream
  })

  //Get peer id (hash) from URL
  const peerId = location.hash.slice(1)

  const printMessage = (text, who) => {
    const messageContainer = document.createElement("div")
    messageContainer.classList.add("message", who)
    messageContainer.innerHTML = `<div>${text}</div>`
    messagesEl.append(messageContainer)
    messagesEl.scrollTop = messagesEl.scrollHeight
  }

  //Connect to peer server

  let peer = new Peer(peerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        { urls: ["stun:eu-turn7.xirsys.com"] },
        {
          username: "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          urls: ["turn:eu-turn7.xirsys.com:80?transport=udp", "turn:eu-turn7.xirsys.com:3478?transport=udp", "turn:eu-turn7.xirsys.com:80?transport=tcp", "turn:eu-turn7.xirsys.com:3478?transport=tcp", "turns:eu-turn7.xirsys.com:443?transport=tcp", "turns:eu-turn7.xirsys.com:5349?transport=tcp"]
        }
      ]
    }
  })

  peer.on("open", id => {
    const peerIdEl = document.querySelector(".my-peer-id")

    peerIdEl.innerText = id
  })
  //we need to ensure, we are connected to the server
  peer.on("error", errorMessage => {
    console.error(errorMessage)
  })

  //EventListener for incoming video call
  peer.on("call", incomingCall => {
    mediaConnection && mediaConnection.close()

    //Answer incoming call
    navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(myStream => {
      incomingCall.answer(myStream)
      mediaConnection = incomingCall
      mediaConnection.on("stream", theirStream => {
        videoOfThemEl.muted = true
        videoOfThemEl.srcObject = theirStream
      })
    })
  })
  //On incmming connection
  peer.on("connection", connection => {
    //close existing connection
    dataConnection && dataConnection.close()
    //console.log(connection)

    //set new connection
    dataConnection = connection

    const event = new CustomEvent("peer-changed", { detail: connection.peer })
    document.dispatchEvent(event)
  })

  // Event listener for click "Refresh list"
  const refreshPeersListButtonEl = document.querySelector(".list-all-peers-button")
  refreshPeersListButtonEl.addEventListener("click", () => {
    peer.listAllPeers(peers => {
      const peerListEl = document.querySelector(".peers")
      const peerEl = peers
        .filter(peerId => {
          //remove our own name
          if (peerId === peer._id) return false
          return true
        })
        .map(peer => {
          return `<li><button class="connect-button peerId-${peer}">${peer}</button></li>`
        })
        .join("")

      const ulEl = document.createElement("ul")
      ulEl.innerHTML = peerEl
      peerListEl.appendChild(ulEl)
    })
  })
  //connect to peer
  peers.addEventListener("click", event => {
    if (!event.target.classList.contains("connect-button")) return

    const peerName = event.target.innerText

    //close existing connection
    dataConnection && dataConnection.close()

    //connect to peer
    const theirPeerId = event.target.innerText
    console.log(theirPeerId)
    dataConnection = peer.connect(theirPeerId)

    dataConnection.on("open", () => {
      console.log("connection open")
      //Dispatch Custom Event with connected peer id
      const event = new CustomEvent("peer-changed", {
        detail: theirPeerId
      })
      document.dispatchEvent(event)
    })
  })

  document.addEventListener("peer-changed", e => {
    console.log(e)
    const peerId = e.detail

    const connectButtonEl = document.querySelector(`.connect-button.peerId-${peerId}`)

    document.querySelectorAll(".connect-button").forEach(button => {
      button.classList.remove("connected")
    })

    connectButtonEl.classList.add("connected")
    const date = new Date().toUTCString()

    console.log(date)
    dataConnection.on("data", textMessage => {
      printMessage("<b>" + peerId + ": " + "</b>" + textMessage + " " + "<br><i>recieved on: </i>" + date, "them")
    })
    newMessageEl.focus()

    const theirVideoContainer = document.querySelector(".video-container.them")
    theirVideoContainer.querySelector(".name").innerText = peerId
    theirVideoContainer.classList.add("connected")
    theirVideoContainer.querySelector(".start").classList.add(".active")
    theirVideoContainer.querySelector(".stop").classList.remove(".active")
  })

  //clear text input field
  newMessageEl.value = ""

  const sendMessage = e => {
    if (!dataConnection) return

    if (e.type === "click" || e.keyCode === 13) {
      dataConnection.send(newMessageEl.value)
      printMessage("<b>" + peerId + ": " + "</b>" + newMessageEl.value, "me")
      //clear text input field
      newMessageEl.value = ""
    }
  }
  //EventListener for click on send
  sendButtonEl.addEventListener("click", sendMessage)
  newMessageEl.addEventListener("keyup", sendMessage)

  //Event Listener for click 'Start video chatt'

  start.addEventListener("click", () => {
    start.classList.remove("active")
    stop.classList.add("active")
    //Start video call with remote peer
    navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(myStream => {
      mediaConnection && mediaConnection.close()

      const theirPeerId = dataConnection.peer
      mediaConnection = peer.call(theirPeerId, myStream)
      mediaConnection.on("stream", theirStream => {
        videoOfThemEl.muted = true
        videoOfThemEl.srcObject = theirStream
      })
    })
  })

  // EventListener for click 'Hang up'
  stop.addEventListener("click", () => {
    stop.classList.remove("active")
    start.classList.add("active")
    mediaConnection && mediaConnection.close()
  })
})() //end of anonym function. we need to add '()' in order to invoke the function
