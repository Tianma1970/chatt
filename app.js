//anonym function
;(function () {
  let dataConnection = null
  //our querySelectors
  //Event Listener for click peer button
  const peers = document.querySelector(".peers")

  //Event Listener for send button
  const sendButtonEl = document.querySelector(".send-new-message-button")

  const messagesEl = document.querySelector(".messages")

  const newMessageEl = document.querySelector(".new-message")

  //Get peer id (hash) from URL
  const peerId = location.hash.slice(1)

  const printMessage = (text, who) => {
    const messageContainer = document.createElement("div")
    messageContainer.classList.add("message", who)
    messageContainer.innerHTML = `<div>${text}</div>`
    messagesEl.append(messageContainer)
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

  //On incmming connection
  peer.on("connection", connection => {
    console.log(connection)

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
          if (peerId === peer._id) return false
          return true
        }) //remove our own name
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
    dataConnection = peer.connect(theirPeerId)

    dataConnection.on("open", () => {
      console.log("connection open")
      //Dispatch Custom Event with connected peer id
      const event = new CustomEvent("peer-changed", {
        detail: theirPeerId
      })
      document.dispatchEvent(event)
      // dataConnection = connection
    })
  })

  document.addEventListener("peer-changed", e => {
    console.log(e)
    const peerId = e.detail

    const connectButtonEl = document.querySelector(`.connect-button.peerId-${peerId}`)
    //Remove class 'connected' from button
    document.querySelectorAll(".connect-button").forEach(button => {
      button.classList.remove("connected")
    })
    //Add class 'connected' to clicked button
    connectButtonEl.classList.add("connected")

    dataConnection.on("data", textMessage => {
      printMessage(textMessage, "them")
    })
  })

  //EventListener for click on send
  sendButtonEl.addEventListener("click", () => {
    //Get new message from text input
    const message = document.querySelector(".new-message")
    console.log(message.value)
    if (!dataConnection) return

    //Get new message from text input
    dataConnection.send(newMessageEl.value)
    printMessage(newMessageEl.value, "me")
  })
  newMessageEl.addEventListener("keyup", e => {
    if (!dataConnection) return

    if (e.keyCode === 13) {
      dataConnection.send(newMessageEl.value)
      printMessage(newMessageEl.value, "me")
    }
  })
})() //end of anonym function. we need to add '()'
